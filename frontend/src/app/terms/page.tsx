import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Terms of Service — Camparc',
  description: 'Terms of Service for Camparc.',
};

const LAST_UPDATED = 'July 28, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Camparc
              (the &quot;Service&quot;), a campaign naming, deployment, and reporting tool for Meta
              advertising accounts. The Service is operated by Marcos, a sole proprietor based in
              Kenya (&quot;we&quot;, &quot;us&quot;, &quot;the Operator&quot;). By creating an account
              or otherwise using the Service, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Description of the Service</h2>
            <p>
              Camparc lets teams define naming conventions (taxonomies) for advertising campaigns
              and generate compliant campaign names across ad platforms. Meta is currently the
              first fully integrated platform, supporting direct campaign and ad set deployment via
              Meta&apos;s official Marketing API and automatic performance syncing. Support for
              additional advertising platforms is planned as the product develops. The Service is
              currently offered free of charge during this pre-launch phase. If paid plans are
              introduced in the future, we will update these Terms with billing, subscription, and
              refund details and notify existing users before any charges apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Accounts &amp; Workspaces</h2>
            <p>
              You must provide accurate information when creating an account and are responsible for
              maintaining the confidentiality of your login credentials. Each account belongs to a
              workspace, which may be shared with other members of your organization. You are
              responsible for the activity that occurs under your account and workspace, including
              actions taken by team members you invite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Connecting Your Meta Account</h2>
            <p>
              To deploy or sync campaigns, you must authorize Camparc to access your Meta advertising
              account via Meta&apos;s OAuth login flow. You are solely responsible for the Meta ad
              account(s) you connect and for complying with Meta&apos;s own Platform Terms, Advertising
              Policies, and Community Standards. Camparc creates new campaigns and ad sets in a
              paused state by default — you remain responsible for reviewing and activating any
              campaign before it spends budget. We are not responsible for ad spend, policy
              violations, or account actions taken by Meta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable law or the terms of any third-party platform, including Meta&apos;s;</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or our infrastructure;</li>
              <li>Interfere with or disrupt the integrity or performance of the Service;</li>
              <li>Upload or transmit malicious code, or use the Service to advertise illegal content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Data</h2>
            <p>
              You retain ownership of the campaign, taxonomy, and workspace data you create in
              Camparc. You grant us a limited license to process this data solely for the purpose of
              operating and improving the Service. See our{' '}
              <a href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</a>{' '}
              for details on what data we collect and how it&apos;s handled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Service Availability</h2>
            <p>
              We aim to keep the Service available and reliable, but we do not guarantee uninterrupted
              or error-free operation. The Service may be modified, suspended, or discontinued at any
              time, including for maintenance, security, or business reasons. We&apos;ll make a
              reasonable effort to notify you of significant changes affecting your use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Termination</h2>
            <p>
              You may stop using the Service and close your account at any time. We may suspend or
              terminate access to the Service if we reasonably believe these Terms have been violated,
              or if required to do so by law or by Meta&apos;s platform policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Disclaimers &amp; Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, express or
              implied. To the fullest extent permitted by law, we are not liable for indirect,
              incidental, or consequential damages arising from your use of the Service, including
              losses related to advertising spend, campaign performance, or account suspension by
              Meta or other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Kenya, without regard to conflict-of-law
              principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. If we make material changes, we&apos;ll
              provide reasonable notice, such as posting an update here or notifying you directly.
              Continued use of the Service after changes take effect constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Questions about these Terms can be sent to{' '}
              <a href="mailto:marcosgav80@gmail.com" className="text-primary font-semibold hover:underline">
                marcosgav80@gmail.com
              </a>.
            </p>
          </section>

          <section className="border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              This is a general-purpose draft and hasn&apos;t been reviewed by a lawyer. It&apos;s a
              reasonable starting point for a pre-launch product, but consider having it reviewed by
              a legal professional before relying on it once you have paying customers or a larger
              user base.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
