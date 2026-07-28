import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy — Camparc',
  description: 'Privacy Policy for Camparc.',
};

const LAST_UPDATED = 'July 28, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p>
              This Privacy Policy explains what information Camparc (&quot;we&quot;, &quot;us&quot;)
              collects, how it&apos;s used, and the choices you have. Camparc is operated by Marcos, a
              sole proprietor based in Kenya. By using Camparc, you agree to the collection and use of
              information as described here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="font-semibold text-gray-800 mb-1">Account &amp; workspace information</p>
            <p>Your name, work email address, a hashed (never plaintext) password, and workspace/company name provided at signup.</p>
            <p className="font-semibold text-gray-800 mb-1 mt-4">Meta account data</p>
            <p>
              When you connect a Meta advertising account, we store an encrypted access token issued
              by Meta on your behalf, along with the campaign, ad set, and performance data you choose
              to sync. We never see or store your Meta password — authorization happens entirely
              through Meta&apos;s own OAuth login flow.
            </p>
            <p className="font-semibold text-gray-800 mb-1 mt-4">Usage &amp; log data</p>
            <p>
              Basic technical data such as IP address, browser type, and actions taken within the app
              (e.g. campaign deployments), kept for security auditing and troubleshooting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To operate the Service — authenticate you, generate campaign names, and deploy/sync campaigns to Meta on your behalf;</li>
              <li>To communicate with you about your account, such as password resets or important service updates;</li>
              <li>To maintain security, including detecting and preventing abuse of the Service;</li>
              <li>To improve the product based on how it&apos;s actually used.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information, and we do not use your data to serve third-party advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Storage &amp; Security</h2>
            <p>
              Data is stored on servers we operate and secure, with access restricted to what the
              Service needs to function. Meta access tokens are encrypted at rest, not stored in
              plain text. All traffic to and from the Service is encrypted in transit via HTTPS. No
              system is perfectly secure, but we take reasonable, industry-standard steps to protect
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Sharing</h2>
            <p>
              We share data with Meta only as necessary to deploy and sync the campaigns you
              explicitly request — this is core to how the Service works, and is governed by
              Meta&apos;s own Data Use Policy for anything processed on their platform. We do not
              share your personal information with other third parties except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain your account and workspace data for as long as your account is active. If you
              delete your account, we&apos;ll remove your personal data and disconnect any linked Meta
              access within a reasonable period, except where we&apos;re required to retain certain
              records for legal or security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              Depending on where you&apos;re located, you may have rights to access, correct, export,
              or delete your personal data. You can request any of these by emailing{' '}
              <a href="mailto:marcosgav80@gmail.com" className="text-primary font-semibold hover:underline">
                marcosgav80@gmail.com
              </a>. We aim to handle personal data in a manner consistent with applicable data
              protection laws, including Kenya&apos;s Data Protection Act, 2019.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use a small number of essential cookies required for the Service to function: one to
              keep you signed in, and one used purely for security (CSRF protection) to verify
              requests genuinely come from your browser. We don&apos;t use advertising or tracking
              cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Camparc is a business tool and is not directed at, or intended for use by, anyone under
              18. We don&apos;t knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We&apos;ll post the updated version
              here with a new &quot;Last updated&quot; date, and notify you directly if changes are
              material.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy or how your data is handled can be sent to{' '}
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
              user base — especially around specific data protection obligations in the countries
              your users are located in.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
