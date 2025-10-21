# LinkedIn PDF Upload Feature

## Overview
Changed from LinkedIn OAuth integration to a simpler, more reliable PDF upload approach.

## What Changed

### Removed:
- LinkedIn OAuth integration (NextAuth LinkedIn provider)
- LinkedIn API calls for profile data
- `app/api/linkedin-import/route.ts` (OAuth-based import)
- Complex authentication flow

### Added:
- **LinkedIn PDF Upload**: Users can export their LinkedIn profile as a PDF and upload it
- **New API Endpoint**: `app/api/upload-linkedin-pdf/route.ts`
- **New Component**: `app/components/LinkedInModal.tsx`
- **PDF Parsing**: Extracts text content from uploaded LinkedIn PDFs
- **File Storage**: Saves PDFs and extracted text in `uploads/linkedin_profiles/`

## How It Works

### User Flow:
1. User clicks "Upload LinkedIn PDF" button on onboarding page
2. Modal opens with instructions on how to export LinkedIn profile as PDF
3. User selects their LinkedIn PDF file
4. System uploads and parses the PDF
5. Extracted text is saved for psychographic profiling

### Technical Implementation:

#### API Endpoint (`/api/upload-linkedin-pdf`)
- Accepts PDF file upload via FormData
- Validates file type (PDF only)
- Uses `pdf-parse` library to extract text content
- Saves both original PDF and extracted text
- Returns extracted data and metadata

#### LinkedIn Modal Component
- Clean, user-friendly upload interface
- Shows instructions for exporting LinkedIn profile
- Drag-and-drop support
- File size display
- Success/error feedback
- Stores data in localStorage for onboarding flow

#### File Structure:
```
uploads/linkedin_profiles/
├── linkedin_profile_2025-XX-XX-XX-XX-XX.pdf  (original PDF)
└── linkedin_profile_2025-XX-XX-XX-XX-XX.txt  (extracted text)
```

## Benefits

1. **No OAuth Complexity**: No need to manage LinkedIn app credentials or OAuth flows
2. **No API Limitations**: Not affected by LinkedIn API rate limits or outages
3. **User Control**: Users have full control over what they share
4. **Reliable**: Works even when LinkedIn services are down
5. **Simple UX**: Straightforward upload process
6. **Complete Data**: Gets full profile content, not limited by API scopes

## Integration with Psychographic Profiling

The extracted LinkedIn text can be sent to OpenAI for psychographic analysis:
- Full profile text available in `profileData.rawText`
- Stored in localStorage as `onboarding_linkedin_text`
- Can be combined with resume data for comprehensive profiling

## Testing

1. Go to http://localhost:3000/preview-onboarding
2. Click "Upload LinkedIn PDF" button
3. Upload the example file: `uploads/Profile.pdf`
4. Verify successful upload and text extraction
5. Check `uploads/linkedin_profiles/` for saved files

## Next Steps

To integrate with psychographic profiling:
1. Retrieve LinkedIn text from localStorage or file system
2. Combine with resume data if available
3. Send to OpenAI with profiling prompt
4. Generate user's professional profile

## Files Modified

- `app/preview-onboarding/page.tsx` - Updated to use LinkedIn PDF upload
- `app/api/upload-linkedin-pdf/route.ts` - New API endpoint (created)
- `app/components/LinkedInModal.tsx` - New upload modal (created)
- `uploads/linkedin_profiles/` - New directory for uploads (created)
