import { ResumeSignals, createEmptyResumeSignals } from './careerStage';

const RESUME_PARSING_PROMPT = `You are an expert resume parser. Analyze the following resume text and extract structured career information.

Extract the following information in JSON format:
{
  "name": "<full name of the person, extracted from the resume header or contact section>",
  "yearsExperience": <number of years of professional experience, calculated from work history>,
  "roleCount": <number of distinct jobs/roles held>,
  "titles": [<array of job titles found in the resume>],
  "graduationYear": <year of most recent graduation, or null if not found>,
  "seniorityHints": [<array of seniority keywords found like "senior", "junior", "lead", "manager", "director", etc.>]
}

Important guidelines:
- For name: Extract the full name from the resume header or contact information section. Return null if not found.
- For yearsExperience: Calculate based on work history dates. If dates are unclear, estimate conservatively.
- For roleCount: Count distinct positions/roles, not employers.
- For titles: Extract exact job titles as written.
- For graduationYear: Look for education section and extract most recent graduation year.
- For seniorityHints: Extract keywords that indicate career level (senior, junior, lead, manager, director, VP, head, principal, staff, etc.)
- If information is not available, use null for numbers and empty array for arrays.
- Return ONLY valid JSON, no additional text.

Resume text:
`;

/**
 * Extracts career signals from resume text using Azure OpenAI
 */
export async function extractCareerSignalsFromResume(resumeText: string): Promise<ResumeSignals> {
  if (!resumeText || resumeText.trim().length === 0) {
    return createEmptyResumeSignals();
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  if (!endpoint || !apiKey || !deployment) {
    console.error('Azure OpenAI environment variables not configured');
    return createEmptyResumeSignals();
  }

  try {
    const response = await fetch(
      `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume parser that extracts structured career information and returns valid JSON.',
            },
            {
              role: 'user',
              content: RESUME_PARSING_PROMPT + resumeText,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      return createEmptyResumeSignals();
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;
    
    if (!responseText) {
      console.error('No response from Azure OpenAI for resume parsing');
      return createEmptyResumeSignals();
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseText);

    // Validate and sanitize the response
    const signals: ResumeSignals = {
      name: typeof parsed.name === 'string' ? parsed.name : null,
      yearsExperience: typeof parsed.yearsExperience === 'number' ? parsed.yearsExperience : null,
      roleCount: typeof parsed.roleCount === 'number' ? parsed.roleCount : null,
      titles: Array.isArray(parsed.titles) ? parsed.titles.filter((t: any) => typeof t === 'string') : [],
      graduationYear: typeof parsed.graduationYear === 'number' ? parsed.graduationYear : null,
      seniorityHints: Array.isArray(parsed.seniorityHints) ? parsed.seniorityHints.filter((h: any) => typeof h === 'string') : [],
    };

    return signals;
  } catch (error) {
    console.error('Error parsing resume with Azure OpenAI:', error);
    // Return safe fallback
    return createEmptyResumeSignals();
  }
}
