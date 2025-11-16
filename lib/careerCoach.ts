/**
 * Career Coach Service Layer
 * 
 * This service layer provides centralized access to career coaching features.
 * Currently returns mock data, but structured to easily integrate with Azure OpenAI APIs.
 */

import { CareerRecommendation, ResumeIntel, JobMatchAnalysis } from "@/app/types/features";

/**
 * Get personalized career recommendations based on user profile
 * 
 * @param userProfile - User's psychographic profile and experience data
 * @returns Array of career recommendations with fit scores and details
 * 
 * TODO: Replace mock data with API call to /api/career-direction
 */
export async function getCareerRecommendations(userProfile: any): Promise<CareerRecommendation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock data - in production, this would call:
  // const response = await fetch('/api/career-direction', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userProfile })
  // });
  // return response.json();

  return [
    {
      id: "pm-senior",
      roleTitle: "Senior Product Manager",
      fitScore: 92,
      whyItFits: [
        "Your strategic thinking and ability to connect dots across complex systems aligns perfectly with product vision work",
        "Strong stakeholder management skills essential for cross-functional leadership",
        "Data-driven approach matches the analytical rigor needed for product decisions"
      ],
      strengthsUsed: [
        "Strategic Vision",
        "Cross-functional Leadership",
        "Data-Driven Decision Making",
        "User Empathy"
      ],
      keySkills: [
        "Product Roadmapping",
        "Stakeholder Management",
        "User Research",
        "SQL & Analytics",
        "Agile Methodologies"
      ],
      description: "Senior Product Managers lead the product vision and strategy for major product lines or platforms. They own end-to-end product lifecycle from conception through launch and iteration, balancing customer needs with business objectives.",
      responsibilities: [
        "Define and communicate product vision and strategy aligned with company objectives",
        "Lead cross-functional teams (Engineering, Design, Marketing, Sales) to deliver impactful products",
        "Conduct market research and competitive analysis to identify opportunities",
        "Build and maintain product roadmaps with clear prioritization frameworks",
        "Define success metrics and drive data-informed product decisions",
        "Collaborate with stakeholders across all levels including C-suite executives",
        "Mentor junior PMs and contribute to product management best practices"
      ],
      gaps: [
        "Limited experience with B2B SaaS pricing models and monetization strategies",
        "Could strengthen technical depth in API design and platform architecture",
        "Minimal exposure to enterprise sales cycles and procurement processes"
      ],
      nextSteps: [
        "Take on a pricing optimization project to build commercial acumen",
        "Partner with engineering lead on next API release to deepen technical knowledge",
        "Shadow enterprise sales team during 2-3 major deal cycles",
        "Complete 'Reforge Product Strategy' course to formalize strategic frameworks",
        "Seek mentor who has scaled products from $10M to $100M+ ARR"
      ]
    },
    {
      id: "gpm",
      roleTitle: "Group Product Manager",
      fitScore: 88,
      whyItFits: [
        "Your leadership style emphasizes empowerment and mentorship, key for managing a team of PMs",
        "Systems thinking ability helps coordinate across multiple product areas",
        "Experience driving alignment across diverse stakeholders translates well to managing competing priorities"
      ],
      strengthsUsed: [
        "Team Leadership & Mentorship",
        "Strategic Coordination",
        "Influence Without Authority",
        "Long-term Planning"
      ],
      keySkills: [
        "Team Management",
        "Portfolio Strategy",
        "Resource Allocation",
        "Executive Communication",
        "Hiring & Talent Development"
      ],
      description: "Group Product Managers lead teams of 3-7 Product Managers, setting strategic direction for an entire product portfolio or business unit. This role focuses on people leadership, cross-portfolio coordination, and executive-level strategy.",
      responsibilities: [
        "Manage, mentor, and develop a team of Product Managers",
        "Define portfolio strategy and ensure alignment across multiple product areas",
        "Allocate resources and prioritize initiatives across the portfolio",
        "Present product strategy and results to executive leadership and board",
        "Build product management culture and establish team rituals and processes",
        "Partner with Engineering, Design, and Go-to-Market leadership on organizational goals",
        "Drive hiring, performance management, and career development for team members",
        "Identify strategic opportunities and threats across the product landscape"
      ],
      gaps: [
        "No direct experience managing other Product Managers yet",
        "Limited exposure to P&L ownership and budget management at portfolio scale",
        "Would benefit from more executive-level presentation experience"
      ],
      nextSteps: [
        "Volunteer to mentor 1-2 junior PMs or APMs in current organization",
        "Request involvement in budget planning and quarterly business reviews",
        "Join Toastmasters or similar to build executive presence and storytelling",
        "Take on 'acting GPM' role during manager's leave or reorganization",
        "Network with current GPMs to understand day-to-day challenges and best practices"
      ]
    },
    {
      id: "strategy-lead",
      roleTitle: "Product Strategy Lead",
      fitScore: 85,
      whyItFits: [
        "Your ability to see patterns and synthesize complex information is core to strategy work",
        "Comfort with ambiguity allows you to thrive in forward-looking, exploratory work",
        "Strong analytical skills enable rigorous market and competitive analysis"
      ],
      strengthsUsed: [
        "Strategic Analysis",
        "Pattern Recognition",
        "Market Research",
        "Storytelling & Communication"
      ],
      keySkills: [
        "Market Analysis",
        "Competitive Intelligence",
        "Business Modeling",
        "Stakeholder Presentations",
        "Trend Analysis"
      ],
      description: "Product Strategy Leads focus on long-term strategic direction, market opportunities, and competitive positioning. They work closely with executive leadership to shape the 1-3 year product vision and identify new growth areas.",
      responsibilities: [
        "Conduct comprehensive market research and competitive landscape analysis",
        "Identify emerging trends, opportunities, and threats in the market",
        "Develop business cases for new product initiatives and market expansions",
        "Build financial models to evaluate strategic options and ROI",
        "Present strategic recommendations to C-suite and board of directors",
        "Partner with Product, Sales, and Marketing on go-to-market strategy",
        "Lead strategic planning processes including annual planning and OKR setting",
        "Monitor industry shifts and advise on portfolio pivots or innovations"
      ],
      gaps: [
        "Would benefit from formal training in financial modeling and business case development",
        "Limited experience with M&A evaluation or post-acquisition integration",
        "Could deepen expertise in emerging technologies (AI/ML, blockchain, etc.)"
      ],
      nextSteps: [
        "Complete a business strategy course (e.g., Harvard Business School Online)",
        "Build a financial model for a hypothetical product launch or market entry",
        "Set up quarterly 'strategy reviews' with leadership to practice presenting insights",
        "Deep dive into 2-3 emerging technologies through online courses and prototyping",
        "Join a product strategy community (Reforge, Product School) for peer learning"
      ]
    },
    {
      id: "cx-director",
      roleTitle: "Director of Customer Experience",
      fitScore: 81,
      whyItFits: [
        "Your empathy and user-centric mindset drive strong customer advocacy",
        "Experience connecting qualitative insights with quantitative data fits CX analytics",
        "Cross-functional collaboration skills essential for driving experience improvements"
      ],
      strengthsUsed: [
        "Customer Empathy",
        "Cross-functional Collaboration",
        "Data Analysis",
        "Process Optimization"
      ],
      keySkills: [
        "Customer Journey Mapping",
        "NPS & CSAT Analytics",
        "Voice of Customer Programs",
        "Support Operations",
        "CRM Systems"
      ],
      description: "Directors of Customer Experience own the end-to-end customer journey, ensuring exceptional experiences from onboarding through renewal. They bridge Product, Support, Success, and Sales to create seamless customer interactions.",
      responsibilities: [
        "Define and optimize the end-to-end customer journey across all touchpoints",
        "Establish CX metrics (NPS, CSAT, CES) and drive continuous improvement",
        "Lead Voice of Customer programs including feedback loops and advisory boards",
        "Partner with Product on customer insights to inform roadmap prioritization",
        "Manage customer support and success operations for efficiency and quality",
        "Implement CX technology stack (CRM, support tools, survey platforms)",
        "Drive customer retention and expansion through proactive experience design",
        "Present CX insights and trends to executive leadership quarterly"
      ],
      gaps: [
        "Limited hands-on experience with customer support operations and tooling",
        "Could strengthen knowledge of CX-specific metrics and industry benchmarks",
        "Would benefit from exposure to customer success/account management motions"
      ],
      nextSteps: [
        "Shadow customer support team for 1-2 weeks to understand frontline challenges",
        "Get certified in CX platforms like Zendesk, Salesforce Service Cloud, or Gainsight",
        "Lead a customer journey mapping workshop for a key product or segment",
        "Attend CXPA (Customer Experience Professionals Association) events and certification",
        "Partner with Customer Success on a retention initiative to build CS expertise"
      ]
    },
    {
      id: "innovation-pm",
      roleTitle: "Innovation Product Manager (0→1)",
      fitScore: 87,
      whyItFits: [
        "Your tolerance for ambiguity and experimental mindset fit the uncertainty of 0→1 work",
        "Creative problem-solving ability essential for discovering new product-market fit",
        "Comfort with rapid iteration and learning from failure critical for innovation"
      ],
      strengthsUsed: [
        "Creative Problem Solving",
        "Rapid Experimentation",
        "Comfort with Ambiguity",
        "Customer Discovery"
      ],
      keySkills: [
        "Lean Startup Methodology",
        "Customer Development",
        "Prototyping & MVPs",
        "Growth Hacking",
        "Startup Metrics"
      ],
      description: "Innovation PMs explore new product opportunities, often in incubation or R&D teams. They run rapid experiments to validate hypotheses, discover product-market fit, and build new products from scratch before scaling them.",
      responsibilities: [
        "Identify and validate new product opportunities through customer discovery",
        "Design and execute rapid experiments to test product hypotheses",
        "Build MVPs and prototypes with minimal resources to learn quickly",
        "Conduct extensive user research and iterate based on feedback",
        "Define initial metrics and success criteria for early-stage products",
        "Pitch new product ideas to leadership with supporting evidence",
        "Navigate ambiguity and make decisions with limited data",
        "Transition successful experiments to scale teams or sunset failed ones"
      ],
      gaps: [
        "Would benefit from more exposure to lean startup and design sprint methodologies",
        "Limited experience building products from absolute zero (pre-PMF)",
        "Could strengthen technical prototyping skills (low-code tools, Figma advanced features)"
      ],
      nextSteps: [
        "Read 'The Lean Startup' and 'The Mom Test' to build 0→1 frameworks",
        "Run a side project or weekend hackathon to practice building from scratch",
        "Get certified in Design Sprints (Google Ventures methodology)",
        "Learn no-code tools like Bubble, Webflow, or Retool for rapid prototyping",
        "Join or shadow an innovation/incubation team for 1-2 quarters"
      ]
    }
  ];
}

