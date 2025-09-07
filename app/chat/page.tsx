"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastActive: Date;
  archetype?: string;
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Generate unique IDs for messages and conversations
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const generateConversationId = useCallback(() => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Conversation management functions
  const loadConversations = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sage_conversations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            lastActive: new Date(conv.lastActive),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversationsWithDates);
          return conversationsWithDates;
        } catch (e) {
          console.error('Failed to parse conversations:', e);
        }
      }
    }
    return [];
  }, []);

  const saveConversations = useCallback((convs: Conversation[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sage_conversations', JSON.stringify(convs));
    }
  }, []);

  const createNewConversation = useCallback((firstMessage?: Message) => {
    const messageContent = firstMessage?.content || '';
    const newConv: Conversation = {
      id: generateConversationId(),
      title: messageContent.length > 30 ? messageContent.slice(0, 30) + '...' : messageContent || 'New Conversation',
      messages: firstMessage ? [firstMessage] : [],
      lastActive: new Date(),
      archetype: userProfile?.archetype
    };
    
    const updatedConvs = [newConv, ...conversations];
    setConversations(updatedConvs);
    setCurrentConversationId(newConv.id);
    saveConversations(updatedConvs);
    return newConv;
  }, [generateConversationId, conversations, userProfile, saveConversations]);

  const updateCurrentConversation = useCallback((newMessages: Message[]) => {
    if (!currentConversationId) return;
    
    const updatedConvs = conversations.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: newMessages, lastActive: new Date() }
        : conv
    );
    setConversations(updatedConvs);
    saveConversations(updatedConvs);
  }, [currentConversationId, conversations, saveConversations]);

  const switchToConversation = useCallback((convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversationId(convId);
      setMessages(conv.messages);
    }
  }, [conversations]);

  // Create fallback message helper
  const createFallbackMessage = useCallback((content: string): Message => ({
    id: generateMessageId(),
    content,
    sender: 'assistant',
    timestamp: new Date()
  }), [generateMessageId]);

  // Load user profile and conversations on component mount
  useEffect(() => {
    // Load conversations first
    const savedConversations = loadConversations();
    
    const loadProfile = () => {
      const profileData = localStorage.getItem('onboarding_psych_profile');
      console.log('Raw profile data from localStorage:', profileData);
      
      if (profileData) {
        try {
          // First try to parse as JSON (in case it's a string)
          let parsed;
          try {
            parsed = JSON.parse(profileData);
            console.log('Parsed profile:', parsed);
            console.log('Profile archetype:', parsed.archetype);
          } catch {
            // If parsing fails, it might be plain text with JSON embedded
            console.log('Profile is not valid JSON, trying to extract JSON from text...');
            
            // Try to extract JSON from the text response
            const jsonMatch = profileData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0]);
                console.log('Extracted JSON from text:', parsed);
                console.log('Profile archetype:', parsed.archetype);
              } catch (jsonError) {
                console.error('Failed to parse extracted JSON:', jsonError);
                const fallbackMessage: Message = {
                  id: 'welcome',
                  content: "Hi! I'm Sage, your AI coach. I can see you've provided information, but I need to generate your psychographic profile first. Please go back to the previous page and click 'See what I have learned' to generate your profile, then we can chat!",
                  sender: 'assistant',
                  timestamp: new Date()
                };
                const newConv = createNewConversation(fallbackMessage);
                setMessages([fallbackMessage]);
                return;
              }
            } else {
              console.error('No JSON found in profile text');
              const fallbackMessage: Message = {
                id: 'welcome',
                content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
                sender: 'assistant',
                timestamp: new Date()
              };
              const newConv = createNewConversation(fallbackMessage);
              setMessages([fallbackMessage]);
              return;
            }
          }
          
          // Check if the parsed data has the expected structure
          if (!parsed?.archetype) {
            console.error('Profile missing archetype:', parsed);
            const fallbackMessage: Message = {
              id: 'welcome',
              content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
              sender: 'assistant',
              timestamp: new Date()
            };
            const newConv = createNewConversation(fallbackMessage);
            setMessages([fallbackMessage]);
            return;
          }
          
          setUserProfile(parsed);
          
          // Check if there's an existing conversation, otherwise create a new one
          if (savedConversations.length > 0) {
            // Load the most recent conversation
            const mostRecentConv = savedConversations[0];
            setCurrentConversationId(mostRecentConv.id);
            setMessages(mostRecentConv.messages);
          } else {
            // Create a new conversation with welcome message
            const welcomeMessage: Message = {
              id: 'welcome',
              content: `Hi! I'm Sage, your AI coach. I've learned about your ${parsed.archetype} archetype and I'm here to help you grow and develop. What would you like to work on today?`,
              sender: 'assistant',
              timestamp: new Date()
            };
            const newConv = createNewConversation(welcomeMessage);
            setMessages([welcomeMessage]);
          }
        } catch (e) {
          console.error('Failed to parse profile:', e);
          // Add fallback message if profile parsing fails
          const fallbackMessage: Message = {
            id: 'welcome',
            content: "Hi! I'm Sage, your AI coach. I can see you've provided information, but I need to generate your psychographic profile first. Please go back to the previous page and click 'See what I have learned' to generate your profile, then we can chat!",
            sender: 'assistant',
            timestamp: new Date()
          };
          const newConv = createNewConversation(fallbackMessage);
          setMessages([fallbackMessage]);
        }
      } else {
        console.log('No profile data found in localStorage');
        
        // Check if user has completed questions but hasn't generated profile yet
        const questionsCompleted = localStorage.getItem('onboarding_questions_completed');
        const resumeUploaded = localStorage.getItem('onboarding_resume_uploaded');
        const linkedinData = localStorage.getItem('onboarding_linkedin_data');
        
        let message = "Hi! I'm Sage, your AI coach. ";
        
        if (questionsCompleted === 'true' || resumeUploaded === 'true' || linkedinData) {
          // User has provided some information but hasn't generated profile
          message += "I can see you've provided some information about yourself! To start our conversation, please go back to the previous page and click 'See what I have learned' to generate your personalized profile. Then we can chat!";
        } else {
          // User hasn't provided any information yet
          message += "I need to learn about you first! Please go back and complete your profile (upload resume, answer questions, or provide LinkedIn info) before we can chat.";
        }
        
        const noProfileMessage: Message = {
          id: 'welcome',
          content: message,
          sender: 'assistant',
          timestamp: new Date()
        };
        const newConv = createNewConversation(noProfileMessage);
        setMessages([noProfileMessage]);
      }
    };

    loadProfile();
  }, [loadConversations, createNewConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if user profile is loaded
    if (!userProfile) {
      const errorMessage: Message = {
        id: generateMessageId(),
        content: "I can see you've provided information, but I need to generate your psychographic profile first. Please go back to the previous page and click 'See what I have learned' to generate your profile, then we can chat!",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: generateMessageId(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Generate a simple userId based on profile data for consistency
      const userId = `user_${btoa(userProfile.archetype + userProfile.summary).slice(0, 8)}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userProfile: userProfile,
          conversationHistory: messages,
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: generateMessageId(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      // Update or create conversation
      if (currentConversationId) {
        updateCurrentConversation(updatedMessages);
      } else {
        // Create new conversation if none exists
        const newConv = createNewConversation(userMessage);
        setMessages(updatedMessages);
        updateCurrentConversation(updatedMessages);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateMessageId(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date()
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      
      // Update conversation with error message too
      if (currentConversationId) {
        updateCurrentConversation(updatedMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, userProfile, messages, generateMessageId, currentConversationId, updateCurrentConversation, createNewConversation]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] via-[#F9FAFB] to-[#F3F4F6] flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm border-r border-gray-200`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2d3748]">Conversations</h2>
              <button
                onClick={() => {
                  const newConv = createNewConversation();
                  setMessages([]);
                }}
                className="p-2 rounded-lg bg-[#8a9a5b]/10 text-[#8a9a5b] hover:bg-[#8a9a5b]/20 transition-colors"
                title="New Conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => switchToConversation(conv.id)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? 'bg-[#8a9a5b]/20 border border-[#8a9a5b]/30'
                    : 'bg-white/50 hover:bg-white/80 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium text-[#2d3748] mb-1 truncate">
                  {conv.title}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>{conv.archetype}</span>
                  <span>{conv.lastActive.toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {conv.messages.length} messages
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-3 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full shadow-lg bg-gradient-to-br from-[#f3f4f6] to-[#ececec]">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-[#d4dbc8] via-[#8a9a5b] to-[#55613b] flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="absolute" style={{ top: '12%', right: '12%' }}>
                    <div className="w-2 h-2 rounded-full bg-[#ffe082] shadow" />
                  </div>
                </div>
                <span className="text-xl font-semibold text-[#2d3748]">Sage</span>
              </button>
            </div>
            
            {userProfile && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#9DC183]/10 to-[#8a9a5b]/10 rounded-full">
                <span className="text-sm font-medium text-[#55613b]">{userProfile.archetype}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#8a9a5b] text-white'
                      : 'bg-white/80 text-[#2d3748] shadow-sm border border-gray-200/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Show helpful button if user needs to complete profile */}
            {messages.length === 1 && messages[0].content.includes('See what I have learned') && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => router.push('/preview-onboarding')}
                  className="px-6 py-3 bg-[#8a9a5b] text-white rounded-xl font-medium hover:bg-[#6d7a47] transition-colors duration-200 shadow-lg"
                >
                  Go to Profile Generation
                </button>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 px-4 py-3 rounded-2xl shadow-sm border border-gray-200/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#8a9a5b] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#8a9a5b] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#8a9a5b] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#8a9a5b] focus:ring-2 focus:ring-[#8a9a5b]/20 outline-none resize-none bg-white/90"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-[#8a9a5b] text-white hover:bg-[#6d7a4a] shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
