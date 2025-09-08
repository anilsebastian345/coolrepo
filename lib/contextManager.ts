/**
 * Context Length Management Utilities
 * Helps manage OpenAI context limits and optimize token usage
 */

export class ContextManager {
  // Rough token estimation (1 token ≈ 4 characters for English)
  private static readonly CHARS_PER_TOKEN = 4;
  private static readonly MAX_CONTEXT_TOKENS = 128000; // GPT-4o limit
  private static readonly RESERVED_TOKENS = 2000; // Reserve for response + system prompt

  /**
   * Estimate token count for text
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / this.CHARS_PER_TOKEN);
  }

  /**
   * Truncate text to fit within token limit while preserving important content
   */
  static truncateText(text: string, maxTokens: number, preserveEnd = false): string {
    const estimatedTokens = this.estimateTokens(text);
    
    if (estimatedTokens <= maxTokens) {
      return text;
    }
    
    const maxChars = maxTokens * this.CHARS_PER_TOKEN;
    
    if (preserveEnd) {
      // Keep the end of the text (useful for recent conversation history)
      return '...' + text.slice(-(maxChars - 3));
    } else {
      // Keep the beginning of the text (useful for resume/profile data)
      return text.slice(0, maxChars - 3) + '...';
    }
  }

  /**
   * Optimize conversation history for context window
   */
  static optimizeConversationHistory(
    messages: Array<{role: string, content: string}>,
    maxTokens: number
  ): Array<{role: string, content: string}> {
    let totalTokens = 0;
    const optimizedMessages = [];
    
    // Start from the most recent messages and work backwards
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.estimateTokens(message.content);
      
      if (totalTokens + messageTokens <= maxTokens) {
        optimizedMessages.unshift(message);
        totalTokens += messageTokens;
      } else {
        // Try to include a truncated version of this message if it's important
        if (optimizedMessages.length < 3) { // Always try to include at least some history
          const remainingTokens = maxTokens - totalTokens;
          if (remainingTokens > 50) { // Only if we have meaningful space left
            const truncated = this.truncateText(message.content, remainingTokens, false);
            optimizedMessages.unshift({
              ...message,
              content: truncated
            });
          }
        }
        break;
      }
    }
    
    return optimizedMessages;
  }

  /**
   * Calculate total context size for a chat request
   */
  static calculateContextSize(
    systemPrompt: string,
    userProfile: any,
    conversationHistory: Array<{role: string, content: string}>,
    currentMessage: string
  ): {
    totalTokens: number;
    breakdown: {
      systemPrompt: number;
      userProfile: number;
      conversationHistory: number;
      currentMessage: number;
    };
    withinLimits: boolean;
  } {
    const systemTokens = this.estimateTokens(systemPrompt);
    const profileTokens = this.estimateTokens(JSON.stringify(userProfile));
    const historyTokens = conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content), 0
    );
    const messageTokens = this.estimateTokens(currentMessage);
    
    const totalTokens = systemTokens + profileTokens + historyTokens + messageTokens;
    const withinLimits = totalTokens <= (this.MAX_CONTEXT_TOKENS - this.RESERVED_TOKENS);
    
    return {
      totalTokens,
      breakdown: {
        systemPrompt: systemTokens,
        userProfile: profileTokens,
        conversationHistory: historyTokens,
        currentMessage: messageTokens
      },
      withinLimits
    };
  }

  /**
   * Smart truncation for resume/LinkedIn content
   */
  static optimizeUserContent(content: string, type: 'resume' | 'linkedin'): string {
    const maxTokens = type === 'resume' ? 1500 : 800; // Different limits for different content types
    
    if (this.estimateTokens(content) <= maxTokens) {
      return content;
    }
    
    // For resumes, prioritize recent experience and skills
    if (type === 'resume') {
      const sections = content.split(/\n\s*\n/); // Split by paragraph breaks
      let optimizedContent = '';
      let tokenCount = 0;
      
      // Prioritize sections that contain recent dates or key terms
      const prioritizedSections = sections.sort((a, b) => {
        const aScore = this.getResumeRelevanceScore(a);
        const bScore = this.getResumeRelevanceScore(b);
        return bScore - aScore;
      });
      
      for (const section of prioritizedSections) {
        const sectionTokens = this.estimateTokens(section);
        if (tokenCount + sectionTokens <= maxTokens) {
          optimizedContent += section + '\n\n';
          tokenCount += sectionTokens;
        }
      }
      
      return optimizedContent.trim();
    }
    
    // For LinkedIn, just truncate from the beginning
    return this.truncateText(content, maxTokens, false);
  }

  private static getResumeRelevanceScore(section: string): number {
    let score = 0;
    
    // Recent years get higher scores
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
      if (section.includes(year.toString())) {
        score += (currentYear - year + 1) * 10;
      }
    }
    
    // Key terms get higher scores
    const keyTerms = [
      'manager', 'director', 'lead', 'senior', 'principal',
      'skills', 'experience', 'achievements', 'results',
      'team', 'project', 'strategy', 'leadership'
    ];
    
    keyTerms.forEach(term => {
      const matches = (section.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      score += matches * 5;
    });
    
    return score;
  }
}
