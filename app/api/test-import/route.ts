import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    // Sample LinkedIn data for testing
    const sampleData = {
      name: "Test User",
      headline: "Senior Software Engineer & AI Coach Enthusiast",
      summary: "Passionate technology professional with expertise in full-stack development, artificial intelligence, and career coaching. Currently exploring innovative AI-powered solutions for professional development and career advancement.",
      location: "San Francisco, CA",
      industry: "Technology",
      positions: [
        {
          title: "Senior Software Engineer",
          company: { name: "Tech Innovation Corp" },
          startDate: { year: 2021 },
          endDate: null,
          summary: "Leading development of AI-powered applications and mentoring junior developers. Specializing in React, Node.js, and machine learning integration."
        },
        {
          title: "Software Engineer",
          company: { name: "StartupXYZ" },
          startDate: { year: 2019 },
          endDate: { year: 2021 },
          summary: "Built scalable web applications and implemented automated testing frameworks. Worked on microservices architecture and cloud deployment."
        }
      ],
      educations: [
        {
          schoolName: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startDate: { year: 2015 },
          endDate: { year: 2019 }
        }
      ]
    };

    // Format the LinkedIn data for text file
    const linkedinText = `
LINKEDIN PROFILE DATA (TEST IMPORT)
===================================

Name: ${sampleData.name}
Headline: ${sampleData.headline}
Location: ${sampleData.location}
Industry: ${sampleData.industry}

SUMMARY:
${sampleData.summary}

EXPERIENCE:
${sampleData.positions.map((pos: any) => {
  const startYear = pos.startDate?.year || 'Unknown';
  const endYear = pos.endDate?.year || 'Present';
  return `${pos.title} at ${pos.company?.name || 'Unknown Company'} (${startYear} - ${endYear})
${pos.summary || 'No description provided.'}`;
}).join('\n\n')}

EDUCATION:
${sampleData.educations.map((edu: any) => {
  const startYear = edu.startDate?.year || 'Unknown';
  const endYear = edu.endDate?.year || 'Unknown';
  return `${edu.degree} in ${edu.fieldOfStudy} from ${edu.schoolName} (${startYear} - ${endYear})`;
}).join('\n\n')}

IMPORTED ON: ${new Date().toISOString()}
IMPORT TYPE: Test Import (LinkedIn API Bypass)
`;

    // Create linkedin_imports directory if it doesn't exist
    const importsDir = join(process.cwd(), 'linkedin_imports');
    if (!existsSync(importsDir)) {
      mkdirSync(importsDir, { recursive: true });
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `linkedin_profile_test_${timestamp}.txt`;
    const filepath = join(importsDir, filename);

    // Write the LinkedIn data to file
    writeFileSync(filepath, linkedinText, 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'LinkedIn information imported successfully (test mode)',
      filename: filename,
      data: sampleData
    });

  } catch (error) {
    console.error('Error in test import:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import test LinkedIn information', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}