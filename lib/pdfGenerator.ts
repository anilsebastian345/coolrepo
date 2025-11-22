import { jsPDF } from 'jspdf';

interface PDFData {
  firstName: string;
  firstImpression?: string;
  improvedSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  extractedSkills?: Record<string, string[]>;
  bulletAnalysis?: Array<{ original: string; improved: string }>;
  careerDirections?: Array<{ name: string; summary: string; fitScore: number }>;
}

interface Sections {
  summary: boolean;
  strengths: boolean;
  skills: boolean;
  bullets: boolean;
  careerDirections: boolean;
}

export function generateReportPDF(sections: Sections, data: PDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Colors
  const sageGreen: [number, number, number] = [127, 145, 95];
  const darkGray: [number, number, number] = [35, 35, 35];
  const mediumGray: [number, number, number] = [111, 111, 111];

  // Helper to add new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to wrap text
  const addWrappedText = (text: string, fontSize: number, color: [number, number, number], maxWidth: number) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
  };

  // Header
  doc.setFillColor(...sageGreen);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Sage Career Intelligence Report', margin, 10);

  yPos = 25;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...mediumGray);
  doc.text(`${data.firstName} • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
  yPos += 10;

  // Divider line
  doc.setDrawColor(...sageGreen);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // First Impression (if available and selected)
  if (sections.summary && data.firstImpression) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('First Impression', margin, yPos);
    yPos += 8;
    
    addWrappedText(data.firstImpression, 11, darkGray, contentWidth);
    yPos += 5;
  }

  // Resume Summary
  if (sections.summary && data.improvedSummary) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Resume Summary', margin, yPos);
    yPos += 8;
    
    addWrappedText(data.improvedSummary, 11, darkGray, contentWidth);
    yPos += 5;
  }

  // Strengths & Areas for Improvement
  if (sections.strengths && (data.strengths || data.weaknesses)) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths & Areas for Improvement', margin, yPos);
    yPos += 8;

    if (data.strengths && data.strengths.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...sageGreen);
      doc.text('Strengths', margin, yPos);
      yPos += 6;

      data.strengths.forEach((strength) => {
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        const lines = doc.splitTextToSize(`• ${strength}`, contentWidth - 5);
        lines.forEach((line: string) => {
          doc.text(line, margin + 3, yPos);
          yPos += 5;
        });
      });
      yPos += 3;
    }

    if (data.weaknesses && data.weaknesses.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...sageGreen);
      doc.text('Areas for Improvement', margin, yPos);
      yPos += 6;

      data.weaknesses.forEach((weakness) => {
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        const lines = doc.splitTextToSize(`• ${weakness}`, contentWidth - 5);
        lines.forEach((line: string) => {
          doc.text(line, margin + 3, yPos);
          yPos += 5;
        });
      });
      yPos += 3;
    }
  }

  // Improved Resume Bullets
  if (sections.bullets && data.bulletAnalysis && data.bulletAnalysis.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Improved Resume Bullets', margin, yPos);
    yPos += 8;

    data.bulletAnalysis.slice(0, 5).forEach((bullet, index) => {
      checkPageBreak(25);
      doc.setFontSize(10);
      doc.setTextColor(...mediumGray);
      doc.setFont('helvetica', 'italic');
      const originalLines = doc.splitTextToSize(`Original: ${bullet.original}`, contentWidth - 5);
      originalLines.forEach((line: string) => {
        doc.text(line, margin + 3, yPos);
        yPos += 4.5;
      });
      
      yPos += 1;
      doc.setTextColor(...sageGreen);
      doc.setFont('helvetica', 'bold');
      const improvedLines = doc.splitTextToSize(`Improved: ${bullet.improved}`, contentWidth - 5);
      improvedLines.forEach((line: string) => {
        doc.text(line, margin + 3, yPos);
        yPos += 4.5;
      });
      yPos += 4;
    });
  }

  // Extracted Skills
  if (sections.skills && data.extractedSkills) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Extracted Skills', margin, yPos);
    yPos += 8;

    Object.entries(data.extractedSkills).forEach(([category, skills]) => {
      if (skills && skills.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...sageGreen);
        doc.text(category.charAt(0).toUpperCase() + category.slice(1), margin, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        const skillText = skills.join(' • ');
        const lines = doc.splitTextToSize(skillText, contentWidth - 5);
        lines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin + 3, yPos);
          yPos += 4;
        });
        yPos += 3;
      }
    });
  }

  // Career Direction Highlights
  if (sections.careerDirections && data.careerDirections && data.careerDirections.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Career Direction Highlights', margin, yPos);
    yPos += 8;

    data.careerDirections.slice(0, 2).forEach((direction) => {
      checkPageBreak(25);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...sageGreen);
      doc.text(`${direction.name} (Fit: ${direction.fitScore}%)`, margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray);
      const lines = doc.splitTextToSize(direction.summary, contentWidth - 5);
      lines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 3, yPos);
        yPos += 4.5;
      });
      yPos += 5;
    });
  }

  // Save the PDF
  const fileName = `sage-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
