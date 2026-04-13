import { Link } from 'react-router-dom'

const lastUpdated = 'April 13, 2026'

export default function TermsPage() {
  return (
    <div className="pt-8 pb-16 lg:pt-10 lg:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">Terms & Conditions</h1>
          <p className="text-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-10">
          <p className="text-text-muted leading-relaxed">
            Welcome to Grid ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of the Grid mobile application and services. By creating an account or using Grid, you agree to be bound by these Terms. If you do not agree, please do not use the service.
          </p>

          <Section title="1. Eligibility">
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years of age to use Grid.</li>
              <li>You must be currently enrolled at a supported Indian college or university, or a recent graduate.</li>
              <li>You must provide accurate and truthful information about your identity and college affiliation.</li>
              <li>Grid reserves the right to verify your eligibility and deny access if requirements are not met.</li>
            </ul>
          </Section>

          <Section title="2. Account Responsibilities">
            <ul className="list-disc pl-6 space-y-2">
              <li>You may create only one account per person.</li>
              <li>Authentication is handled through Google OAuth. You are responsible for the security of your Google account.</li>
              <li>You must provide accurate information during registration, including your college, graduation year, and contact details.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
              <li>By completing account setup on the Grid app, you confirm that you have read, understood, and accepted these Terms. We record the date and time of your acceptance.</li>
            </ul>
          </Section>

          <Section title="3. Marketplace Rules">
            <ul className="list-disc pl-6 space-y-2">
              <li>All listings must be accurate and truthful. Descriptions should honestly represent the item's condition, features, and any defects.</li>
              <li>You may upload up to 5 images per listing. Images should clearly show the actual item being sold.</li>
              <li>Select the most appropriate category from our 112+ categories. Miscategorization may result in listing removal.</li>
              <li>Set fair and reasonable prices. Price manipulation or misleading pricing is prohibited.</li>
              <li>Affordable listing fees apply when posting items for sale. These fees help maintain marketplace quality and prevent spam.</li>
              <li>Listings are visible only to students at your college. Do not attempt to circumvent college-scoping.</li>
              <li>Items must be available for local, on-campus exchange. Grid does not support shipping.</li>
            </ul>
          </Section>

          <Section title="4. Prohibited Items & Content">
            <p className="mb-4 font-bold text-red-500 uppercase tracking-wide">Zero Tolerance Policy</p>
            <p className="mb-4 italic">Grid maintains a strict zero-tolerance policy for illegal, unethical, or harmful items. We are a student-focused marketplace and will immediately remove anything that compromises the safety or integrity of our community.</p>
            <p className="mb-4">The following items are ABSOLUTELY PROHIBITED:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Human Beings & Body Parts:</strong> Selling human beings, human remains, organs, body parts, or fluids is strictly forbidden and will be reported to law enforcement.</li>
              <li><strong>Live Animals:</strong> Selling live animals or wildlife products.</li>
              <li><strong>Illegal Substances:</strong> Drugs, narcotics, stimulants, and prescription medications.</li>
              <li><strong>Weapons:</strong> Firearms, ammunition, explosives, knives, or any item designed to cause harm.</li>
              <li><strong>Tobacco & Alcohol:</strong> Cigarettes, vapes, nicotine products, and alcoholic beverages.</li>
              <li><strong>Hazardous Materials:</strong> Corrosive chemicals, radioactive materials, or toxic waste.</li>
              <li><strong>Academic Fraud:</strong> Solved exam papers, proxy services, or plagiarized materials.</li>
              <li><strong>Illegal Documents:</strong> Government IDs, passports, bank details, or official certificates.</li>
              <li><strong>Adult Content:</strong> Sexually explicit, obscene, or pornographic material and services.</li>
              <li><strong>Counterfeit Goods:</strong> Fake brands, stolen items, or pirated software.</li>
              <li>Any item that violates the laws of India.</li>
            </ul>
            <p className="mt-4 font-semibold">Violations will result in an immediate permanent ban without warning and forfeiture of all account funds.</p>
          </Section>

          <Section title="5. Payments & Fees">
            <ul className="list-disc pl-6 space-y-2">
              <li>Listing fees are charged per product posted and are non-refundable once the listing is published.</li>
              <li><strong>Violation Non-Refund Policy:</strong> If a product is removed by our moderation team due to any violation of these Terms, the money or listing credits used to post that product will NOT be refunded under any circumstances.</li>
              <li>Payment processing is handled by Razorpay, a PCI DSS compliant payment gateway. By making a payment, you also agree to Razorpay's terms of service.</li>
              <li>The Grid Wallet allows you to add funds and use them for listing fees. Wallet funds are strictly non-refundable once added.</li>
              <li>If an account is banned for violating our community guidelines, any remaining wallet balance and unused credits are permanently forfeited and will not be refunded.</li>
              <li>Free listing credits earned through the referral program have no cash value and cannot be withdrawn.</li>
              <li>Grid does not facilitate transactions between buyers and sellers. All purchase transactions occur directly between users.</li>
            </ul>
          </Section>

          <Section title="6. Messaging Conduct">
            <p className="mb-4">When using Grid's in-app messaging feature, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Communicate respectfully with all users</li>
              <li>Not send spam, unsolicited advertisements, or bulk messages</li>
              <li>Not share personal information of others without their consent</li>
              <li>Not engage in harassment, threats, hate speech, or discriminatory language</li>
              <li>Not use messaging for any purpose unrelated to marketplace transactions</li>
              <li>Not attempt to move transactions outside of Grid to avoid safety features</li>
            </ul>
          </Section>

          <Section title="7. Content Moderation & Enforcement">
            <p className="mb-4 text-primary font-bold">GRID OPERATES A HIGHLY STRICT MODERATION SYSTEM.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid maintains a dedicated 24/7 admin moderation team that reviews user reports and aggressively monitors platform activity.</li>
              <li>When a report involves a conversation, our moderation team may review recent messages from that conversation — including text and image attachments — to evaluate the report. Only messages relevant to the reported incident are accessed.</li>
              <li>We reserve the right to remove any listing, message, or content that violates these Terms or our community guidelines at our sole discretion.</li>
              <li><strong>Strict Enforcement:</strong> Enforcement actions include verbal warnings, temporary bans (1 day to 30 days), and immediate permanent account suspension for severe violations.</li>
              <li>Users who receive multiple reports may face accelerated enforcement action.</li>
              <li>Admin decisions regarding content removal and account actions are final. There is no appeals process for prohibited item violations.</li>
              <li>Users will be notified of moderation actions taken against their account, including the reason for the action.</li>
            </ul>
          </Section>

          <Section title="8. Referral Program">
            <ul className="list-disc pl-6 space-y-2">
              <li>Each user receives a unique referral code upon registration.</li>
              <li>You earn one free listing credit for each successful referral (when a new user signs up using your code).</li>
              <li>Self-referral is prohibited and will result in credit forfeiture.</li>
              <li>Grid employs fraud detection measures including device fingerprinting and rate limiting.</li>
              <li>Credits are non-transferable, have no cash value, and cannot be exchanged or sold.</li>
              <li>Grid reserves the right to modify or terminate the referral program at any time.</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of content you create and share on Grid (listings, messages, images).</li>
              <li>By posting content, you grant Grid a non-exclusive, worldwide license to display, distribute, and promote your content within the platform.</li>
              <li>You must not post content that infringes on the intellectual property rights of others.</li>
              <li>The Grid brand, logo, and application design are the intellectual property of Grid and may not be used without permission.</li>
            </ul>
          </Section>

          <Section title="10. User Safety">
            <ul className="list-disc pl-6 space-y-2">
              <li>When meeting for transactions, choose safe, public locations on campus.</li>
              <li>Report any suspicious activity, fraudulent listings, or threatening behavior immediately.</li>
              <li>Use the block feature to prevent contact from unwanted users.</li>
              <li>Do not share sensitive personal information (bank details, passwords, home address) through the app.</li>
              <li>Grid is not responsible for the safety of in-person meetups between users.</li>
            </ul>
          </Section>

          <Section title="11. Limitation of Liability">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid is a platform that connects buyers and sellers. We are not a party to any transaction between users.</li>
              <li>We do not guarantee the quality, safety, legality, or accuracy of any listing.</li>
              <li>We are not responsible for any loss, damage, or injury arising from transactions between users.</li>
              <li>Grid is provided "as is" without warranties of any kind, express or implied.</li>
              <li>Our total liability to you shall not exceed the fees you have paid to Grid in the preceding 12 months.</li>
            </ul>
          </Section>

          <Section title="12. Account Termination">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid may suspend or terminate your account at any time for violation of these Terms, with or without notice.</li>
              <li>Temporary bans range from 1 day to 30 days depending on the severity of the violation.</li>
              <li>Permanent bans are issued for severe or repeated violations.</li>
              <li><strong>Self-service deletion:</strong> You can delete your account directly in the app by going to Profile → Edit Profile → scroll to the <em>Offboarding</em> section → tap <em>Delete Account</em> and follow the confirmation steps. Deletion is permanent and immediate.</li>
              <li>Alternatively, you may request account deletion by emailing <a href="mailto:contact.galvam@gmail.com?subject=Account%20Deletion%20Request" className="text-primary hover:underline">contact.galvam@gmail.com</a> with the subject "Account Deletion Request".</li>
              <li>Upon account deletion, your active listings are anonymised, your personal data is permanently removed, and your wallet balance is forfeited. Messages you sent in existing conversations are retained for the other party's transaction history but your identity is scrubbed.</li>
            </ul>
          </Section>

          <Section title="13. Dispute Resolution">
            <ul className="list-disc pl-6 space-y-2">
              <li>Users are encouraged to resolve disputes between themselves directly.</li>
              <li>Grid may facilitate dispute resolution at its discretion but is not obligated to do so.</li>
              <li>For unresolved disputes, you agree to first attempt informal resolution by contacting us at <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a>.</li>
            </ul>
          </Section>

          <Section title="14. Governing Law">
            <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </Section>

          <Section title="15. Changes to These Terms">
            <p>We may update these Terms from time to time. When we make changes, we will update the "Last Updated" date and notify users through the app. Your continued use of Grid after changes constitutes acceptance of the updated Terms. If you do not agree to the new Terms, you should stop using the service.</p>
          </Section>

          <Section title="16. Contact Us">
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a></li>
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
      <div className="text-text-muted leading-relaxed">{children}</div>
    </section>
  )
}
