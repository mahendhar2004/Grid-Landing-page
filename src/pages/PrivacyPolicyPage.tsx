import { Link } from 'react-router-dom'

const lastUpdated = 'September 16, 2026'

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-8 pb-16 lg:pt-10 lg:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">Privacy Policy</h1>
          <p className="text-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose-custom space-y-10">
          <section>
            <p className="text-text-muted leading-relaxed">
              At Grid, operated by Galvam ("we," "our," or "us"), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              Grid is a marketplace for verified members of an organisation — a college or a workplace. Your organisation is referred to throughout this policy as your <strong>Hub</strong>.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              By using Grid, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="Account Information">
              <p>You sign up with an email address issued by your college or your employer. We send a one-time code to that address to confirm you control it, and we check the domain's public mail records to confirm the organisation is real. We collect the email address itself, the organisation it belongs to, and the display name you choose. Personal email domains are not accepted. There is no password, and we do not ask for your phone number.</p>
              <p className="mt-3">You may optionally add a profile photo and, where relevant to your Hub, a building or hostel name.</p>
            </Subsection>
            <Subsection title="Hub &amp; Organisation Data">
              <p>Your email domain determines which Hub you belong to and whether it is an Academic Hub (a campus) or a Corporate Hub (a workplace). We store this association because it governs what you can see and who can see you. It also means Grid knows which organisation you are affiliated with.</p>
            </Subsection>
            <Subsection title="Listing Data">
              <p>When you create a listing, we collect the title, description, price, category, condition, images, availability, and the visibility level you choose for it. If you list anonymously, your identity is hidden from other users but retained in our systems and remains visible to Grid's moderation team for safety purposes.</p>
            </Subsection>
            <Subsection title="Requests &amp; Offers">
              <p>When you post a request or make a priced offer on someone else's request, we collect the request details, your budget, and the offers exchanged, including counter-offers and their outcome.</p>
            </Subsection>
            <Subsection title="Messaging Data">
              <p>Messages sent through our in-app chat are stored to enable real-time communication. This includes message text, image attachments, timestamps, read receipts, typing indicators, and any structured deal or pickup information exchanged in the conversation.</p>
            </Subsection>
            <Subsection title="Location Data">
              <p>Grid uses approximate location to place Hubs on the map and to determine which Hubs fall within the distance bands (10 km, 25 km, 50 km) when you choose to browse beyond your own organisation. This is used to show you what is nearby. Your precise position is never displayed to other users, and location is not used to target advertising. Map and radius features can be left unused if you prefer to stay within your own Hub.</p>
            </Subsection>
            <Subsection title="Ratings &amp; Reputation">
              <p>Completed deals contribute to a rating and reputation that is visible to other members of your Hub. This is part of how trust works on Grid and cannot be hidden while your account is active.</p>
            </Subsection>
            <Subsection title="Payment Information">
              <p>Purchases are processed by Apple In-App Purchase on iOS and Google Play Billing on Android. We store transaction records (amount, type, timestamp) for your wallet and credits. <strong>We never receive or store your card, bank, or UPI details</strong> — those are handled entirely by Apple or Google under their own privacy policies.</p>
            </Subsection>
            <Subsection title="Usage Data">
              <p>We collect data about how you interact with the app, including listing views, searches, saved items, notification interactions, and feature usage. This helps us improve the service.</p>
            </Subsection>
            <Subsection title="Device Information">
              <p>We collect device identifiers for push notification delivery via Expo Notifications. We may also collect device type, operating system, and app version for debugging and optimisation. For referral fraud prevention, we may collect device identifiers and IP addresses to detect self-referral, duplicate accounts, or coordinated abuse.</p>
            </Subsection>
            <Subsection title="Reports &amp; Blocks">
              <p>When you report a user or listing, we store the report including the reason you selected, the target, and a timestamp, used solely for moderation. When you block someone, we store that relationship to prevent them contacting you. Neither your reports nor your block list are visible to other users.</p>
            </Subsection>
            <Subsection title="Bug Reports">
              <p>When you voluntarily submit a bug report, we collect your description, the category and severity you select, any screenshots you attach, and automatically-captured device information including device model, operating system version, and app version. Submitting a bug report is entirely optional.</p>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-2 text-text-muted">
              <li>Provide, maintain, and improve our marketplace services</li>
              <li>Verify that you belong to the organisation you claim, and place you in the correct Hub</li>
              <li>Enable real-time messaging, offers, and deal flow between buyers and sellers</li>
              <li>Record wallet top-ups, credits, and purchases made through Apple or Google</li>
              <li>Send push notifications and in-app alerts</li>
              <li>Determine which listings you can see, based on your Hub and the browsing scope you choose</li>
              <li>Screen content automatically for safety before it is published (see section 3)</li>
              <li>Prevent fraud, spam, and abuse, including referral fraud detection</li>
              <li>Moderate content and enforce our Community Guidelines, including reviewing messages when a conversation is reported</li>
              <li>Display sponsored listings (see section 5)</li>
              <li>Generate anonymised analytics to improve the platform</li>
            </ul>
          </Section>

          <Section title="3. Automated Content Screening">
            <p className="font-semibold text-primary mb-2">Every image and every description you submit is checked automatically before it is published.</p>
            <p>Grid uses automated image analysis and text analysis services to screen listings, profile photos, and other user-submitted content for material that breaches our Community Guidelines — before that content reaches anyone else's feed. This screening is applied to all submissions, not only reported ones.</p>
            <p className="mt-3">Where content fails screening it may be blocked from publication. Repeated or serious breaches escalate through a graduated enforcement ladder: an account may first be <strong>restricted</strong>, then <strong>suspended for seven days</strong>, and ultimately <strong>permanently removed</strong>.</p>
            <p className="mt-3"><strong>Human review and appeals.</strong> Automated screening decisions that restrict or suspend an account can be reviewed by a person on request. If you believe a decision about your account or content was wrong, contact us at the address in section 11 and a member of our team will review it. We do not use automated screening to make decisions about you for any purpose other than safety and policy enforcement.</p>
          </Section>

          <Section title="3a. Message Review for Moderation">
            <p>When a report is submitted that involves a conversation, Grid's moderation team may review recent messages from that conversation — including text and image attachments — solely to evaluate the report and enforce our Community Guidelines. This review is conducted by authorised administrators and is subject to strict internal access controls. We do not routinely monitor or read private messages outside of the report review process.</p>
          </Section>

          <Section title="4. Hub Scoping &amp; Visibility">
            <p>What you can see, and who can see you, is governed by your Hub and by choices you make.</p>
            <p className="mt-3"><strong>When you post</strong>, you choose one of four visibility levels for each listing: your building or hostel only, your whole organisation, your Hub together with Hubs it is paired with, or everyone within range. You control this per listing.</p>
            <p className="mt-3"><strong>When you browse</strong>, you choose how widely to look — your own organisation only, nearby organisations of the same type within 10, 25 or 50 km, or globally. Widening your own search does not widen the visibility of anything you have posted.</p>
            <p className="mt-3">This means listings can be seen outside your own organisation when you choose a visibility level that allows it. Your default is your own Hub.</p>
          </Section>

          <Section title="5. Advertising">
            <p>Grid displays sponsored listings within the feed. Sellers can also pay to boost their own listings for greater visibility.</p>
            <p className="mt-3"><strong>We do not target advertising by gender.</strong> This is a deliberate decision about what we are willing to do with what we know about you, and we intend to keep it. We also do not use your precise location, your private messages, or your reported content to target advertising, and we do not share your personal information with advertisers.</p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell, trade, or rent your personal information to third parties. We share data only with service providers essential to operating Grid:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>Apple</strong> and <strong>Google</strong> — Payment processing for in-app purchases, under their own terms and privacy policies</li>
              <li><strong>Cloud infrastructure providers</strong> — Database hosting, file storage, and content delivery</li>
              <li><strong>Automated content screening services</strong> — Image and text analysis for safety, as described in section 3</li>
              <li><strong>Expo</strong> — Push notification delivery</li>
              <li><strong>Email delivery providers</strong> — Sending one-time sign-in codes and service notifications</li>
            </ul>
            <p className="mt-4">We may also disclose information if required by law, court order, or government regulation, or if necessary to protect the safety of our users.</p>
          </Section>

          <Section title="7. Data Storage &amp; Security">
            <p>Your data is stored in managed cloud infrastructure using encrypted connections and access controls. We employ the following measures:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>Encrypted Connections</strong> — All data in transit is encrypted using TLS/HTTPS</li>
              <li><strong>Scoped Access</strong> — Access controls ensure you can only reach data belonging to you</li>
              <li><strong>Passwordless Authentication</strong> — Sign-in uses one-time codes sent to your verified organisation email; there is no password to be guessed, reused, or leaked</li>
              <li><strong>Managed Secrets</strong> — Credentials are held in a managed secrets service, not in application code</li>
              <li><strong>Atomic Transactions</strong> — Critical operations such as payments and credits use database-level atomic operations to prevent corruption</li>
            </ul>
          </Section>

          <Section title="8. Your Rights &amp; Controls">
            <p>Under the Digital Personal Data Protection Act, 2023 you are a <strong>data principal</strong>, with the rights to obtain a summary of the personal data we hold and how we process it, to have inaccurate or incomplete data <strong>corrected or completed</strong>, to have data <strong>erased</strong> once it is no longer needed for the purpose it was collected, to <strong>withdraw consent</strong> as easily as you gave it, to <strong>nominate</strong> another person to exercise these rights on your behalf if you die or become incapacitated, and to complain to our Grievance Officer and — if that does not resolve it — to the Data Protection Board of India.</p>
            <p className="mt-4">The controls below are how you exercise those rights:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted mt-4">
              <li><strong>Export Your Data</strong> — Download a copy of the personal data Grid holds about you, from within the app. This right is provided in line with India's Digital Personal Data Protection framework.</li>
              <li><strong>View &amp; Edit Profile</strong> — Access and update your display name, photo and profile details at any time</li>
              <li><strong>Online Status</strong> — Toggle whether others can see when you are online</li>
              <li><strong>Read Receipts</strong> — Control whether others know when you have read messages</li>
              <li><strong>Anonymous Mode</strong> — Hide your identity on an individual listing, or within a single conversation. Either side of a conversation can enable it. Your identity remains visible to Grid's moderation team regardless of this setting.</li>
              <li><strong>Visibility Controls</strong> — Choose how far each listing travels, as described in section 4</li>
              <li><strong>Delete Conversations</strong> — Remove chat history from your view</li>
              <li><strong>Block Users</strong> — Prevent specific people from contacting you</li>
              <li><strong>Notification Preferences</strong> — Choose which push and email notifications you receive</li>
              <li><strong>Withdraw Consent</strong> — You may withdraw consent for optional processing at any time through the settings above, or by contacting us. Withdrawing consent for processing essential to operating your account means closing the account.</li>
              <li>
                <strong>Delete Account</strong> — You can permanently delete your account and associated personal data from within the app.
                Deletion is irreversible. <strong>If you hold unspent wallet credit, request its return before deleting</strong> (see section 9), and if you have an active subscription, cancel it separately through Apple or Google — deleting your Grid account does not stop store billing.
                Alternatively, email <a href="mailto:contact.galvam@gmail.com?subject=Account%20Deletion%20Request" className="text-primary hover:underline">contact.galvam@gmail.com</a> with the subject "Account Deletion Request".
              </li>
              <li>
                <strong>Nominate Someone</strong> — DPDP section 14 lets you name another individual to exercise these rights if you die or become incapacitated. There is no in-app screen for this yet: write to our Grievance Officer (section 14) with the nominee's name and contact details and we will record it against your account.
              </li>
            </ul>
          </Section>

          <Section title="9. Wallet Credit on Deletion">
            <p>Credit you have already spent on a listing is not refundable, because the listing has already run. <strong>Credit you have not yet spent can be returned on request.</strong> Contact us before deleting your account if you hold unspent credit, as deletion is irreversible and removes the wallet record.</p>
          </Section>

          <Section title="10. Cookies &amp; Local Storage">
            <p>Grid uses local device storage to maintain your session and cache preferences. We do not use third-party tracking cookies, and we do not use cross-site advertising trackers. Sponsored listings are served within the app and are not personalised using tracking cookies.</p>
          </Section>

          <Section title="11. Data Retention">
            <p>We retain your account data for as long as your account is active. Deleted conversations are removed from your view but may be retained temporarily in our systems. Delisted listings remain in our database for record-keeping but are not displayed to other users.</p>
            <p className="mt-3">When you delete your account, your personal data is removed, active and pending listings are anonymised, sold or expired listings are de-identified, pending referrals are expired, and your wallet and transaction history are deleted. An audit log entry is retained for fraud prevention and legal compliance.</p>
            <p className="mt-3">Transaction records may be retained for up to seven years where required for tax and financial compliance.</p>
            <p className="mt-3">We store the timestamp of your Terms acceptance for legal compliance. This record is deleted along with your account.</p>
          </Section>

          <Section title="12. Children's Privacy">
            <p>Grid is intended for verified students and employees aged 18 and above. We do not knowingly collect personal information from anyone under the age of 18. If we become aware that we have collected data from a minor, we will take steps to delete that information promptly.</p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we make changes, we will update the "Last Updated" date at the top of this page and notify users through the app. Your continued use of Grid after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="14. Grievance Officer, Nodal Contact Person &amp; Contact">
            <p>If you have questions or concerns about this Privacy Policy, our data practices, or a decision made about your account, or if you wish to exercise any right described in section 8, please write to our Grievance Officer.</p>
            <p className="mt-4">Grid publishes two named points of contact, as Indian law requires. They are the same person because Grid is operated by an individual, not a company &mdash; what the law requires is that both appointments are made and published, not that two different people hold them.</p>

            <Subsection title="Grievance Officer">
              <p className="text-sm text-text-muted mb-2">Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules and the Digital Personal Data Protection Act, 2023.</p>
              <ul className="list-none space-y-2 text-text-muted mt-2">
                <li><strong>Name:</strong> Mahendhar Seelam</li>
                <li><strong>Designation:</strong> Grievance Officer, Grid (operated by Galvam)</li>
                <li><strong>Email:</strong> <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a></li>
              </ul>
              <p className="mt-3">Write here about your account, your personal data, a listing, a transaction, or any complaint about Grid. <strong>We acknowledge every complaint within 24 hours and resolve it within 7 days</strong>, as required by the IT Rules as amended in February 2026 and by the DPDP Act.</p>
            </Subsection>

            <Subsection title="Nodal Contact Person">
              <p className="text-sm text-text-muted mb-2">Under the Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5).</p>
              <ul className="list-none space-y-2 text-text-muted mt-2">
                <li><strong>Name:</strong> Mahendhar Seelam, resident in India</li>
                <li><strong>Email:</strong> <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a></li>
              </ul>
              <p className="mt-3">This is the point of contact for law enforcement agencies and regulators seeking compliance coordination. If you are a user with a complaint, the Grievance Officer above is the right address &mdash; it runs on the published timelines.</p>
            </Subsection>

            <p className="mt-6">If your complaint is not resolved to your satisfaction, you may escalate it to the Data Protection Board of India.</p>
          </Section>

          <Section title="15. Governing Law">
            <p>This Privacy Policy is governed by the laws of India, including the Digital Personal Data Protection Act, 2023. Any dispute arising from this Policy is subject to the exclusive jurisdiction of the courts described in our <a href="/terms" className="text-primary hover:underline">Terms &amp; Conditions</a>.</p>
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
