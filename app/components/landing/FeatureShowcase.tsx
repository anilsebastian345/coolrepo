'use client';

import Image from 'next/image';
import Link from 'next/link';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  alt: string;
  label: string;
}

const features: FeatureCard[] = [
  {
    id: 'dashboard',
    title: 'Your Personalized Dashboard',
    description: 'A unified snapshot of your strengths, blind spots, career signals, and next steps.',
    image: '/sage-dashboard-preview.png',
    href: '/about/dashboard',
    alt: 'Sage dashboard preview UI showing personalized career insights',
    label: 'Overview'
  },
  {
    id: 'career-fit',
    title: 'Career Fit & Direction',
    description: 'See which roles you naturally align with — and how your career path maps out.',
    image: '/sage-career-fit.png',
    href: '/about/career-map',
    alt: 'Sage career fit analysis showing role alignment and career direction map',
    label: 'Career Map'
  },
  {
    id: 'resume',
    title: 'Resume & Profile Intelligence',
    description: 'Smart, actionable insights that strengthen your resume and LinkedIn instantly.',
    image: '/sage-resume-analysis.png',
    href: '/about/resume-intel',
    alt: 'Sage resume analysis interface with smart recommendations',
    label: 'Resume'
  },
  {
    id: 'job-match',
    title: 'Job Match & Skill Gaps',
    description: 'Understand how you match to any job and what skills to build to stand out.',
    image: '/sage-role-fit.png',
    href: '/about/job-match',
    alt: 'Sage job match analysis showing fit score and skill gap recommendations',
    label: 'Role Fit'
  }
];

export default function FeatureShowcase() {
  return (
    <section id="feature-showcase" className="bg-gradient-to-b from-[#F5F7F0] to-[#E8EEE0] py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[#232323]">
            How Sage Helps You Grow
          </h2>
          <p className="mt-2 text-sm text-[#6F6F6F] max-w-xl mx-auto">
            Your personalized career intelligence hub — all in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="h-full"
            >
              <div className="h-full rounded-2xl bg-white/18 border border-white/40 shadow-lg backdrop-blur-md p-5 flex flex-col hover:bg-white/26 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
                {/* Image */}
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={600}
                  height={400}
                  className="w-full rounded-xl shadow-sm object-cover mb-4"
                />

                {/* Content */}
                <div className="flex-1">
                  {/* Label Pill */}
                  <span className="inline-flex items-center px-2 py-0.5 mb-2 rounded-full bg-white/40 text-[11px] font-medium text-[#4F5A37]">
                    {feature.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-[#232323]">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 text-sm text-[#3F3F3F] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Explore Link */}
                <div className="mt-4 text-sm text-[#7F915F] font-medium flex items-center gap-1">
                  <span>Explore</span>
                  <span>↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
