import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { AzureOpenAI } from 'openai';
import { chromium } from 'playwright-core';

export const maxDuration = 60; // Allow up to 60 seconds for browser rendering

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
});

const RequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = RequestSchema.parse(body);

    // Reject LinkedIn URLs up front
    const urlObj = new URL(url);
    if (urlObj.hostname.endsWith('linkedin.com')) {
      return NextResponse.json(
        { 
          error: 'LinkedIn requires login. Please copy/paste the job description instead.',
          code: 'LINKEDIN_NOT_SUPPORTED'
        },
        { status: 400 }
      );
    }

    // Fetch HTML
    const html = await fetchHtml(url);
    if (!html) {
      return NextResponse.json(
        { error: 'Could not load this URL. The page may require login or block automated access.' },
        { status: 400 }
      );
    }

    console.log('HTML fetched, length:', html.length);

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Try JSON-LD JobPosting extraction first
    const schemaData = extractFromJobPostingSchema($);
    if (schemaData) {
      console.log('Extracted from JSON-LD schema');
      return NextResponse.json({
        jobTitle: schemaData.jobTitle,
        companyName: schemaData.companyName,
        jobDescription: schemaData.jobDescription,
      });
    }

    // Fall back to heuristic + LLM
    const mainText = extractMainText($);
    console.log('Main text length:', mainText.length);
    
    if (mainText.length < 200) {
      return NextResponse.json(
        { error: 'This page does not contain enough text. It may require login or use heavy JavaScript rendering.' },
        { status: 400 }
      );
    }

    // Call OpenAI to extract fields
    const llmData = await extractWithLlm(mainText);
    if (!llmData) {
      return NextResponse.json(
        { error: 'Could not reliably extract a job description from this URL.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      jobTitle: llmData.jobTitle,
      companyName: llmData.companyName,
      jobDescription: llmData.jobDescription,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    console.error('Unexpected error in job-from-url:', error);
    return NextResponse.json(
      { error: 'Unexpected error while analyzing job URL.' },
      { status: 500 }
    );
  }
}

/**
 * Fetch HTML from the given URL with appropriate headers
 * Tries simple fetch first, falls back to Playwright if content is too short
 */
async function fetchHtml(url: string): Promise<string | null> {
  try {
    // First attempt: simple fetch (fast)
    console.log('Attempting simple fetch for:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      return null;
    }

    let html = await response.text();
    
    // Check if page appears to be JavaScript-rendered (very little content)
    const $ = cheerio.load(html);
    $('script, style').remove();
    const textContent = $('body').text().trim();
    
    console.log('Initial text length:', textContent.length);
    
    // If content is suspiciously short or has loading indicators, use browser
    // Workday sites are heavily JavaScript-rendered and need Playwright
    const isWorkday = url.includes('myworkdayjobs.com');
    
    if (isWorkday || 
        textContent.length < 500 || 
        textContent.toLowerCase().includes('loading...') ||
        textContent.toLowerCase().includes('please enable javascript')) {
      
      console.log('Page appears JavaScript-rendered (or Workday site), using Playwright...');
      const browserHtml = await fetchWithBrowser(url);
      if (!browserHtml) {
        return null;
      }
      html = browserHtml;
    }

    return html;
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return null;
  }
}

/**
 * Fetch HTML using Playwright for JavaScript-rendered pages
 */
async function fetchWithBrowser(url: string): Promise<string | null> {
  let browser;
  try {
    console.log('Launching Playwright browser for:', url);
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set longer timeout for Workday sites
    const timeout = url.includes('myworkdayjobs.com') ? 45000 : 30000;
    
    // Try to load the page with a more lenient wait condition
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      console.log('Page loaded with domcontentloaded');
    } catch (gotoError) {
      // If even domcontentloaded times out, try with 'load'
      console.log('domcontentloaded timed out, trying with load...');
      try {
        await page.goto(url, { waitUntil: 'load', timeout });
        console.log('Page loaded with load');
      } catch (loadError) {
        console.log('Both wait conditions failed, proceeding with networkidle...');
        await page.goto(url, { waitUntil: 'networkidle', timeout });
      }
    }
    
    // Wait for content to load - longer for Workday
    const waitTime = url.includes('myworkdayjobs.com') ? 8000 : 5000;
    console.log(`Waiting ${waitTime}ms for content to render...`);
    await page.waitForTimeout(waitTime);
    
    const html = await page.content();
    await browser.close();
    
    console.log('Successfully fetched with Playwright, HTML length:', html.length);
    return html;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Playwright error:', error);
    return null;
  }
}

/**
 * Extract job posting data from JSON-LD schema.org markup
 */
function extractFromJobPostingSchema($: cheerio.CheerioAPI): {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
} | null {
  try {
    const scripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html();
      if (!scriptContent) continue;

      try {
        const data = JSON.parse(scriptContent);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // Check if this is a JobPosting type
          const isJobPosting = 
            item['@type'] === 'JobPosting' ||
            (Array.isArray(item['@type']) && item['@type'].includes('JobPosting'));

          if (isJobPosting) {
            const title = item.title || item.jobTitle;
            const company = item.hiringOrganization?.name || item.employer?.name;
            const description = item.description;

            if (title && description) {
              return {
                jobTitle: title,
                companyName: company || '',
                jobDescription: stripHtml(description),
              };
            }
          }
        }
      } catch (parseError) {
        // Skip malformed JSON
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting from JobPosting schema:', error);
    return null;
  }
}

/**
 * Extract the main text content from the page
 * Prefers <main> element, otherwise finds the div with the most text
 */
function extractMainText($: cheerio.CheerioAPI): string {
  // Remove unwanted elements
  $('script, style, nav, header, footer, [role="navigation"]').remove();

  // Try <main> element first
  const main = $('main');
  if (main.length > 0) {
    const text = main.text();
    return normalizeWhitespace(text).substring(0, 12000);
  }

  // Find the div with the most text content
  let maxLength = 0;
  let bestDiv = '';

  $('div').each((_, elem) => {
    const text = $(elem).text();
    if (text.length > maxLength) {
      maxLength = text.length;
      bestDiv = text;
    }
  });

  if (bestDiv) {
    return normalizeWhitespace(bestDiv).substring(0, 12000);
  }

  // Fallback to body
  return normalizeWhitespace($('body').text()).substring(0, 12000);
}

/**
 * Normalize whitespace in text
 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return normalizeWhitespace($.text());
}

/**
 * Use LLM to extract job posting details from page text
 */
async function extractWithLlm(pageText: string): Promise<{
  jobTitle: string;
  companyName: string;
  jobDescription: string;
} | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are parsing the text of a job posting webpage. Extract the job title, company name, and full job description.

Return ONLY valid JSON in this exact format:
{
  "jobTitle": "the job title",
  "companyName": "the company name",
  "jobDescription": "the complete job description with all requirements, responsibilities, and details"
}

If this is clearly NOT a job posting (e.g., a homepage, talent community signup, or error page), return the exact string: NOT_JOB_POSTING`
        },
        {
          role: 'user',
          content: `Extract job information from this webpage text:\n\n${pageText}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      return null;
    }

    // Check if model says it's not a job posting
    if (result.includes('NOT_JOB_POSTING')) {
      return null;
    }

    const parsed = JSON.parse(result);
    
    // Validate required fields
    if (!parsed.jobTitle || !parsed.jobDescription) {
      return null;
    }

    return {
      jobTitle: parsed.jobTitle,
      companyName: parsed.companyName || '',
      jobDescription: parsed.jobDescription,
    };

  } catch (error) {
    console.error('Error in LLM extraction:', error);
    return null;
  }
}
