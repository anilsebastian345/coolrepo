import Image from 'next/image';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  return (
    <main className="bg-[#FAFAF6] min-h-screen">
      {/* HERO SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-widest text-[#7F915F] uppercase">
                Feature Overview
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#232323]">
                Your Personalized Career Dashboard
              </h1>
              <p className="text-lg text-[#4A4A4A]">
                A single view of your strengths, blind spots, career signals, and next steps.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md"
              >
                Go to my dashboard
              </Link>
            </div>

            {/* Right: Screenshot */}
            <div className="relative">
              <Image
                src="/sage-dashboard-preview.png"
                alt="Sage dashboard preview UI"
                width={600}
                height={400}
                priority
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            How the dashboard works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-[#232323]">
                Profile & strengths
              </h3>
              <p className="text-[#4A4A4A]">
                Uses your psychographic profile, leadership themes, and core strengths to understand who you are.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-[#232323]">
                Live career signals
              </h3>
              <p className="text-[#4A4A4A]">
                Pulls in role analyses, resume checks, and job match patterns to track your career exploration.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAFAF6] rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-[#232323]">
                Next-step guidance
              </h3>
              <p className="text-[#4A4A4A]">
                Surfaces 2–3 prioritized recommendations based on your current activity and goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL SEE SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-12">
            What you'll see at a glance
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: List */}
            <div className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span className="text-[#4A4A4A]">Your core theme and strengths</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span className="text-[#4A4A4A]">Key blind spots to watch for</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span className="text-[#4A4A4A]">Recent roles you've explored</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#7F915F] mt-1">•</span>
                  <span className="text-[#4A4A4A]">Current fit trends across roles</span>
                </li>
              </ul>
            </div>

            {/* Right: Mock Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#232323] mb-2">
                Career Overview
              </h3>
              <p className="text-sm text-[#6F6F6F] mb-6">
                Your activity at a glance
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#4A4A4A]">Avg fit:</span>
                  <span className="text-xl font-semibold text-[#7F915F]">74%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#4A4A4A]">Roles analyzed:</span>
                  <span className="text-xl font-semibold text-[#232323]">6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#232323] text-center mb-8">
            Why this matters for your career
          </h2>
          <p className="text-[#4A4A4A] text-center mb-8 max-w-2xl mx-auto">
            Your dashboard brings together insights from across Sage to help you make smarter career decisions.
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Helps prioritize where to focus — whether it's skills, roles, or your search strategy
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Reduces noise by pulling signals from multiple tools into one place
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#7F915F] mt-1">•</span>
              <span className="text-[#4A4A4A]">
                Makes progress visible over time so you can see how you're evolving
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / FOOTER SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#232323]">
            Ready to see your own dashboard?
          </h2>
          <p className="text-[#4A4A4A]">
            Sign in to access your personalized career intelligence hub or start exploring roles to build your profile.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-[#7F915F] text-white font-medium rounded-full hover:bg-[#6B7E45] transition-all shadow-sm hover:shadow-md"
            >
              Open my dashboard
            </Link>
            <Link
              href="/job-match"
              className="text-[#7F915F] hover:underline font-medium"
            >
              Explore role fit first →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
