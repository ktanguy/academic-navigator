import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container max-w-3xl py-16 md:py-24">

          {/* Page title */}
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy & Terms of Use</h1>
            <p className="mt-4 text-muted-foreground">Last updated: March 2026</p>
          </div>

          <div className="space-y-12 text-sm text-muted-foreground leading-relaxed">

            {/* Introduction */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                Academic Navigator ("the Platform") is a student support system built for higher education
                institutions. It helps students raise support tickets, book appointments with facilitators,
                and receive timely assistance — powered by AI-assisted routing.
              </p>
              <p className="mt-3">
                By creating an account or using any feature of this Platform, you agree to the terms described
                in this document. Please read it carefully.
              </p>
            </section>

            {/* Data We Collect */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Data We Collect</h2>
              <p>We collect only what is necessary to provide the service:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li><span className="text-foreground font-medium">Account information</span> — your name, email address, and role (student / facilitator / admin)</li>
                <li><span className="text-foreground font-medium">Ticket content</span> — the subject and description of support requests you submit</li>
                <li><span className="text-foreground font-medium">Appointment details</span> — meeting dates, times, and the reason for the meeting</li>
                <li><span className="text-foreground font-medium">Usage data</span> — which pages you visit and actions you take within the Platform</li>
              </ul>
              <p className="mt-3">We do not collect payment information, location data, or any data beyond what is needed for the Platform to function.</p>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>To route your support ticket to the correct department using AI classification</li>
                <li>To notify facilitators and admins when action is required on a ticket</li>
                <li>To confirm, remind, or update you about booked appointments</li>
                <li>To display your profile and history within the Platform</li>
                <li>To generate anonymised statistics for system administrators</li>
              </ul>
              <p className="mt-3">
                Your ticket text is sent to a third-party AI model (hosted on Hugging Face Spaces) for
                classification purposes only. No personal identifying information is included in that request —
                only the ticket subject and description.
              </p>
            </section>

            {/* AI Classification */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. AI-Assisted Processing</h2>
              <p>
                When you submit a support ticket, the Platform uses an AI model to suggest a category and
                route the ticket to the appropriate team. This is an automated process.
              </p>
              <p className="mt-3">
                If the AI's confidence is below 70%, your ticket is flagged for human review before being
                assigned — ensuring that low-confidence decisions are always checked by a person.
              </p>
              <p className="mt-3">
                The AI does not make decisions about your academic standing, grades, or any outcomes.
                It only suggests a routing category for administrative purposes.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Sharing</h2>
              <p>We do not sell or share your personal data with third parties for commercial purposes.</p>
              <p className="mt-3">Your data may be accessed by:</p>
              <ul className="mt-2 space-y-2 list-disc list-inside">
                <li>Facilitators assigned to your support ticket or appointment</li>
                <li>Administrators of your institution for oversight and audit purposes</li>
                <li>The hosting provider (Render.com) as part of infrastructure operations</li>
              </ul>
            </section>

            {/* Data Storage & Security */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Storage & Security</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Passwords are never stored in plain text — they are hashed using bcrypt before saving</li>
                <li>All sessions use JWT tokens that expire after 7 days</li>
                <li>All data is stored on secure servers provided by Render.com</li>
                <li>HTTPS is enforced on all connections to the Platform</li>
              </ul>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Object to automated processing of your data</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact your institution's system administrator or the Platform owner.
              </p>
            </section>

            {/* Terms of Use */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Terms of Use (EULA)</h2>
              <p>By using Academic Navigator, you agree to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>Use the Platform only for legitimate academic support purposes</li>
                <li>Provide accurate information when submitting tickets or booking appointments</li>
                <li>Not attempt to access accounts or data belonging to other users</li>
                <li>Not submit content that is abusive, fraudulent, or harmful</li>
                <li>Not attempt to reverse-engineer, scrape, or disrupt the Platform</li>
              </ul>
              <p className="mt-3">
                Accounts found in violation of these terms may be suspended or removed by an administrator.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Cookies & Local Storage</h2>
              <p>
                The Platform stores your login token and user profile in your browser's local storage.
                This is required for the app to function — without it, you would be logged out on every
                page refresh. No third-party tracking cookies are used.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this policy as the Platform evolves. Significant changes will be communicated
                through the Platform's notification system. Continued use of the Platform after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
              <p>
                For questions about this policy or your data, please contact the Platform administrator
                through the Help Desk or submit a support ticket via the{" "}
                <Link to="/helpdesk" className="text-primary underline hover:text-primary/80">
                  Help Desk
                </Link>.
              </p>
            </section>

          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
