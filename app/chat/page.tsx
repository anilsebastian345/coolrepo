"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user profile on component mount
  useEffect(() => {
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
                  content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
                  sender: 'assistant',
                  timestamp: new Date()
                };
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
              setMessages([fallbackMessage]);
              return;
            }
          }
          
          // Check if the parsed data has the expected structure
          if (!parsed.archetype) {
            console.error('Profile missing archetype:', parsed);
            const fallbackMessage: Message = {
              id: 'welcome',
              content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
              sender: 'assistant',
              timestamp: new Date()
            };
            setMessages([fallbackMessage]);
            return;
          }
          
          setUserProfile(parsed);
          
          // Add welcome message from coach
          const welcomeMessage: Message = {
            id: 'welcome',
            content: `Hi! I'm Sage, your AI coach. I've learned about your ${parsed.archetype} archetype and I'm here to help you grow and develop. What would you like to work on today?`,
            sender: 'assistant',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        } catch (e) {
          console.error('Failed to parse profile:', e);
          // Add fallback message if profile parsing fails
          const fallbackMessage: Message = {
            id: 'welcome',
            content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
            sender: 'assistant',
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
        }
      } else {
        console.log('No profile data found in localStorage');
        // Add message when no profile is found
        const noProfileMessage: Message = {
          id: 'welcome',
          content: "Hi! I'm Sage, your AI coach. I need to learn about you first! Please go back and complete your profile before we can chat.",
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages([noProfileMessage]);
      }
    };

    loadProfile();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if user profile is loaded
    if (!userProfile) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I need to learn about you first! Please go back and complete your profile before we can chat.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userProfile: userProfile,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] via-[#F9FAFB] to-[#F3F4F6] flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/preview-onboarding" className="flex items-center space-x-3 hover:scale-105 transition-transform">
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
          </Link>
          
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
                    ? 'bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] text-white'
                    : 'bg-white shadow-lg border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-lg border border-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#9DC183] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#9DC183] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#9DC183] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#9DC183] focus:border-transparent"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-[#9DC183] to-[#8a9a5b] text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 