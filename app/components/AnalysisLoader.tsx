'use client';

import { useState, useEffect } from 'react';

interface AnalysisLoaderProps {
  title: string;
  messages?: string[];
  showMessagesSequentially?: boolean;
}

export default function AnalysisLoader({ 
  title, 
  messages = [], 
  showMessagesSequentially = true 
}: AnalysisLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!showMessagesSequentially || messages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // Rotate every 2.5 seconds

    return () => clearInterval(interval);
  }, [messages.length, showMessagesSequentially]);

  return (
    <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center px-4">
      <div 
        className="bg-white rounded-2xl shadow-md p-10 max-w-md mx-auto text-center animate-fade-in-up"
        style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)' }}
      >
        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div 
            className="w-3 h-3 rounded-full bg-[#7F915F] animate-pulse"
            style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full bg-[#7F915F] animate-pulse"
            style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full bg-[#7F915F] animate-pulse"
            style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
          ></div>
        </div>

        {/* Title */}
        <h2 
          className="text-xl font-semibold text-[#232323] mb-4"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          {title}
        </h2>

        {/* Loading Bar */}
        <div className="w-full h-1 bg-[#E5E5E5] rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-[#7F915F] to-[#6A7F4F] rounded-full animate-loading-bar"
          ></div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="min-h-[60px] flex items-center justify-center">
            {showMessagesSequentially ? (
              <p 
                key={currentMessageIndex}
                className="text-sm text-[#6F6F6F] leading-relaxed animate-fade-in"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {messages[currentMessageIndex]}
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((message, idx) => (
                  <p 
                    key={idx}
                    className="text-sm text-[#6F6F6F] leading-relaxed"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    {message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
