import { Link } from 'react-router-dom'

const lastUpdated = 'February 19, 2026'

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">Privacy Policy</h1>
          <p className="text-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose-custom space-y-10">
          <section>
            <p className="text-text-muted leading-relaxed">
              At Grid ("we," "our," or "us"), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              By using Grid, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="Account Information">
              <p>When you sign up using Google OAuth, we collect your email address and display name from your Google account. You may also provide additional information including your phone number, profile picture, college, hostel, and graduation year.</p>
            </Subsection>
            <Subsection title="Listing Data">
              <p>When you create a product listing, we collect the title, description, price, category, condition, images (up to 5), and availability date you provide. If you choose to list anonymously, your identity is hidden from other users but retained in our systems.</p>
            </Subsection>
            <Subsection title="Messaging Data">
              <p>Messages sent through our in-app chat feature are stored to enable real-time communication. This includes message text, timestamps, read receipts, and typing indicators.</p>
            </Subsection>
            <Subsection title="Payment Information">
              <p>Payment transactions are processed through Razorpay. We store transaction records (amount, type, timestamp) for your wallet and listing fees, but we do not store credit card, debit card, or bank account details — these are handled entirely by Razorpay's secure infrastructure.</p>
            </Subsection>
            <Subsection title="Usage Data">
              <p>We collect data about how you interact with the app, including product views, searches, saved items, notification interactions, and feature usage. This helps us improve the service.</p>
            </Subsection>
            <Subsection title="Device Information">
              <p>We collect device identifiers for push notification delivery via Expo Notifications. We may also collect device type, operating system, and app version for debugging and optimization.</p>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-2 text-text-muted">
              <li>Provide, maintain, and improve our marketplace services</li>
              <li>Enable real-time messaging between buyers and sellers</li>
              <li>Process listing fees and wallet transactions via Razorpay</li>
              <li>Send push notifications and in-app alerts</li>
              <li>Verify user identity through Google OAuth and college affiliation</li>
              <li>Prevent fraud, spam, and abuse through our referral fraud detection</li>
              <li>Moderate content and enforce community guidelines</li>
              <li>Deliver college-scoped product feeds (showing items only from your college)</li>
              <li>Generate anonymized analytics to improve the platform</li>
            </ul>
          </Section>

          <Section title="3. College-Scoped Data">
            <p>Grid is designed as a college-exclusive marketplace. Your college affiliation determines which products you can see. Product listings are only visible to students at the same college. This scoping is a core privacy and safety feature — your listings are not exposed to the general public or students at other institutions.</p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell, trade, or rent your personal information to third parties. We share data only with the following service providers who are essential to operating Grid:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>Supabase</strong> — Cloud database infrastructure (PostgreSQL hosting, authentication, real-time subscriptions, file storage)</li>
              <li><strong>Razorpay</strong> — Payment processing for listing fees and wallet top-ups</li>
              <li><strong>Google</strong> — Authentication via Google OAuth</li>
              <li><strong>Expo</strong> — Push notification delivery</li>
            </ul>
            <p className="mt-4">We may also disclose information if required by law, court order, or government regulation, or if necessary to protect the safety of our users.</p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>Your data is stored on Supabase's cloud infrastructure using PostgreSQL databases. We employ the following security measures:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>Row-Level Security (RLS)</strong> — Database policies ensure users can only access their own data</li>
              <li><strong>Encrypted Connections</strong> — All data in transit is encrypted using TLS/HTTPS</li>
              <li><strong>Secure Authentication</strong> — OAuth 2.0 tokens with automatic refresh and secure session management</li>
              <li><strong>Atomic Transactions</strong> — Critical operations (payments, referral credits) use database-level atomic functions to prevent data corruption</li>
            </ul>
          </Section>

          <Section title="6. Your Rights & Controls">
            <p>You have the following controls over your data:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>View & Edit Profile</strong> — Access and update your personal information at any time</li>
              <li><strong>Online Status</strong> — Toggle whether other users can see your online status</li>
              <li><strong>Read Receipts</strong> — Control whether others know when you've read messages</li>
              <li><strong>Anonymous Listings</strong> — Sell items without revealing your identity</li>
              <li><strong>Delete Conversations</strong> — Remove chat history from your view</li>
              <li><strong>Block Users</strong> — Prevent specific users from contacting you</li>
              <li><strong>Notification Preferences</strong> — Choose which notifications you receive</li>
            </ul>
            <p className="mt-4">To request data export or account deletion, contact us at <a href="mailto:support@grid.app" className="text-primary hover:underline">support@grid.app</a>.</p>
          </Section>

          <Section title="7. Cookies & Local Storage">
            <p>Grid uses local device storage (AsyncStorage) to maintain your session and cache user preferences. We do not use third-party tracking cookies. No advertising trackers or analytics cookies are used in the app.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>We retain your account data for as long as your account is active. Deleted conversations are removed from your view but may be retained temporarily in our systems. Product listings that are delisted remain in our database for record-keeping but are not displayed to other users. If you request account deletion, we will remove your personal data within 30 days, subject to legal retention requirements.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Grid is designed for college students aged 18 and above. We do not knowingly collect personal information from anyone under the age of 18. If we become aware that we have collected data from a minor, we will take steps to delete that information promptly.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make changes, we will update the "Last Updated" date at the top of this page and notify users through the app. Your continued use of Grid after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
            <ul className="list-none space-y-2 text-text-muted mt-4">
              <li><strong>Email:</strong> <a href="mailto:support@grid.app" className="text-primary hover:underline">support@grid.app</a></li>
              <li><strong>Entity:</strong> Grid</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-secondary mb-4">{title}</h2>
      <div className="text-text-muted leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-secondary mb-2">{title}</h3>
      <div className="text-text-muted leading-relaxed">{children}</div>
    </div>
  )
}
