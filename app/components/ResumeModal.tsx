"use client";

import React, { useRef } from "react";
import { useState } from "react";

interface ResumeInfo {
  fileName: string;
  uploadedAt: string;
}

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeInfo: ResumeInfo | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading: boolean;
}

export default function ResumeModal({ isOpen, onClose, resumeInfo, onUpload, onDelete, isUploading }: ResumeModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#f8faf6] to-[#e8f0e3] border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-[#2d3748] text-center">Resume</h2>
        </div>
        {/* Content */}
        <div className="p-8 flex-1 flex flex-col items-center justify-center">
          {resumeInfo ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#9DC183] to-[#8a9a5b] text-white shadow mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="font-semibold text-lg text-[#374151]">{resumeInfo.fileName}</div>
                <div className="text-xs text-[#6B7280]">Uploaded {new Date(resumeInfo.uploadedAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8a9a5b] to-[#55613b] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Edit"}
                </button>
                <button
                  onClick={onDelete}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f87171] to-[#fbbf24] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#9DC183] to-[#8a9a5b] text-white shadow mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="font-semibold text-lg text-[#374151] mb-2">No resume uploaded</div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8a9a5b] to-[#55613b] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Resume"}
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </div>
      </div>
    </div>
  );
} 