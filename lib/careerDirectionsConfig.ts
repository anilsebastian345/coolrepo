export const careerDirectionsConfig = {
  creative_expression: {
    id: 'creative_expression',
    name: 'Creative & Expression',
    baseSummary: 'Roles where you create, design, and communicate through various media and formats.',
    tags: ['creative', 'hands_on'],
    environments: ['env_startup', 'env_freelance'],
    clusters: [
      {
        id: 'design_ux',
        name: 'Design & UX',
        summary: 'Creating visual and interactive experiences for products and services.',
        examplePaths: [
          {
            id: 'ux_designer',
            name: 'UX/UI Designer',
            stageHint: 'early_career' as const,
            description: 'Design user interfaces and experiences for digital products.'
          },
          {
            id: 'graphic_designer',
            name: 'Graphic Designer',
            stageHint: 'any' as const,
            description: 'Create visual content for brands, marketing, and communications.'
          },
          {
            id: 'product_designer',
            name: 'Product Designer',
            stageHint: 'mid_career' as const,
            description: 'Lead design strategy for entire products from concept to launch.'
          }
        ]
      },
      {
        id: 'writing_content',
        name: 'Writing & Content',
        summary: 'Crafting stories, copy, and content across various formats and audiences.',
        examplePaths: [
          {
            id: 'content_writer',
            name: 'Content Writer',
            stageHint: 'recent_grad' as const,
            description: 'Write articles, blogs, and web content for various audiences.'
          },
          {
            id: 'technical_writer',
            name: 'Technical Writer',
            stageHint: 'early_career' as const,
            description: 'Create documentation, guides, and instructional materials.'
          },
          {
            id: 'creative_director',
            name: 'Creative Director',
            stageHint: 'senior' as const,
            description: 'Lead creative vision and strategy for campaigns and projects.'
          }
        ]
      },
      {
        id: 'visual_arts_media',
        name: 'Visual Arts & Media',
        summary: 'Working with video, photography, animation, and multimedia production.',
        examplePaths: [
          {
            id: 'video_editor',
            name: 'Video Editor',
            stageHint: 'any' as const,
            description: 'Edit and produce video content for various platforms.'
          },
          {
            id: 'photographer',
            name: 'Photographer',
            stageHint: 'any' as const,
            description: 'Capture images for events, products, or artistic projects.'
          },
          {
            id: 'animator',
            name: 'Animator',
            stageHint: 'early_career' as const,
            description: 'Create animated content for films, games, or marketing.'
          }
        ]
      }
    ]
  },

  people_helping_care: {
    id: 'people_helping_care',
    name: 'People-Helping & Care',
    baseSummary: 'Direct service roles focused on health, wellbeing, and supporting others.',
    tags: ['people_helping'],
    environments: ['env_public_impact', 'env_large_org'],
    clusters: [
      {
        id: 'healthcare_nursing',
        name: 'Healthcare & Nursing',
        summary: 'Providing medical care and health services to patients and communities.',
        examplePaths: [
          {
            id: 'registered_nurse',
            name: 'Registered Nurse',
            stageHint: 'any' as const,
            description: 'Provide patient care in hospitals, clinics, or community settings.'
          },
          {
            id: 'nurse_practitioner',
            name: 'Nurse Practitioner',
            stageHint: 'mid_career' as const,
            description: 'Advanced practice nursing with diagnostic and prescriptive authority.'
          },
          {
            id: 'medical_assistant',
            name: 'Medical Assistant',
            stageHint: 'recent_grad' as const,
            description: 'Support healthcare teams with clinical and administrative tasks.'
          }
        ]
      },
      {
        id: 'counseling_therapy',
        name: 'Counseling & Therapy',
        summary: 'Supporting mental health and wellbeing through therapeutic relationships.',
        examplePaths: [
          {
            id: 'therapist',
            name: 'Licensed Therapist',
            stageHint: 'mid_career' as const,
            description: 'Provide mental health counseling and therapeutic interventions.'
          },
          {
            id: 'school_counselor',
            name: 'School Counselor',
            stageHint: 'early_career' as const,
            description: 'Support students with academic, career, and personal development.'
          },
          {
            id: 'social_worker',
            name: 'Social Worker',
            stageHint: 'any' as const,
            description: 'Help individuals and families navigate challenges and access resources.'
          }
        ]
      },
      {
        id: 'customer_support_care',
        name: 'Customer Support & Care',
        summary: 'Helping customers solve problems and have positive experiences.',
        examplePaths: [
          {
            id: 'customer_success',
            name: 'Customer Success Manager',
            stageHint: 'early_career' as const,
            description: 'Build relationships and ensure customers get value from products.'
          },
          {
            id: 'support_specialist',
            name: 'Support Specialist',
            stageHint: 'recent_grad' as const,
            description: 'Help customers resolve issues via phone, chat, or email.'
          },
          {
            id: 'care_coordinator',
            name: 'Patient Care Coordinator',
            stageHint: 'any' as const,
            description: 'Coordinate care services and communicate with patients and families.'
          }
        ]
      }
    ]
  },

  social_impact_education: {
    id: 'social_impact_education',
    name: 'Social Impact & Education',
    baseSummary: 'Teaching, training, and working on issues that benefit communities and society.',
    tags: ['people_helping', 'leading'],
    environments: ['env_public_impact', 'env_large_org'],
    clusters: [
      {
        id: 'teaching_training',
        name: 'Teaching & Training',
        summary: 'Educating and developing others in academic or professional settings.',
        examplePaths: [
          {
            id: 'teacher',
            name: 'K-12 Teacher',
            stageHint: 'any' as const,
            description: 'Teach students in elementary, middle, or high school settings.'
          },
          {
            id: 'corporate_trainer',
            name: 'Corporate Trainer',
            stageHint: 'mid_career' as const,
            description: 'Design and deliver training programs for employees.'
          },
          {
            id: 'instructional_designer',
            name: 'Instructional Designer',
            stageHint: 'early_career' as const,
            description: 'Create educational materials and learning experiences.'
          }
        ]
      },
      {
        id: 'community_ngo',
        name: 'Community & NGO Work',
        summary: 'Working with nonprofits and community organizations on local issues.',
        examplePaths: [
          {
            id: 'program_coordinator',
            name: 'Program Coordinator',
            stageHint: 'recent_grad' as const,
            description: 'Manage community programs and support service delivery.'
          },
          {
            id: 'ngo_director',
            name: 'Nonprofit Director',
            stageHint: 'senior' as const,
            description: 'Lead organizational strategy and fundraising for nonprofits.'
          },
          {
            id: 'grant_writer',
            name: 'Grant Writer',
            stageHint: 'early_career' as const,
            description: 'Research and write proposals to secure funding for programs.'
          }
        ]
      },
      {
        id: 'advocacy_policy',
        name: 'Advocacy & Policy',
        summary: 'Influencing systems, regulations, and public policy for social good.',
        examplePaths: [
          {
            id: 'policy_analyst',
            name: 'Policy Analyst',
            stageHint: 'mid_career' as const,
            description: 'Research and analyze policies to inform decision-making.'
          },
          {
            id: 'community_organizer',
            name: 'Community Organizer',
            stageHint: 'any' as const,
            description: 'Mobilize communities around issues and campaigns.'
          },
          {
            id: 'legislative_aide',
            name: 'Legislative Aide',
            stageHint: 'recent_grad' as const,
            description: 'Support elected officials with research and constituent services.'
          }
        ]
      }
    ]
  },

  business_strategy_leadership: {
    id: 'business_strategy_leadership',
    name: 'Business, Strategy & Leadership',
    baseSummary: 'Driving business outcomes, leading teams, and shaping organizational direction.',
    tags: ['leading', 'analytical', 'systems_building'],
    environments: ['env_large_org', 'env_mid_growth', 'env_startup'],
    clusters: [
      {
        id: 'management_leadership',
        name: 'Management & Leadership',
        summary: 'Leading teams and departments to achieve goals and develop people.',
        examplePaths: [
          {
            id: 'team_manager',
            name: 'Team Manager',
            stageHint: 'mid_career' as const,
            description: 'Lead a team to deliver results and develop talent.'
          },
          {
            id: 'department_head',
            name: 'Department Head',
            stageHint: 'senior' as const,
            description: 'Oversee entire department strategy, budgets, and operations.'
          },
          {
            id: 'people_manager',
            name: 'People Manager',
            stageHint: 'early_career' as const,
            description: 'Manage a small team while contributing individually.'
          }
        ]
      },
      {
        id: 'strategy_product',
        name: 'Strategy & Product',
        summary: 'Defining product vision, strategy, and roadmaps for business success.',
        examplePaths: [
          {
            id: 'product_manager',
            name: 'Product Manager',
            stageHint: 'mid_career' as const,
            description: 'Own product strategy and work cross-functionally to ship features.'
          },
          {
            id: 'strategy_consultant',
            name: 'Strategy Consultant',
            stageHint: 'early_career' as const,
            description: 'Advise clients on business strategy and transformation.'
          },
          {
            id: 'business_analyst',
            name: 'Business Analyst',
            stageHint: 'recent_grad' as const,
            description: 'Analyze business processes and recommend improvements.'
          }
        ]
      },
      {
        id: 'general_business',
        name: 'General Business Roles',
        summary: 'Supporting business functions like sales, marketing, and operations.',
        examplePaths: [
          {
            id: 'account_executive',
            name: 'Account Executive',
            stageHint: 'early_career' as const,
            description: 'Build relationships and close deals with clients.'
          },
          {
            id: 'marketing_manager',
            name: 'Marketing Manager',
            stageHint: 'mid_career' as const,
            description: 'Plan and execute marketing campaigns and brand strategy.'
          },
          {
            id: 'business_development',
            name: 'Business Development Rep',
            stageHint: 'recent_grad' as const,
            description: 'Generate leads and grow business partnerships.'
          }
        ]
      }
    ]
  },

  analytical_research: {
    id: 'analytical_research',
    name: 'Analytical & Research',
    baseSummary: 'Deep work with data, numbers, and systematic investigation to find insights.',
    tags: ['analytical', 'technical_building'],
    environments: ['env_research', 'env_large_org'],
    clusters: [
      {
        id: 'data_analytics',
        name: 'Data & Analytics',
        summary: 'Working with data to uncover patterns and drive decision-making.',
        examplePaths: [
          {
            id: 'data_analyst',
            name: 'Data Analyst',
            stageHint: 'recent_grad' as const,
            description: 'Analyze datasets and create reports to inform business decisions.'
          },
          {
            id: 'data_scientist',
            name: 'Data Scientist',
            stageHint: 'mid_career' as const,
            description: 'Build models and algorithms to solve complex problems.'
          },
          {
            id: 'analytics_engineer',
            name: 'Analytics Engineer',
            stageHint: 'early_career' as const,
            description: 'Build data pipelines and infrastructure for analytics teams.'
          }
        ]
      },
      {
        id: 'research_experimentation',
        name: 'Research & Experimentation',
        summary: 'Conducting studies, experiments, and investigations in various fields.',
        examplePaths: [
          {
            id: 'research_scientist',
            name: 'Research Scientist',
            stageHint: 'mid_career' as const,
            description: 'Design and conduct research studies in academic or industry labs.'
          },
          {
            id: 'ux_researcher',
            name: 'UX Researcher',
            stageHint: 'early_career' as const,
            description: 'Study user behavior to inform product design decisions.'
          },
          {
            id: 'lab_technician',
            name: 'Lab Technician',
            stageHint: 'recent_grad' as const,
            description: 'Support research by conducting tests and maintaining equipment.'
          }
        ]
      },
      {
        id: 'finance_analysis',
        name: 'Finance & Analysis',
        summary: 'Financial modeling, forecasting, and investment analysis.',
        examplePaths: [
          {
            id: 'financial_analyst',
            name: 'Financial Analyst',
            stageHint: 'recent_grad' as const,
            description: 'Build models and analyze financial performance.'
          },
          {
            id: 'accountant',
            name: 'Accountant',
            stageHint: 'any' as const,
            description: 'Manage financial records, taxes, and compliance.'
          },
          {
            id: 'investment_analyst',
            name: 'Investment Analyst',
            stageHint: 'early_career' as const,
            description: 'Evaluate investment opportunities and market trends.'
          }
        ]
      }
    ]
  },

  technical_engineering_digital: {
    id: 'technical_engineering_digital',
    name: 'Technical, Engineering & Digital',
    baseSummary: 'Building software, systems, and digital products through technical expertise.',
    tags: ['technical_building', 'systems_building', 'analytical'],
    environments: ['env_startup', 'env_mid_growth', 'env_large_org'],
    clusters: [
      {
        id: 'software_it',
        name: 'Software & IT',
        summary: 'Developing applications, websites, and maintaining IT infrastructure.',
        examplePaths: [
          {
            id: 'software_engineer',
            name: 'Software Engineer',
            stageHint: 'any' as const,
            description: 'Build and maintain software applications and systems.'
          },
          {
            id: 'frontend_developer',
            name: 'Frontend Developer',
            stageHint: 'early_career' as const,
            description: 'Create user interfaces and web experiences.'
          },
          {
            id: 'it_specialist',
            name: 'IT Support Specialist',
            stageHint: 'recent_grad' as const,
            description: 'Maintain systems and help users with technical issues.'
          }
        ]
      },
      {
        id: 'hardware_systems',
        name: 'Hardware & Systems',
        summary: 'Working with physical systems, electronics, and infrastructure.',
        examplePaths: [
          {
            id: 'systems_engineer',
            name: 'Systems Engineer',
            stageHint: 'mid_career' as const,
            description: 'Design and maintain complex technical systems.'
          },
          {
            id: 'network_engineer',
            name: 'Network Engineer',
            stageHint: 'early_career' as const,
            description: 'Build and maintain network infrastructure.'
          },
          {
            id: 'hardware_engineer',
            name: 'Hardware Engineer',
            stageHint: 'any' as const,
            description: 'Design and test electronic devices and components.'
          }
        ]
      },
      {
        id: 'data_ml_engineering',
        name: 'Data/ML Engineering',
        summary: 'Building data infrastructure and machine learning systems.',
        examplePaths: [
          {
            id: 'ml_engineer',
            name: 'ML Engineer',
            stageHint: 'mid_career' as const,
            description: 'Build and deploy machine learning models in production.'
          },
          {
            id: 'data_engineer',
            name: 'Data Engineer',
            stageHint: 'early_career' as const,
            description: 'Build pipelines and infrastructure for data processing.'
          },
          {
            id: 'devops_engineer',
            name: 'DevOps Engineer',
            stageHint: 'mid_career' as const,
            description: 'Automate deployment and maintain infrastructure.'
          }
        ]
      }
    ]
  },

  operations_systems_logistics: {
    id: 'operations_systems_logistics',
    name: 'Operations, Systems & Logistics',
    baseSummary: 'Making organizations run smoothly through process, coordination, and execution.',
    tags: ['systems_building', 'analytical'],
    environments: ['env_large_org', 'env_mid_growth'],
    clusters: [
      {
        id: 'supply_chain_logistics',
        name: 'Supply Chain & Logistics',
        summary: 'Managing the flow of goods, inventory, and distribution.',
        examplePaths: [
          {
            id: 'supply_chain_analyst',
            name: 'Supply Chain Analyst',
            stageHint: 'early_career' as const,
            description: 'Optimize inventory, procurement, and logistics processes.'
          },
          {
            id: 'logistics_coordinator',
            name: 'Logistics Coordinator',
            stageHint: 'recent_grad' as const,
            description: 'Coordinate shipments and manage transportation schedules.'
          },
          {
            id: 'operations_manager',
            name: 'Operations Manager',
            stageHint: 'mid_career' as const,
            description: 'Oversee warehouse, distribution, or fulfillment operations.'
          }
        ]
      },
      {
        id: 'operations_process',
        name: 'Operations & Process',
        summary: 'Improving workflows, efficiency, and operational excellence.',
        examplePaths: [
          {
            id: 'process_improvement',
            name: 'Process Improvement Specialist',
            stageHint: 'mid_career' as const,
            description: 'Analyze and optimize business processes using Lean/Six Sigma.'
          },
          {
            id: 'operations_coordinator',
            name: 'Operations Coordinator',
            stageHint: 'recent_grad' as const,
            description: 'Support day-to-day operations and coordinate across teams.'
          },
          {
            id: 'project_manager',
            name: 'Project Manager',
            stageHint: 'early_career' as const,
            description: 'Plan and execute projects on time and within budget.'
          }
        ]
      },
      {
        id: 'admin_coordination',
        name: 'Admin & Coordination',
        summary: 'Organizing, scheduling, and supporting teams and executives.',
        examplePaths: [
          {
            id: 'executive_assistant',
            name: 'Executive Assistant',
            stageHint: 'any' as const,
            description: 'Support executives with scheduling, communications, and projects.'
          },
          {
            id: 'office_manager',
            name: 'Office Manager',
            stageHint: 'early_career' as const,
            description: 'Manage office operations, vendors, and workplace experience.'
          },
          {
            id: 'program_manager',
            name: 'Program Manager',
            stageHint: 'mid_career' as const,
            description: 'Oversee multiple projects and cross-functional initiatives.'
          }
        ]
      }
    ]
  },

  hands_on_trades_craft: {
    id: 'hands_on_trades_craft',
    name: 'Hands-On, Trades & Craft',
    baseSummary: 'Physical, skilled work creating tangible results through expertise and craft.',
    tags: ['hands_on'],
    environments: ['env_freelance', 'env_outdoors'],
    clusters: [
      {
        id: 'trades_field',
        name: 'Trades & Field Work',
        summary: 'Skilled trades like electrical, plumbing, HVAC, and construction.',
        examplePaths: [
          {
            id: 'electrician',
            name: 'Electrician',
            stageHint: 'any' as const,
            description: 'Install, maintain, and repair electrical systems.'
          },
          {
            id: 'hvac_technician',
            name: 'HVAC Technician',
            stageHint: 'any' as const,
            description: 'Service heating, cooling, and ventilation systems.'
          },
          {
            id: 'plumber',
            name: 'Plumber',
            stageHint: 'any' as const,
            description: 'Install and repair water and drainage systems.'
          },
          {
            id: 'carpenter',
            name: 'Carpenter',
            stageHint: 'any' as const,
            description: 'Build and repair wooden structures and furniture.'
          }
        ]
      },
      {
        id: 'culinary_kitchen',
        name: 'Culinary & Kitchen',
        summary: 'Food preparation, cooking, and hospitality work.',
        examplePaths: [
          {
            id: 'chef',
            name: 'Chef',
            stageHint: 'mid_career' as const,
            description: 'Lead kitchen operations and create menus.'
          },
          {
            id: 'line_cook',
            name: 'Line Cook',
            stageHint: 'any' as const,
            description: 'Prepare dishes in commercial kitchen settings.'
          },
          {
            id: 'pastry_chef',
            name: 'Pastry Chef',
            stageHint: 'early_career' as const,
            description: 'Create baked goods and desserts for restaurants or bakeries.'
          }
        ]
      },
      {
        id: 'craft_making',
        name: 'Craft & Making',
        summary: 'Creating handmade goods, art, and physical products.',
        examplePaths: [
          {
            id: 'artisan',
            name: 'Artisan/Craftsperson',
            stageHint: 'any' as const,
            description: 'Create handmade products like jewelry, pottery, or woodwork.'
          },
          {
            id: 'machinist',
            name: 'Machinist',
            stageHint: 'any' as const,
            description: 'Operate machines to create precision metal parts.'
          },
          {
            id: 'welder',
            name: 'Welder',
            stageHint: 'any' as const,
            description: 'Join metal parts through welding for construction or manufacturing.'
          }
        ]
      }
    ]
  },

  entrepreneurship_self_directed: {
    id: 'entrepreneurship_self_directed',
    name: 'Entrepreneurship & Self-Directed Work',
    baseSummary: 'Creating your own path through business ownership, freelancing, or independent work.',
    tags: ['leading', 'creative', 'systems_building'],
    environments: ['env_freelance', 'env_startup'],
    clusters: [
      {
        id: 'small_business',
        name: 'Small Business',
        summary: 'Starting and running your own business venture.',
        examplePaths: [
          {
            id: 'business_owner',
            name: 'Small Business Owner',
            stageHint: 'any' as const,
            description: 'Launch and operate a business in retail, service, or other sectors.'
          },
          {
            id: 'restaurant_owner',
            name: 'Restaurant/Cafe Owner',
            stageHint: 'mid_career' as const,
            description: 'Own and manage a food service establishment.'
          },
          {
            id: 'franchise_owner',
            name: 'Franchise Owner',
            stageHint: 'senior' as const,
            description: 'Operate a franchise location of an established brand.'
          }
        ]
      },
      {
        id: 'freelance_consulting',
        name: 'Freelancing/Consulting',
        summary: 'Offering specialized services to clients on a project basis.',
        examplePaths: [
          {
            id: 'freelance_designer',
            name: 'Freelance Designer',
            stageHint: 'early_career' as const,
            description: 'Take on design projects for multiple clients.'
          },
          {
            id: 'independent_consultant',
            name: 'Independent Consultant',
            stageHint: 'senior' as const,
            description: 'Advise organizations based on deep expertise in your field.'
          },
          {
            id: 'contract_developer',
            name: 'Contract Developer',
            stageHint: 'mid_career' as const,
            description: 'Build software solutions for clients on contract basis.'
          }
        ]
      },
      {
        id: 'creator_solo',
        name: 'Creator/Solo Work',
        summary: 'Building an audience or income through content, products, or services.',
        examplePaths: [
          {
            id: 'content_creator',
            name: 'Content Creator',
            stageHint: 'any' as const,
            description: 'Build audience through YouTube, podcasts, or social media.'
          },
          {
            id: 'online_course_creator',
            name: 'Online Course Creator',
            stageHint: 'mid_career' as const,
            description: 'Create and sell educational content in your area of expertise.'
          },
          {
            id: 'etsy_seller',
            name: 'Independent Seller',
            stageHint: 'any' as const,
            description: 'Sell handmade or curated products through online marketplaces.'
          }
        ]
      }
    ]
  }
};
