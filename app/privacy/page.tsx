export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-emerald-700 mb-2">Legal</p>
        <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section>
          <p>
            Sage is an AI-powered career intelligence tool designed to help you make better career decisions. 
            This Privacy Policy explains what data we collect when you use Sage, how we use it, and how you 
            can contact us with questions or requests.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Information We Collect</h2>
          <p className="mb-3">
            When you use Sage, we collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address and basic profile information from sign-in providers (such as Google)</li>
            <li>Resume content, including uploaded files or text you provide</li>
            <li>Job descriptions that you paste or submit for analysis</li>
            <li>Answers to onboarding questions and profile assessments</li>
            <li>Usage data, such as which features you use and basic analytics about how you interact with Sage</li>
          </ul>
          <p className="mt-3">
            We don&apos;t intentionally collect sensitive personal data beyond what you choose to provide in these inputs.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">How We Use Your Information</h2>
          <p className="mb-3">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Generate personalized career insights, role recommendations, and feedback tailored to your profile</li>
            <li>Improve the quality of Sage&apos;s suggestions and overall product experience</li>
            <li>Maintain security and prevent abuse of the service</li>
          </ul>
          <p className="mt-3 font-semibold">
            We do not sell your data to third parties.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Storage & AI Providers</h2>
          <p className="mb-3">
            Your data is stored securely in our application databases. To generate career-related analysis 
            and insights, we may send your information to third-party AI providers (such as OpenAI or Azure AI). 
            These providers are used solely to power Sage&apos;s features and operate under their own terms of service.
          </p>
          <p>
            We make every effort to minimize the data sent to these providers and do not use them for additional 
            tracking or advertising purposes.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Analytics</h2>
          <p>
            We may use privacy-respecting analytics tools (such as Vercel Analytics) to understand which features 
            are being used and how people interact with Sage. This data is aggregated and anonymous—we don&apos;t use 
            it to build individual profiles or track you across other websites.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">How to Request Deletion</h2>
          <p>
            If you&apos;d like your account and all associated data deleted, please email us at{' '}
            <a 
              href="mailto:support@sagesays.ai" 
              className="text-emerald-700 hover:text-emerald-800 underline"
            >
              support@sagesays.ai
            </a>
            {' '}from the same email address you used to sign in. We&apos;ll process your request as soon as possible.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Children&apos;s Privacy</h2>
          <p>
            Sage is built for adults and working professionals and is not intended for use by children under 16. 
            If you believe that a child&apos;s data has been collected through Sage, please contact us at{' '}
            <a 
              href="mailto:support@sagesays.ai" 
              className="text-emerald-700 hover:text-emerald-800 underline"
            >
              support@sagesays.ai
            </a>
            {' '}so we can delete it.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time as Sage evolves. When we make changes, 
            we&apos;ll update the &quot;Last updated&quot; date below. We encourage you to review this page periodically.
          </p>
        </section>

        <div className="border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-500">
            Last updated: November 2025
          </p>
        </div>
      </div>
    </main>
  );
}
