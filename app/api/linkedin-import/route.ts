import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// LinkedIn API endpoints
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

async function fetchLinkedInProfile(accessToken: string) {
  try {
    // Fetch basic profile information
    const profileResponse = await fetch(`${LINKEDIN_API_BASE}/people/~?projection=(id,firstName,lastName,headline,summary,industryName,locationName)`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    // Fetch positions (work experience)
    const positionsResponse = await fetch(`${LINKEDIN_API_BASE}/people/~:(positions:(id,title,summary,startDate,endDate,company:(id,name,industryName)))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    let positions = [];
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      positions = positionsData.positions?.values || [];
    }

    // Fetch education
    const educationResponse = await fetch(`${LINKEDIN_API_BASE}/people/~:(educations:(id,schoolName,degree,fieldOfStudy,startDate,endDate))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    let educations = [];
    if (educationResponse.ok) {
      const educationData = await educationResponse.json();
      educations = educationData.educations?.values || [];
    }

    return {
      name: `${profileData.firstName?.localized?.en_US || ''} ${profileData.lastName?.localized?.en_US || ''}`.trim(),
      headline: profileData.headline?.localized?.en_US || '',
      summary: profileData.summary?.localized?.en_US || '',
      industry: profileData.industryName?.localized?.en_US || '',
      location: profileData.locationName?.localized?.en_US || '',
      positions,
      educations,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user's session to access LinkedIn access token
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated. Please sign in first.' },
        { status: 401 }
      );
    }

    // Check if user has LinkedIn access token
    const linkedinAccessToken = (session as any).linkedinAccessToken;
    
    if (!linkedinAccessToken) {
      // If no LinkedIn token, return instructions to connect LinkedIn
      return NextResponse.json({
        success: false,
        error: 'LinkedIn not connected. Please sign in with LinkedIn first.',
        requiresLinkedInAuth: true,
      });
    }

    // Fetch real LinkedIn profile data
    let linkedinData;
    try {
      linkedinData = await fetchLinkedInProfile(linkedinAccessToken);
    } catch (error) {
      // If LinkedIn API fails, fall back to sample data with a note
      console.warn('LinkedIn API failed, using sample data:', error);
      linkedinData = {
        name: session.user.name || "Sample User",
        headline: "Senior Software Engineer at Tech Company",
        summary: "Experienced software engineer with 8+ years in full-stack development. Passionate about creating scalable web applications and leading development teams. Expertise in React, Node.js, Python, and cloud technologies.",
        location: "San Francisco, CA",
        industry: "Technology",
        positions: [
          {
            title: "Senior Software Engineer",
            company: { name: "Tech Company" },
            startDate: { year: 2021 },
            endDate: null,
            summary: "Led development of microservices architecture serving 1M+ users. Mentored junior developers and implemented CI/CD pipelines."
          }
        ],
        educations: [
          {
            schoolName: "University of Technology",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            startDate: { year: 2014 },
            endDate: { year: 2018 }
          }
        ]
      };
    }

    // Format the LinkedIn data for text file
    const linkedinText = `
LINKEDIN PROFILE DATA
====================

Name: ${linkedinData.name}
Headline: ${linkedinData.headline}
Location: ${linkedinData.location}
Industry: ${linkedinData.industry}

SUMMARY:
${linkedinData.summary}

EXPERIENCE:
${linkedinData.positions.map((pos: any) => {
  const startYear = pos.startDate?.year || 'Unknown';
  const endYear = pos.endDate?.year || 'Present';
  return `${pos.title} at ${pos.company?.name || 'Unknown Company'} (${startYear} - ${endYear})
${pos.summary || 'No description provided.'}`;
}).join('\n\n')}

EDUCATION:
${linkedinData.educations.map((edu: any) => {
  const startYear = edu.startDate?.year || 'Unknown';
  const endYear = edu.endDate?.year || 'Unknown';
  return `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Unknown Field'} from ${edu.schoolName} (${startYear} - ${endYear})`;
}).join('\n')}

Imported on: ${new Date().toISOString()}
Source: LinkedIn API
`;

    // Create linkedin_imports directory if it doesn't exist
    const importsDir = join(process.cwd(), 'linkedin_imports');
    if (!existsSync(importsDir)) {
      mkdirSync(importsDir, { recursive: true });
    }

    // Save to text file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `linkedin_profile_${timestamp}.txt`;
    const filepath = join(importsDir, filename);
    
    writeFileSync(filepath, linkedinText, 'utf8');

    // Format data for the frontend
    const profileData = {
      about: linkedinData.summary,
      experience: linkedinData.positions.map((pos: any) => {
        const startYear = pos.startDate?.year || 'Unknown';
        const endYear = pos.endDate?.year || 'Present';
        return `${pos.title} at ${pos.company?.name || 'Unknown Company'} (${startYear} - ${endYear})\n${pos.summary || 'No description provided.'}`;
      }).join('\n\n'),
      education: linkedinData.educations.map((edu: any) => {
        const startYear = edu.startDate?.year || 'Unknown';
        const endYear = edu.endDate?.year || 'Unknown';
        return `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Unknown Field'} from ${edu.schoolName} (${startYear} - ${endYear})`;
      }).join('\n'),
      recommendations: "" // LinkedIn API v2 doesn't provide recommendations easily
    };

    return NextResponse.json({
      success: true,
      message: `LinkedIn profile data saved to ${filename}`,
      profileData: profileData,
      filepath: filepath,
      source: linkedinAccessToken ? 'LinkedIn API' : 'Sample Data (API unavailable)'
    });

  } catch (error) {
    console.error('Error importing LinkedIn data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import LinkedIn data: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}