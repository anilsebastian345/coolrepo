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
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
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
  return `You are a professional resume writer helping a candidate tailor their resume for a specific job.

CRITICAL RULES:
1. You must NOT fabricate or invent:
   - New job titles
   - New companies or employers
   - New responsibilities not implied by the resume
   - New metrics, numbers, or achievements
   - New skills not mentioned in the resume

2. You CAN:
   - Rewrite bullets to emphasize relevant experience
   - Reorder sections to put most relevant content first
   - Combine similar points for clarity
   - Use stronger action verbs
   - Adjust phrasing to match job description keywords

3. If the job requires something not in the resume, DO NOT add it. Leave gaps as gaps.

----
ORIGINAL RESUME:
${resumeText}

----
JOB DESCRIPTION:
${jobDescription}

----
YOUR TASK:

Create a tailored version of this resume optimized for the job description above.

Output a JSON object with this EXACT structure:

{
  "resume": {
    "headline": "Professional headline/title (e.g., 'Senior Product Manager | Digital Transformation Leader')",
    "summary": "A 2-3 sentence professional summary tailored to this role, highlighting the most relevant experience and value proposition.",
    "sections": [
      {
        "title": "Professional Experience",
        "items": [
          {
            "role": "Job title from resume",
            "company": "Company name from resume",
            "location": "City, State/Country",
            "dates": "Month Year – Month Year (or Present)",
            "bullets": [
              "Rewritten bullet point emphasizing relevance to target role",
              "Another bullet with strong action verbs and quantifiable impact",
              "3-5 bullets per role, most relevant first"
            ]
          }
        ]
      },
      {
        "title": "Skills",
        "content": "Comma-separated list of relevant skills from the resume, ordered by relevance to the job description"
      },
      {
        "title": "Education",
        "items": [
          {
            "role": "Degree and major",
            "company": "University name",
            "location": "City, State",
            "dates": "Year",
            "bullets": []
          }
        ]
      }
    ]
  }
}

IMPORTANT:
- Put the most relevant experience first
- Emphasize accomplishments that match the job description
- Use keywords from the job description naturally
- Keep all information truthful and based on the original resume
- Return ONLY valid JSON, no other text`;
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