/**
 * Analyze resume and LinkedIn profile for strengths, gaps, and improvements
 * 
 * @param userProfile - User's profile data including resume and LinkedIn text
 * @returns Analysis with strengths, gaps, improved bullets, and LinkedIn summary
 * 
 * TODO: Replace mock data with API call to /api/resume-intelligence
 */
export async function getResumeIntel(userProfile: any): Promise<ResumeIntel> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock data - in production, this would call:
  // const response = await fetch('/api/resume-intelligence', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userProfile })
  // });
  // return response.json();

  return {
    strengths: [
      "Strong impact orientation - You consistently frame achievements in terms of business outcomes",
      "Good leadership framing - Your experience demonstrates clear progression from IC to leadership roles",
      "Quantitative credibility - Effective use of metrics (e.g., '30% increase', '50+ team members')",
      "Strategic thinking demonstrated - Projects show ability to connect tactical work to business strategy",
      "Cross-functional collaboration highlighted - Clear evidence of working across teams and departments"
    ],
    gaps: [
      "Scope not always clear - Some bullets lack context about team size, budget, or project scale",
      "No metrics on several outcomes - 3 bullets describe activities without quantifying results",
      "Technical depth unclear - For engineering roles, specific technologies/frameworks could be more prominent",
      "Missing 'So what?' - Some achievements listed without explaining why they mattered to the business",
      "LinkedIn summary too operational - Current About section focuses on tasks rather than unique value proposition"
    ],
    improvedBullets: [
      {
        original: "Led product development for new customer dashboard feature",
        improved: "Led cross-functional team of 8 (Eng, Design, Data) to ship customer analytics dashboard, driving 40% increase in user engagement and reducing churn by 15% within first quarter"
      },
      {
        original: "Managed stakeholder relationships and gathered requirements",
        improved: "Partnered with 12+ stakeholders across Sales, Marketing, and Support to prioritize Q3 roadmap, aligning on $2M initiative that increased customer LTV by 25%"
      },
      {
        original: "Implemented agile processes for the product team",
        improved: "Redesigned product development process by introducing 2-week sprints and OKR framework, accelerating feature velocity by 35% and improving on-time delivery from 60% to 90%"
      },
      {
        original: "Conducted user research and analyzed data to inform decisions",
        improved: "Executed 20+ user interviews and analyzed usage data from 50K+ users to validate new pricing model, resulting in 22% increase in conversion rate and $1.2M ARR lift"
      },
      {
        original: "Collaborated with engineering team on technical roadmap",
        improved: "Co-authored 6-month technical roadmap with Engineering VP, prioritizing platform scalability initiatives that reduced infrastructure costs by $400K annually while supporting 3x user growth"
      }
    ],
    improvedLinkedInSummary: `I'm a product leader who turns ambiguity into impact.

Over the past 7 years, I've built and scaled products that users love and businesses depend on—from 0→1 MVPs to platforms serving millions. My superpower? Connecting the dots between customer pain, business strategy, and technical feasibility to ship solutions that move the needle.

What drives me:
→ Finding the simplest path to maximum impact (because great products are never done, they're just released)
→ Building high-trust teams where everyone feels ownership and psychological safety
→ Using data as a flashlight, not a hammer—letting insights guide, not dictate

Recent highlights:
• Launched B2B SaaS platform that grew from 0 to $5M ARR in 18 months
• Led product org through 3x scale (team growth from 4 to 15 PMs)
• Shipped analytics dashboard that became #1 driver of customer retention

I believe the best product decisions come from curiosity, not certainty. Always learning, always iterating.

Let's connect if you're working on hard problems in [your domain/industry].`
  };
}

