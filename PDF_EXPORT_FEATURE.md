# PDF Export Feature - Resume Intel

## Overview
Complete PDF export feature for the Resume Intel page that generates professional executive-style career reports in PDF format.

## Feature Components

### 1. Frontend Components

#### ExportPDFModal (`app/components/ExportPDFModal.tsx`)
- Modal dialog for selecting which sections to include in PDF
- 5 checkboxes for section selection:
  - Resume Summary
  - Strengths & Areas for Improvement
  - Improved Resume Bullets
  - Extracted Skills
  - Career Direction Highlights
- Sage-styled UI with #7F915F accent color
- Cancel and "Generate PDF" buttons

#### Resume Intel Page Updates (`app/resume-intel/page.tsx`)
- Added "Download Report (PDF)" button in bottom action area
- PDF download icon (document with down arrow)
- Export modal state management
- Loading state with AnalysisLoader during PDF generation
- Custom loading messages:
  - "Formatting content for executive review."
  - "Building professional layout."
  - "Generating PDF document."
- Blob download trigger with formatted filename: `sage-report-YYYY-MM-DD.pdf`

### 2. Backend Components

#### PDF Template Generator (`lib/pdfTemplate.ts`)
- `generatePDFTemplate()` function
- Professional executive report HTML template
- Key design elements:
  - Sage logo header (32px gradient circle with cross icon)
  - 3px sage green (#7F915F) border below header
  - Report title: "Career & Resume Intelligence Report"
  - User name and generation date in header
  - Clean white background, professional typography
  - Generous spacing optimized for printing
  - Page-break-inside: avoid for all major sections

Sections (conditionally rendered):
1. **Resume Summary** - Paragraph format
2. **First Impression** - Paragraph format  
3. **Strengths & Areas for Improvement**
   - Two subsections with bullet lists
   - 3px sage green left border on items
4. **Improved Resume Bullets**
   - Original → Improved format
   - 3px sage left border, light backgrounds
5. **Extracted Skills**
   - 3-column grid layout
   - Pill-style tags (#EEF2E8 background)
   - Categories: Technical, Interpersonal, Leadership, Domain, Transferable
6. **Career Direction Highlights**
   - Top 2 career directions
   - Card format with fit score badge
   - Sage-tinted background (#F4F7EF)

Styling highlights:
- Font: 11pt sans-serif, line-height 1.6
- Section titles: 14pt semibold with bottom border
- Skills: 9pt in 3-column grid
- Colors: #222 (text), #444 (secondary), #7F915F (accent)
- Print-optimized @media rules

#### PDF Generation API (`pages/api/export-pdf.ts`)
- POST endpoint at `/api/export-pdf`
- Accepts request body: `{ sections, data }`
- Process:
  1. Validate request (sections + data required)
  2. Generate HTML from template with current date
  3. Launch Puppeteer headless browser
  4. Load HTML content, wait for rendering (networkidle0)
  5. Generate PDF: A4 format, printBackground: true, 20px margins
  6. Close browser and cleanup
  7. Return PDF buffer with proper headers
- Response headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="sage-report-YYYY-MM-DD.pdf"`
  - `Content-Length: [buffer size]`
- Error handling: 500 status with error details
- Body size limit: 10mb
- Puppeteer args for production environments:
  - `--no-sandbox`
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`
  - `--disable-gpu`

### 3. Type Definitions

#### PDF Export Types (`app/types/pdfExport.ts`)
```typescript
export interface ExportSections {
  summary: boolean;
  strengths: boolean;
  skills: boolean;
  bullets: boolean;
  careerDirections: boolean;
}

export interface PDFExportData {
  sections: ExportSections;
  data: {
    firstName?: string;
    firstImpression?: string;
    improvedSummary?: string;
    strengths?: string[];
    weaknesses?: string[];
    extractedSkills?: Record<string, string[]>;
    bulletAnalysis?: Array<{
      original: string;
      improved: string;
    }>;
    careerDirections?: Array<{
      name: string;
      summary: string;
      fitScore: number;
    }>;
  };
}
```

## User Flow

1. User completes resume analysis on Resume Intel page
2. User clicks "Download Report (PDF)" button
3. Modal appears with section checkboxes (all selected by default)
4. User selects/deselects sections as desired
5. User clicks "Generate PDF"
6. Modal closes, AnalysisLoader appears with loading messages
7. Backend generates PDF with selected sections
8. Browser automatically downloads PDF file
9. Page returns to normal state

## Technical Details

### Dependencies
- **puppeteer** (v23.11.1) - Headless Chrome for server-side PDF rendering
  - Installed via: `npm install puppeteer`

### File Structure
```
app/
  components/
    ExportPDFModal.tsx         # Section selection modal
  resume-intel/
    page.tsx                   # Updated with export button + state
  types/
    pdfExport.ts               # TypeScript interfaces

lib/
  pdfTemplate.ts               # HTML template generator

pages/
  api/
    export-pdf.ts              # Puppeteer PDF generation endpoint
```

### Design System Integration
- Primary sage green: #7F915F
- Hover state: #6A7F4F
- Background tints: #F4F7EF, #EEF2E8
- Text hierarchy: #222, #444, #666
- Borders: #E5E5E5
- Font: Inter, system-ui fallback
- NO emojis (strict requirement maintained)
- Premium minimal aesthetic

### Error Handling
- Modal validation: Requires at least one section selected
- API validation: Validates request structure
- Puppeteer errors: Caught and logged, returns 500 with details
- Network errors: User-friendly alert dialog
- Browser cleanup: Ensures Puppeteer browser closes even on error

## Testing Checklist

- [ ] Modal opens when clicking "Download Report (PDF)"
- [ ] All checkboxes functional (select/deselect)
- [ ] "Generate PDF" disabled when no sections selected
- [ ] Loading state appears during generation
- [ ] PDF downloads automatically
- [ ] PDF filename format: `sage-report-YYYY-MM-DD.pdf`
- [ ] PDF contains only selected sections
- [ ] PDF styling matches design (sage colors, clean layout)
- [ ] PDF prints correctly (page breaks, margins)
- [ ] Works with missing data (empty arrays, undefined fields)
- [ ] Error handling works (network errors, server errors)
- [ ] Puppeteer browser closes after generation

## Future Enhancements
- Add "Select All" / "Deselect All" in modal
- Custom filename option
- Email PDF option
- Save PDF to user's Sage account
- Multiple export formats (Word, JSON)
- Print preview before download
- PDF with interactive links to dashboard sections
