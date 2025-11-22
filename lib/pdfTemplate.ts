export function generatePDFTemplate(data: {
  firstName?: string;
  date: string;
  sections: any;
  reportData: any;
}): string {
  const { firstName, date, sections, reportData } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #222;
      background: white;
      padding: 40px 50px;
    }
    
    .header {
      border-bottom: 3px solid #7F915F;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #d4dbc8 0%, #7A8E50 50%, #55613b 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-text {
      font-size: 18pt;
      font-weight: 600;
      color: #7A8E50;
    }
    
    .report-title {
      font-size: 20pt;
      font-weight: 600;
      color: #222;
      margin-bottom: 6px;
    }
    
    .report-meta {
      font-size: 9pt;
      color: #666;
    }
    
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: #222;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E5E5;
    }
    
    .section-content {
      color: #444;
    }
    
    .subsection {
      margin-bottom: 20px;
    }
    
    .subsection-title {
      font-size: 11pt;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    ul {
      margin-left: 20px;
      margin-top: 8px;
    }
    
    li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    
    .bullet-item {
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 3px solid #7F915F;
    }
    
    .bullet-label {
      font-size: 9pt;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .bullet-text {
      margin-bottom: 8px;
    }
    
    .bullet-original {
      color: #666;
      font-style: italic;
    }
    
    .bullet-improved {
      color: #222;
      background: #F5F7F1;
      padding: 8px 12px;
      border-radius: 4px;
      margin-top: 6px;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 12px;
    }
    
    .skill-category {
      page-break-inside: avoid;
    }
    
    .skill-category-title {
      font-size: 9pt;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .skill-tag {
      display: inline-block;
      padding: 4px 10px;
      background: #EEF2E8;
      border: 1px solid #E5E5E5;
      border-radius: 12px;
      font-size: 9pt;
      color: #444;
    }
    
    .career-card {
      background: #F4F7EF;
      border: 1px solid #E5E5E5;
      padding: 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .career-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }
    
    .career-title {
      font-size: 12pt;
      font-weight: 600;
      color: #222;
    }
    
    .career-fit {
      font-size: 9pt;
      color: #7F915F;
      font-weight: 600;
    }
    
    .career-summary {
      color: #444;
      line-height: 1.5;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        padding: 30px 40px;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="logo-text">Sage</span>
    </div>
    <h1 class="report-title">Career & Resume Intelligence Report</h1>
    <p class="report-meta">${firstName ? `Prepared for ${firstName} • ` : ''}${date}</p>
  </div>

  ${sections.summary && reportData.improvedSummary ? `
  <!-- Resume Summary -->
  <div class="section">
    <h2 class="section-title">Resume Summary</h2>
    <div class="section-content">
      <p>${reportData.improvedSummary}</p>
    </div>
  </div>
  ` : ''}

  ${sections.summary && reportData.firstImpression ? `
  <!-- First Impression -->
  <div class="section">
    <h2 class="section-title">First Impression</h2>
    <div class="section-content">
      <p>${reportData.firstImpression}</p>
    </div>
  </div>
  ` : ''}

  ${sections.strengths && (reportData.strengths?.length || reportData.weaknesses?.length) ? `
  <!-- Strengths & Areas for Improvement -->
  <div class="section">
    <h2 class="section-title">Strengths & Areas for Improvement</h2>
    <div class="section-content">
      ${reportData.strengths?.length ? `
      <div class="subsection">
        <h3 class="subsection-title">Key Strengths</h3>
        <ul>
          ${reportData.strengths.map((s: string) => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${reportData.weaknesses?.length ? `
      <div class="subsection">
        <h3 class="subsection-title">Areas for Improvement</h3>
        <ul>
          ${reportData.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${sections.bullets && reportData.bulletAnalysis?.length ? `
  <!-- Improved Resume Bullets -->
  <div class="section">
    <h2 class="section-title">Improved Resume Bullets</h2>
    <div class="section-content">
      ${reportData.bulletAnalysis.map((bullet: any) => `
        <div class="bullet-item">
          <div class="bullet-label">Original</div>
          <div class="bullet-text bullet-original">${bullet.original}</div>
          <div class="bullet-label">Improved</div>
          <div class="bullet-improved">${bullet.improved}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${sections.skills && reportData.extractedSkills ? `
  <!-- Extracted Skills -->
  <div class="section">
    <h2 class="section-title">Extracted Skills</h2>
    <div class="skills-grid">
      ${Object.entries(reportData.extractedSkills).map(([category, skills]: [string, any]) => `
        <div class="skill-category">
          <div class="skill-category-title">${category}</div>
          <div class="skill-tags">
            ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${sections.careerDirections && reportData.careerDirections?.length ? `
  <!-- Career Direction Highlights -->
  <div class="section">
    <h2 class="section-title">Career Direction Highlights</h2>
    <div class="section-content">
      ${reportData.careerDirections.slice(0, 2).map((direction: any) => `
        <div class="career-card">
          <div class="career-header">
            <span class="career-title">${direction.name}</span>
            <span class="career-fit">${direction.fitScore >= 75 ? 'High Fit' : direction.fitScore >= 60 ? 'Strong Fit' : 'Possible Fit'}</span>
          </div>
          <p class="career-summary">${direction.summary}</p>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

</body>
</html>
  `;
}