/**
 * Analyze job match between user profile and job description
 * 
 * @param jobDescription - Full text of job posting
 * @param userProfile - User's profile and resume data
 * @returns Match analysis with score, strengths, gaps, and tailored bullets
 * 
 * TODO: Replace mock data with API call to /api/job-match
 */
export async function getJobMatch(jobDescription: string, userProfile: any): Promise<JobMatchAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock data - in production, this would call:
  // const response = await fetch('/api/job-match', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ jobDescription, userProfile })
  // });
  // return response.json();

  return {
    matchScore: 78,
    strengths: [
      "Strong product management experience aligns perfectly with the 'lead product strategy' requirement",
      "Demonstrated cross-functional leadership matches the need to 'collaborate with engineering, design, and marketing teams'",
      "Data-driven approach evident in your background fits their emphasis on 'metrics-driven decision making'"
    ],
    gaps: [
      "Job requires 'experience with B2B SaaS at scale (100K+ users)' - your profile shows smaller user bases",
      "They want 'proven track record of pricing and monetization strategy' - this isn't highlighted in your experience",
      "Looking for 'API product experience' - only general product work is mentioned",
      "Requires 'enterprise sales cycle knowledge' - no explicit mention of working with enterprise customers",
      "Prefers candidates with 'experience in fintech or payments' - your background is in different verticals"
    ],
    suggestedActions: [
      "Add a bullet about the largest user base you've managed, even if under 100K, to show scale experience",
      "Highlight any pricing decisions you've influenced, even indirectly (e.g., 'Provided data analysis that informed pricing tier changes')",
      "If you've worked on any integrations or platform features, reframe them as 'API product work'",
      "Mention any interaction with enterprise customers or participation in sales calls",
      "Research fintech/payments terminology and weave relevant concepts into your cover letter",
      "Emphasize transferable skills: complexity management, compliance considerations, trust & security focus",
      "Reach out to someone at the company to learn more about their specific challenges and tailor your narrative"
    ],
    tailoredBullets: [
      "Led product strategy for [your product] serving 45K active users, driving 30% growth in engagement through data-informed feature prioritization and cross-functional collaboration with Engineering, Design, and Marketing teams",
      "Partnered with Sales and Finance leadership to optimize pricing model, resulting in 22% increase in conversion rate and $1.2M incremental ARR through strategic tier restructuring",
      "Shipped platform integration capabilities enabling 15+ third-party apps to connect via RESTful APIs, expanding ecosystem reach and driving 18% increase in enterprise adoption",
      "Collaborated with enterprise sales team on 10+ strategic deals (avg. ACV $150K+), translating complex customer requirements into product roadmap items and contributing to 85% win rate",
      "Drove security and compliance initiatives including SOC 2 Type II certification and GDPR readiness, establishing trust framework critical for enterprise fintech partnerships"
    ]
  };
}
