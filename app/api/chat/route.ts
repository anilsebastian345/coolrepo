import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface UserProfile {
  archetype: string;
  core_drives_and_values: string;
  cognitive_style: string;
  leadership_style: string;
  communication_style: string;
  risk_and_ambition: string;
  growth_and_blind_spots: string;
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, conversationHistory } = await request.json();

    if (!message || !userProfile) {
      return NextResponse.json(
        { error: 'Message and user profile are required' },
        { status: 400 }
      );
    }

    // Create a context-aware prompt for the AI coach
    const systemPrompt = `You are Sage, an AI coach who has deep knowledge of the user's psychographic profile. 

User Profile:
- Archetype: ${userProfile.archetype}
- Core Drives & Values: ${userProfile.core_drives_and_values}
- Cognitive Style: ${userProfile.cognitive_style}
- Leadership Style: ${userProfile.leadership_style}
- Communication Style: ${userProfile.communication_style}
- Risk & Ambition: ${userProfile.risk_and_ambition}
- Growth & Blind Spots: ${userProfile.growth_and_blind_spots}
- Summary: ${userProfile.summary}

Your role is to:
1. Provide personalized coaching based on their psychographic profile
2. Help them understand their strengths and growth areas
3. Offer actionable advice and strategies
4. Ask thoughtful questions to help them reflect and grow
5. Remember the conversation context and build on previous discussions
6. Be encouraging, supportive, and professional
7. Adapt your communication style to match their preferences

Keep responses conversational, helpful, and focused on their development. Use their profile insights to provide relevant guidance.`;

    // Format conversation history for the API
    const conversationMessages = conversationHistory
      .filter((msg: Message) => msg.id !== 'welcome') // Exclude the initial welcome message
      .map((msg: Message) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages,
      { role: 'user', content: message }
    ];

    // Call Azure OpenAI
    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure OpenAI error:', errorData);
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      response: aiResponse,
      success: true
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 