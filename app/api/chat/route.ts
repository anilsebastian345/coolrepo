import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, ERROR_MESSAGES, OPENAI_CONFIG } from '../../../lib/constants';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ProfileUpdater } from '../../../lib/profileUpdater';
import { ContextManager } from '../../../lib/contextManager';

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

interface UserMemory {
  userId: string;
  interactions: Array<{
    timestamp: string;
    userMessage: string;
    insights: string;
    patterns: string[];
  }>;
  profileUpdates: Array<{
    timestamp: string;
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
  }>;
  lastUpdated: string;
}

// Memory management functions
async function loadUserMemory(userId: string): Promise<UserMemory> {
  try {
    const memoryPath = join(process.cwd(), `user_memory_${userId}.json`);
    if (existsSync(memoryPath)) {
      const memoryData = await readFile(memoryPath, 'utf-8');
      return JSON.parse(memoryData);
    }
  } catch (error) {
    console.error('Error loading user memory:', error);
  }
  
  return {
    userId,
    interactions: [],
    profileUpdates: [],
    lastUpdated: new Date().toISOString()
  };
}

async function saveUserMemory(memory: UserMemory): Promise<void> {
  try {
    const memoryPath = join(process.cwd(), `user_memory_${memory.userId}.json`);
    memory.lastUpdated = new Date().toISOString();
    await writeFile(memoryPath, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error('Error saving user memory:', error);
  }
}

// Helper function to extract insights from user messages
async function extractInsights(message: string, userProfile: UserProfile): Promise<string> {
  // Simple keyword-based insight extraction
  const insights: string[] = [];
  
  // Emotional indicators
  if (message.match(/stressed|overwhelmed|frustrated|anxious/i)) {
    insights.push('experiencing stress or pressure');
  }
  if (message.match(/excited|motivated|confident|proud/i)) {
    insights.push('showing positive emotional state');
  }
  
  // Leadership indicators
  if (message.match(/team|leading|managing|decision/i)) {
    insights.push('engaging in leadership activities');
  }
  if (message.match(/conflict|disagreement|difficult conversation/i)) {
    insights.push('dealing with interpersonal challenges');
  }
  
  // Growth indicators
  if (message.match(/learning|growth|feedback|improve/i)) {
    insights.push('focused on personal development');
  }
  
  return insights.join(', ') || 'general coaching conversation';
}

// Helper function to identify patterns in user interactions
async function identifyPatterns(message: string, previousInteractions: UserMemory['interactions']): Promise<string[]> {
  const patterns: string[] = [];
  
  if (previousInteractions.length === 0) return patterns;
  
  // Look for recurring themes
  const recentMessages = previousInteractions.slice(-10);
  
  // Check for stress patterns
  const stressCount = recentMessages.filter(interaction => 
    interaction.insights.includes('stress') || interaction.insights.includes('pressure')
  ).length;
  if (stressCount >= 2) {
    patterns.push('recurring_stress_pattern');
  }
  
  // Check for leadership focus
  const leadershipCount = recentMessages.filter(interaction => 
    interaction.insights.includes('leadership') || interaction.userMessage.match(/team|leading|managing/i)
  ).length;
  if (leadershipCount >= 3) {
    patterns.push('strong_leadership_focus');
  }
  
  // Check for growth mindset
  const growthCount = recentMessages.filter(interaction => 
    interaction.insights.includes('development') || interaction.userMessage.match(/learning|growth|improve/i)
  ).length;
  if (growthCount >= 2) {
    patterns.push('active_growth_seeker');
  }
  
  return patterns;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, conversationHistory, userId = 'temp-user-id' } = await request.json();

    // Enhanced input validation
    if (!message?.trim()) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MESSAGE_EMPTY },
        { status: 400 }
      );
    }

    if (!userProfile?.archetype) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PROFILE_INVALID },
        { status: 400 }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > API_CONFIG.MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MESSAGE_TOO_LONG },
        { status: 400 }
      );
    }

    // Load user memory for context
    const userMemory = await loadUserMemory(userId);
    
    // Limit conversation history to last messages for performance
    const limitedHistory = (conversationHistory || []).slice(-API_CONFIG.MAX_CONVERSATION_HISTORY);

    // Format conversation history for the API
    const conversationMessages = limitedHistory
      .filter((msg: Message) => msg.id !== 'welcome') // Exclude the initial welcome message
      .map((msg: Message) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    // Create the new coaching prompt
    const systemPrompt = `You are Sage, a deeply empathetic, highly personalized AI leadership coach. You are speaking with a professional who has already gone through onboarding. You know their psychographic profile, background, and work style.

Your job is to behave like a lifelong coach who grows with them. Every message they send is a window into who they are — so you should learn from it and store that context internally.

---

🎯 OBJECTIVE:
Your goal is to provide a safe, growth-oriented coaching space. You are NOT a therapist. You are a professional development coach. Help the user:
- Reflect on challenges and decisions
- Prepare for tough conversations or presentations
- Reframe setbacks into learning opportunities
- Spot patterns in how they think and behave
- Get clearer on their values, goals, and leadership style

---

🧠 MEMORY & LEARNING:
Every message you receive is a new data point about the user. Quietly update your mental model of them as they speak — how they process emotions, what motivates them, what patterns they fall into. Add those insights to their psychographic profile over time.

DO NOT surface this profiling mid-conversation unless asked.

---

🗣️ TONE:
- Sound like a calm, insightful, emotionally intelligent coach
- Don't overdo the empathy (no "I'm so sorry" for every message)
- Ask clarifying questions instead of giving solutions too quickly
- Use language that mirrors the user's — casual if they're casual, sharp if they're sharp

---

🚫 AVOID:
- Generic advice
- Over-coaching or monologuing
- Therapy-style emotional labor
- Assuming things that haven't been said

---

CURRENT USER PROFILE:
- Archetype: ${userProfile.archetype}
- Core Drives & Values: ${userProfile.core_drives_and_values}
- Cognitive Style: ${userProfile.cognitive_style}
- Leadership Style: ${userProfile.leadership_style}
- Communication Style: ${userProfile.communication_style}
- Risk & Ambition: ${userProfile.risk_and_ambition}
- Growth & Blind Spots: ${userProfile.growth_and_blind_spots}
- Summary: ${userProfile.summary}

---

INTERACTION HISTORY PATTERNS:
${userMemory.interactions.slice(-5).map(interaction => 
  `- ${interaction.timestamp}: User shared "${interaction.userMessage.substring(0, 100)}..." | Insights: ${interaction.insights}`
).join('\n') || 'No previous interactions recorded.'}

---

Remember: Be a mirror the user wants to keep looking into — insightful, warm, and surprisingly precise. Focus on their growth and development as a leader.`;

    // Optimize context for token limits
    const contextAnalysis = ContextManager.calculateContextSize(
      systemPrompt,
      userProfile,
      conversationMessages,
      message
    );

    console.log('Context analysis:', contextAnalysis);

    // Optimize conversation history if needed
    let optimizedMessages = conversationMessages;
    if (!contextAnalysis.withinLimits) {
      console.log('Context too large, optimizing...');
      const maxHistoryTokens = 4000; // Reserve space for system prompt and response
      optimizedMessages = ContextManager.optimizeConversationHistory(conversationMessages, maxHistoryTokens);
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...optimizedMessages,
      { role: 'user', content: message }
    ];

    // Call Azure OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.CHAT_TIMEOUT);

    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_CONFIG.AZURE_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        messages,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
        temperature: OPENAI_CONFIG.TEMPERATURE,
        top_p: OPENAI_CONFIG.TOP_P,
        frequency_penalty: OPENAI_CONFIG.FREQUENCY_PENALTY,
        presence_penalty: OPENAI_CONFIG.PRESENCE_PENALTY,
        stop: null
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure OpenAI error:', errorData);
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error(ERROR_MESSAGES.NO_AI_RESPONSE);
    }

    // Save the interaction to user memory for future context
    const newInteraction = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      insights: await extractInsights(message, userProfile),
      patterns: await identifyPatterns(message, userMemory.interactions)
    };
    
    userMemory.interactions.push(newInteraction);
    
    // Keep only the last 50 interactions to prevent file size issues
    if (userMemory.interactions.length > 50) {
      userMemory.interactions = userMemory.interactions.slice(-50);
    }
    
    // Save updated memory
    await saveUserMemory(userMemory);

    // Check if profile should be updated based on meaningful chat count
    const shouldUpdateProfile = await ProfileUpdater.recordMeaningfulChat(userId, message, aiResponse);
    let profileUpdated = false;
    
    if (shouldUpdateProfile) {
      console.log('Triggering profile update for user:', userId);
      const updatedProfile = await ProfileUpdater.updateProfile(userId);
      if (updatedProfile) {
        profileUpdated = true;
        console.log('Profile successfully updated for user:', userId);
      }
    }

    return NextResponse.json({
      response: aiResponse,
      success: true,
      memoryUpdated: true,
      profileUpdated
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