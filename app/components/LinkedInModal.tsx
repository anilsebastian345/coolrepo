"use client";

import { useState, useRef, useEffect } from "react";

interface LinkedInInfo {
  filename: string;
  uploadedAt: string;
}

interface LinkedInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (data: any) => void;
}

export default function LinkedInModal({ isOpen, onClose, onUploadSuccess }: LinkedInModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [error, setError] = useState("");
  const [linkedinInfo, setLinkedinInfo] = useState<LinkedInInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing LinkedIn info from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding_linkedin_data');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.filename && parsed.uploadedAt) {
            setLinkedinInfo({
              filename: parsed.filename,
              uploadedAt: parsed.uploadedAt
            });
          }
        } catch (e) {
          console.error('Failed to parse LinkedIn data:', e);
        }
      }
      setUploadState('idle');
    }
  }, [isOpen]);

  // Monitor upload state
  useEffect(() => {
    if (uploadState === 'uploading' && !uploading) {
      setTimeout(() => setUploadState('success'), 500);
    }
  }, [uploading, uploadState]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError("Please upload a PDF file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      // Auto-upload when file is selected
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload: File = file!) => {
    if (!fileToUpload) {
      setError("Please select a file first");
      return;
    }

    setUploadState('uploading');
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await fetch("/api/upload-linkedin-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Store the LinkedIn data in localStorage for profile generation
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding_linkedin_complete', 'true');
          // Store full text for profile generation
          localStorage.setItem('onboarding_linkedin_text', data.fullText || data.profileData?.rawText || '');
          // Store metadata
          localStorage.setItem('onboarding_linkedin_data', JSON.stringify({
            filename: data.filename,
            fileId: data.fileId,
            uploadedAt: new Date().toISOString(),
            name: data.profileData?.name || '',
            headline: data.profileData?.headline || ''
          }));
        }

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }

        // Close modal
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setUploadState('idle');
    onClose();
  };

  const handleOk = () => {
    setUploadState('idle');
    onClose();
  };

  const handleDelete = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_linkedin_complete');
      localStorage.removeItem('onboarding_linkedin_text');
      localStorage.removeItem('onboarding_linkedin_data');
    }
    setLinkedinInfo(null);
    setFile(null);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#f8faf6] to-[#e8f0e3] border-b border-gray-100 shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-[#2d3748] text-center">LinkedIn Profile</h2>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col items-center justify-center overflow-y-auto">
          {uploadState === 'uploading' ? (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              {/* Animated circular progress */}
              <svg className="w-20 h-20 mb-6" viewBox="0 0 48 48">
                <circle
                  className="text-[#e5e7eb]"
                  cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="6"
                />
                <circle
                  className="text-[#8a9a5b] animate-spin-progress"
                  cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="6"
                  strokeDasharray="125.6" strokeDashoffset="0"
                  style={{ strokeDasharray: 125.6, strokeDashoffset: 0, transition: 'stroke-dashoffset 1.2s linear' }}
                />
              </svg>
              <div className="text-lg font-semibold text-[#374151] mb-2">Processing LinkedIn PDF...</div>
              <div className="text-sm text-[#6B7280]">Extracting profile information</div>
            </div>
          ) : uploadState === 'success' ? (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              {/* Animated checkmark */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9DC183] to-[#8a9a5b] flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
                  <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-[#374151] mb-2">LinkedIn profile uploaded!</div>
              <button
                onClick={handleOk}
                className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8a9a5b] to-[#55613b] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none"
              >
                OK
              </button>
            </div>
          ) : linkedinInfo ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-full max-w-xs p-4 rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#e9f5e1] shadow border border-[#d4dbc8] flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#9DC183] to-[#8a9a5b] text-white">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-[#374151] truncate">{linkedinInfo.filename}</div>
                    <div className="text-xs text-[#6B7280]">Uploaded {new Date(linkedinInfo.uploadedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8a9a5b] to-[#55613b] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Replace"}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#f87171] to-[#ef4444] text-white font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none"
                >
                  Delete
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <>
              <div className="w-full max-w-sm mb-6">
                <p className="text-gray-600 text-center mb-4">
                  Export your LinkedIn profile as a PDF and upload it here.
                </p>
                
                <div className="bg-gradient-to-br from-[#f0f9f0] to-[#e8f5e9] border border-[#8a9a5b]/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#55613b] font-medium mb-2">📋 How to export:</p>
                  <ol className="text-sm text-[#55613b] space-y-1 list-decimal list-inside">
                    <li>Go to your LinkedIn profile</li>
                    <li>Click "More" in your profile section</li>
                    <li>Select "Save to PDF"</li>
                    <li>Upload the downloaded PDF here</li>
                  </ol>
                </div>

                <div className="border-2 border-dashed border-[#d4dbc8] rounded-xl p-8 text-center hover:border-[#8a9a5b] hover:bg-gradient-to-br hover:from-[#f8faf6] hover:to-[#f0f9f0] transition-all duration-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <svg className="w-16 h-16 mx-auto mb-4 text-[#8a9a5b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#8a9a5b] font-semibold hover:text-[#55613b] transition-colors text-lg"
                    disabled={uploading}
                  >
                    Choose PDF file
                  </button>
                  <p className="text-sm text-[#6B7280] mt-2">Maximum size: 10MB</p>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes spin-progress {
          0% {
            stroke-dashoffset: 125.6;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-spin-progress {
          animation: spin-progress 1.2s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
