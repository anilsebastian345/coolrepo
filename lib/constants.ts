// API Configuration
export const API_CONFIG = {
  CHAT_TIMEOUT: 30000, // 30 seconds
  MAX_MESSAGE_LENGTH: 4000, // Increased from 2000 to allow more detailed inputs
  MAX_CONVERSATION_HISTORY: 15, // Reduced from 20 to manage context length better
  AZURE_API_VERSION: '2024-02-15-preview',
  MAX_RESUME_LENGTH: 10000, // New: Limit resume text to 10k characters
  MAX_LINKEDIN_LENGTH: 5000, // New: Limit LinkedIn text to 5k characters
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PSYCH_PROFILE: 'onboarding_psych_profile',
  LINKEDIN_DATA: 'onboarding_linkedin_data',
  RESUME_UPLOADED: 'onboarding_resume_uploaded',
  RESUME_DATA: 'onboarding_resume_data',
  QUESTIONS_COMPLETED: 'onboarding_questions_completed',
  QUESTIONS: 'onboarding_questions',
  USER_NAME: 'userName',
  LINKEDIN_COMPLETE: 'onboarding_linkedin_complete',
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  PROFILE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  CACHE_FILE: 'profile_cache.json',
} as const;

// OpenAI Configuration
export const OPENAI_CONFIG = {
  MAX_TOKENS: 1400, // Optimized for comprehensive responses
  TEMPERATURE: 0.4, // Balanced creativity and grounding
  TOP_P: 1.0, // Default sampling diversity  
  FREQUENCY_PENALTY: 0.2, // Reduces repetition in phrasing
  PRESENCE_PENALTY: 0.1, // Encourages diversity of thought
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  PROFILE_REQUIRED: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
  CONNECTION_ERROR: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
  MESSAGE_EMPTY: 'Message cannot be empty',
  MESSAGE_TOO_LONG: 'Message too long. Please keep it under 2000 characters.',
  PROFILE_INVALID: 'Valid user profile with archetype is required',
  NO_AI_RESPONSE: 'No response from AI',
} as const;
