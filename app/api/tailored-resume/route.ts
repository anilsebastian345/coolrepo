import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';

type TailoredResumeRequest = {
  jobDescription: string;
  resumeText: string;
  downloadDocx?: boolean;
};

type ResumeItem = {
  role: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
};

type ResumeSection = {
  title: string;
  items?: ResumeItem[];
  content?: string; // For skills or summary sections
};

type TailoredResumeData = {
  headline: string;
  summary: string;
  sections: ResumeSection[];
};

export async function POST(req: NextRequest) {
  try {
    const body: TailoredResumeRequest = await req.json();
    const { jobDescription, resumeText, downloadDocx = true } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Build the prompt for tailoring the resume
    const prompt = buildTailoredResumePrompt(jobDescription, resumeText);

    // Call Azure OpenAI
    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume writer who ONLY rewrites existing resume content. You never fabricate or add information not present in the original resume.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 5000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate tailored resume', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content received from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let tailoredResume: TailoredResumeData;
    try {
      const parsed = JSON.parse(content);
      tailoredResume = parsed.resume || parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: String(parseError) },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!tailoredResume.headline || !tailoredResume.sections) {
      return NextResponse.json(
        { error: 'Invalid response structure: missing required fields' },
        { status: 500 }
      );
    }

    // If downloadDocx is false, return JSON for preview
    if (!downloadDocx) {
      return NextResponse.json({ resume: tailoredResume });
    }

    // Generate the Word document
    const docBuffer = await generateWordDocument(tailoredResume);

    // Return the .docx file
    return new NextResponse(new Uint8Array(docBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="sage-tailored-resume.docx"',
      },
    });
  } catch (error) {
    console.error('Tailored resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

function buildTailoredResumePrompt(jobDescription: string, resumeText: string): string {
  return `You are a professional resume writer helping a candidate tailor their EXISTING resume for a specific job.

CRITICAL RULES - NON-NEGOTIABLE:
1. You MUST use ONLY the information from the candidate's resume below
2. You must NOT fabricate or invent:
   - New job titles
   - New companies or employers  
   - New responsibilities not explicitly stated in the resume
   - New metrics, numbers, or achievements
   - New skills not mentioned in the resume
   - New projects or accomplishments

3. You CAN ONLY:
   - Rewrite existing bullets to emphasize relevant experience
   - Reorder sections to put most relevant content first
   - Combine similar points from the resume for clarity
   - Use stronger action verbs for existing accomplishments
   - Adjust phrasing of EXISTING content to match job description keywords
   - Select which parts of the resume to emphasize

4. EVERY job title, company, date range, skill, and accomplishment MUST come directly from the resume below
5. If the job requires something not in the resume, DO NOT add it. Simply omit it.

----
CANDIDATE'S ACTUAL RESUME (USE THIS DATA):
${resumeText}

----
TARGET JOB DESCRIPTION:
${jobDescription}

----
YOUR TASK:

Analyze the candidate's ACTUAL resume above and rewrite it to better match the job description.

Step 1: Extract from the resume:
- All job titles, companies, locations, and date ranges exactly as they appear
- All accomplishments and responsibilities
- All skills mentioned
- Education details

Step 2: For each role in the resume:
- Identify which accomplishments are most relevant to the target job
- Rewrite those bullets using keywords from the job description
- Keep the same facts, just reword for impact

Step 3: Reorder the experience to put the most relevant roles first

Output a JSON object with this EXACT structure:

{
  "resume": {
    "headline": "Professional headline based on their actual background and the target role",
    "summary": "2-3 sentence summary using their ACTUAL experience and accomplishments from the resume, positioned for this role",
    "sections": [
      {
        "title": "Professional Experience",
        "items": [
          {
            "role": "EXACT job title from their resume",
            "company": "EXACT company name from their resume",
            "location": "EXACT location from their resume",
            "dates": "EXACT date range from their resume",
            "bullets": [
              "Rewritten version of an ACTUAL bullet from this role, emphasizing relevance",
              "Another ACTUAL accomplishment from this role, reworded with strong verbs",
              "Include 3-5 of their MOST relevant bullets for this role"
            ]
          }
        ]
      },
      {
        "title": "Skills",
        "content": "Comma-separated list of skills that appear in their resume, ordered by relevance to job description"
      },
      {
        "title": "Education",
        "items": [
          {
            "role": "Their ACTUAL degree and major",
            "company": "Their ACTUAL university name",
            "location": "ACTUAL location",
            "dates": "ACTUAL graduation year",
            "bullets": []
          }
        ]
      }
    ]
  }
}

VERIFICATION BEFORE OUTPUTTING:
- Check: Does every company name appear in the original resume? (If no, DELETE it)
- Check: Does every job title appear in the original resume? (If no, DELETE it)  
- Check: Are the date ranges from the original resume? (If no, FIX them)
- Check: Are the accomplishments based on what's actually in the resume? (If no, REWRITE them)

Return ONLY valid JSON, no other text.`;
}

async function generateWordDocument(resume: TailoredResumeData): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children: [
          // Headline
          new Paragraph({
            text: resume.headline,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),

          // Summary
          new Paragraph({
            text: resume.summary,
            spacing: {
              after: 300,
            },
          }),

          // Sections
          ...resume.sections.flatMap((section) => {
            const sectionParagraphs: Paragraph[] = [];

            // Section title
            sectionParagraphs.push(
              new Paragraph({
                text: section.title.toUpperCase(),
                heading: HeadingLevel.HEADING_2,
                spacing: {
                  before: 240,
                  after: 120,
                },
                border: {
                  bottom: {
                    color: '000000',
                    space: 1,
                    style: 'single',
                    size: 6,
                  },
                },
              })
            );

            // Section content (for skills or other text sections)
            if (section.content) {
              sectionParagraphs.push(
                new Paragraph({
                  text: section.content,
                  spacing: {
                    after: 200,
                  },
                })
              );
            }

            // Section items (for experience, education, etc.)
            if (section.items) {
              section.items.forEach((item) => {
                // Role and company line
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: item.role,
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text: item.company ? ` | ${item.company}` : '',
                        size: 24,
                      }),
                      new TextRun({
                        text: item.location ? ` | ${item.location}` : '',
                        size: 24,
                      }),
                    ],
                    spacing: {
                      after: 100,
                    },
                  })
                );

                // Dates
                if (item.dates) {
                  sectionParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.dates,
                          italics: true,
                        }),
                      ],
                      spacing: {
                        after: 120,
                      },
                    })
                  );
                }

                // Bullets
                if (item.bullets && item.bullets.length > 0) {
                  item.bullets.forEach((bullet) => {
                    sectionParagraphs.push(
                      new Paragraph({
                        text: bullet,
                        bullet: {
                          level: 0,
                        },
                        spacing: {
                          after: 100,
                        },
                      })
                    );
                  });

                  // Add spacing after bullet list
                  sectionParagraphs.push(
                    new Paragraph({
                      text: '',
                      spacing: {
                        after: 120,
                      },
                    })
                  );
                }
              });
            }

            return sectionParagraphs;
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
