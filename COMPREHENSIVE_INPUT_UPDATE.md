# Comprehensive Input Update for Profile Generation

## Overview
Updated the psychographic profile generation system to accept all three input sources: LinkedIn profile, Resume, and Assessment answers. Previously only LinkedIn data was explicitly passed to the prompt.

## Changes Made

### 1. Prompt.txt Updates
**Before:**
```
📥 USER INPUTS:
- LinkedIn Profile: {{linkedin_text}}
```

**After:**
```
📥 USER INPUTS:
- LinkedIn Profile: {{linkedin_text}}
- Resume: {{resume_text}}
- Assessment Answers: {{questions_text}}
```

Now has three distinct placeholders for each data source.

### 2. Resume Upload API Enhancement (`/app/api/upload-resume/route.ts`)
- Added pdf-parse library import (matching LinkedIn PDF upload)
- Implemented PDF text extraction for resume files
- Returns `fullText` in API response alongside `fileId` and `fileName`
- For DOC/DOCX files: placeholder message (text extraction not implemented yet)
- Extract text from PDF resumes just like LinkedIn PDFs

### 3. Frontend Storage (`/app/preview-onboarding/page.tsx`)
**Resume Upload Handler:**
- Now stores extracted resume text in localStorage: `onboarding_resume_text`
- Persists alongside existing `onboarding_resume_uploaded` and `onboarding_resume_data`

**Resume Delete Handler:**
- Now removes `onboarding_resume_text` from localStorage

**Profile Generation Function:**
- Retrieves resume text from localStorage: `localStorage.getItem('onboarding_resume_text')`
- Includes resume data in API request: `resume: resumeData`
- Data flow: localStorage → API request body → OpenAI prompt

### 4. Profile Generation API (`/app/api/generate-profile/route.ts`)
**Request Handling:**
- Added `resume: resumeInput` to destructured request body
- Processes resume input similar to LinkedIn (handles string or object)

**Data Processing:**
```typescript
// Check for Resume data from request body (sent from client localStorage)
if (resumeInput) {
  resumeData = typeof resumeInput === 'string' ? resumeInput : JSON.stringify(resumeInput);
}
```

**Prompt Assembly:**
- Replaced single `{{linkedin_text}}` placeholder replacement with three separate replacements:
  - `{{linkedin_text}}` → LinkedIn data or "Not provided"
  - `{{resume_text}}` → Resume data or "Not provided"
  - `{{questions_text}}` → Assessment answers or "Not provided"

**Cache Key Update:**
- Input hash now includes all three data sources for accurate cache invalidation
- Already used `getInputHash(questions, resumeData, linkedinData)`

## Data Flow

### Complete Input Pipeline
1. **User uploads resume PDF** → `/api/upload-resume`
2. **API extracts text** using pdf-parse → returns `fullText`
3. **Frontend stores text** → `localStorage: onboarding_resume_text`
4. **User clicks "Generate Profile"** → reads from localStorage
5. **Frontend sends data** → `/api/generate-profile` with `{ questions, linkedin, resume }`
6. **API reads prompt template** → `Prompt.txt`
7. **API replaces placeholders:**
   - `{{linkedin_text}}` with LinkedIn data
   - `{{resume_text}}` with Resume data
   - `{{questions_text}}` with Assessment answers
8. **OpenAI receives comprehensive input** → generates holistic profile
9. **Profile returned** → cached and displayed

## Benefits

### More Comprehensive Analysis
- AI now has access to ALL user data simultaneously
- Can cross-reference information from multiple sources
- Better identification of patterns and strengths

### Explicit Input Structure
- Prompt clearly shows three distinct data sources
- OpenAI can weigh each source appropriately
- More consistent and predictable outputs

### Better Text Extraction
- Resume PDFs now processed same way as LinkedIn PDFs
- Full text available for analysis (not just metadata)
- Consistent data handling across all upload types

## Testing Checklist

- [ ] Upload resume PDF → verify text extraction works
- [ ] Upload LinkedIn PDF → verify text extraction works
- [ ] Complete assessment questions
- [ ] Generate profile → verify all three inputs used
- [ ] Check OpenAI receives data in correct format
- [ ] Verify profile quality with comprehensive inputs
- [ ] Test cache invalidation with different input combinations
- [ ] Test DOC/DOCX upload (should show placeholder message)
- [ ] Test delete resume → verify text removed from localStorage

## Technical Notes

### Storage Strategy
- **Client-side (localStorage):** All three raw input texts during onboarding
- **Server-side (profile_cache.json):** Only generated profiles
- No file system writes on Vercel → compatible with serverless

### PDF Text Extraction
- Uses pdf-parse library for both resume and LinkedIn PDFs
- Requires Buffer and nodejs runtime
- Handles extraction errors gracefully

### Backwards Compatibility
- Still supports old LinkedIn manual entry format (structured object)
- Gracefully handles missing inputs ("Not provided")
- Cache invalidation ensures old profiles regenerated with new prompt

## Next Steps

1. Test in production (Vercel deployment)
2. Consider adding DOC/DOCX text extraction (mammoth.js or similar)
3. Monitor OpenAI token usage with longer inputs
4. Consider input size limits (may need truncation for very long resumes)
5. Add user feedback mechanism to verify profile quality improved

---
**Date:** October 21, 2025
**Status:** Complete - Ready for Testing
