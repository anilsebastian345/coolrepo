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
    href: '/dashboard',
    alt: 'Sage dashboard preview UI showing personalized career insights',
    label: 'Overview'
  },
  {
    id: 'career-fit',
    title: 'Career Fit & Direction',
    description: 'See which roles you naturally align with — and how your career path maps out.',
    image: '/sage-career-fit.png',
    href: '/career-map',
    alt: 'Sage career fit analysis showing role alignment and career direction map',
    label: 'F1 · Career Map'
  },
  {
    id: 'resume',
    title: 'Resume & Profile Intelligence',
    description: 'Smart, actionable insights that strengthen your resume and LinkedIn instantly.',
    image: '/sage-resume-analysis.png',
    href: '/resume-intel',
    alt: 'Sage resume analysis interface with smart recommendations',
    label: 'F2 · Resume'
  },
  {
    id: 'job-match',
    title: 'Job Match & Skill Gaps',
    description: 'Understand how you match to any job and what skills to build to stand out.',
    image: '/sage-role-fit.png',
    href: '/job-match',
    alt: 'Sage job match analysis showing fit score and skill gap recommendations',
    label: 'F3 · Role Fit'
  }
];

export default function FeatureShowcase() {
  return (
    <section id="feature-showcase" className="bg-[#FAFAF6] py-16">
      <div className="max-w-5xl mx-auto px-4">
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="h-full"
            >
              <div className="h-full rounded-2xl bg-white shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border border-[#E4E7D8]">
                {/* Image */}
                <div className="flex-1">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={600}
                    height={400}
                    className="w-full rounded-xl shadow-sm object-cover mb-4"
                  />

                  {/* Label Pill */}
                  <span className="inline-flex items-center px-2 py-0.5 mb-2 rounded-full bg-[#F3F4EE] text-[11px] font-medium text-[#6F6F6F]">
                    {feature.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-[#232323]">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 text-sm text-[#6F6F6F] leading-relaxed line-clamp-2">
                    {feature.description}
                  </p>
                </div>

                {/* Explore Link */}
                <div className="mt-4 text-sm text-[#7F915F] font-medium flex items-center gap-1">
                  <span>Explore</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
