import { Link } from 'react-router-dom'

const lastUpdated = 'September 13, 2026'

export default function TermsPage() {
  return (
    <div className="pt-8 pb-16 lg:pt-10 lg:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">Terms &amp; Conditions</h1>
          <p className="text-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-10">
          <p className="text-text-muted leading-relaxed">
            Welcome to Grid ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of the Grid mobile application and services. By creating an account or using Grid, you agree to be bound by these Terms. If you do not agree, please do not use the service.
          </p>
          <p className="text-text-muted leading-relaxed">
            Grid is a marketplace for verified members of an organisation — a college or a workplace. Your organisation is referred to throughout these Terms as your <strong>Hub</strong>.
          </p>

          <Section title="1. Eligibility">
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years of age to use Grid.</li>
              <li>You must be a current member of a supported organisation — either a student or staff member of a supported educational institution, or an employee of a supported company — and you must hold a working email address issued by that organisation.</li>
              <li>Personal email addresses (such as Gmail, Outlook or Yahoo) are not accepted for registration.</li>
              <li>You must provide accurate and truthful information about your identity and your organisational affiliation.</li>
              <li>Grid reserves the right to verify your eligibility, including by checking that your email domain belongs to a genuine organisation, and to deny access if requirements are not met.</li>
            </ul>
          </Section>

          <Section title="2. Account Responsibilities">
            <ul className="list-disc pl-6 space-y-2">
              <li>You may create only one account per person.</li>
              <li>Sign-in uses a one-time code sent to your organisation email address. There is no password. You are responsible for maintaining the security of that email account, since access to it grants access to your Grid account.</li>
              <li>You must not share one-time sign-in codes with anyone. Grid will never ask you for one.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately if you suspect unauthorised access to your account.</li>
              <li>By completing account setup, you confirm that you have read, understood, and accepted these Terms. We record the date and time of your acceptance.</li>
            </ul>
          </Section>

          <Section title="3. Your Hub and Leaving It">
            <ul className="list-disc pl-6 space-y-2">
              <li>Your email domain determines which Hub you belong to. Your Hub governs what you see by default and who can see you.</li>
              <li>If you leave the organisation whose email verified you — by graduating, resigning, or otherwise — you may lose access to that Hub once the email address is no longer valid or when we are notified that your affiliation has ended.</li>
              <li>You must not continue to represent yourself as a member of an organisation you have left.</li>
              <li>If you join a new organisation, you may register with your new organisation email. Content, reputation and wallet balances do not automatically transfer between Hubs.</li>
              <li>We recommend concluding any open deals and requesting the return of unspent credit before your organisation email stops working.</li>
            </ul>
          </Section>

          <Section title="4. Marketplace Rules">
            <ul className="list-disc pl-6 space-y-2">
              <li>All listings must be accurate and truthful. Descriptions should honestly represent the item's condition, features, and any defects.</li>
              <li>Images should clearly show the actual item being sold.</li>
              <li>Select the most appropriate category. Miscategorisation may result in listing removal.</li>
              <li>Set fair and reasonable prices. Price manipulation or misleading pricing is prohibited.</li>
              <li>Posting a listing is a paid action. Applicable charges are shown before you confirm, and are governed by section 6.</li>
              <li>Each listing carries a visibility setting that you choose, ranging from your building only through to everyone within range. You must not misrepresent your location or organisation in order to reach an audience you are not entitled to.</li>
              <li>Grid does not support shipping. Items must be available for exchange in person, in a place convenient to both parties.</li>
            </ul>
          </Section>

          <Section title="5. Prohibited Items &amp; Content">
            <p className="mb-4 font-bold text-red-500 uppercase tracking-wide">Zero Tolerance Policy</p>
            <p className="mb-4 italic">Grid maintains a strict zero-tolerance policy for illegal, unethical, or harmful items, and will immediately remove anything that compromises the safety or integrity of our community.</p>
            <p className="mb-4">The following items are ABSOLUTELY PROHIBITED:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Human Beings &amp; Body Parts:</strong> Selling human beings, human remains, organs, body parts, or fluids is strictly forbidden and will be reported to law enforcement.</li>
              <li><strong>Live Animals:</strong> Selling live animals or wildlife products.</li>
              <li><strong>Illegal Substances:</strong> Drugs, narcotics, stimulants, and prescription medications.</li>
              <li><strong>Weapons:</strong> Firearms, ammunition, explosives, knives, or any item designed to cause harm.</li>
              <li><strong>Tobacco &amp; Alcohol:</strong> Cigarettes, vapes, nicotine products, and alcoholic beverages.</li>
              <li><strong>Hazardous Materials:</strong> Corrosive chemicals, radioactive materials, or toxic waste.</li>
              <li><strong>Academic Fraud:</strong> Solved exam papers, proxy services, or plagiarised materials.</li>
              <li><strong>Confidential or Proprietary Property:</strong> Equipment, data, or materials belonging to your employer or institution that you are not authorised to sell.</li>
              <li><strong>Illegal Documents:</strong> Government IDs, passports, bank details, or official certificates.</li>
              <li><strong>Adult Content:</strong> Sexually explicit, obscene, or pornographic material and services.</li>
              <li><strong>Counterfeit Goods:</strong> Fake brands, stolen items, or pirated software.</li>
              <li>Any item that violates the laws of India.</li>
            </ul>
            <p className="mt-4 font-semibold">Violations will result in an immediate permanent ban without warning. Charges already paid for a listing removed under this section are not refunded.</p>
          </Section>

          <Section title="6. Payments, Credits &amp; Refunds">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment processing.</strong> All purchases are processed by Apple In-App Purchase on iOS and by Google Play Billing on Android. By making a purchase you also agree to the applicable store's terms. Grid never receives or stores your card, bank, or UPI details.</li>
              <li><strong>Credits.</strong> The Grid Wallet lets you hold credit and spend it on listings. Credit may carry an expiry date; where it does, the expiry is shown before you purchase.</li>
              <li><strong>Unspent credit is refundable.</strong> Credit you have not yet spent can be returned to you on request. Contact us at the address in section 17.</li>
              <li><strong>Spent credit is not refundable.</strong> Once credit has been applied to a listing and that listing has gone live, the charge is not refunded, because the service has been delivered.</li>
              <li><strong>Violations.</strong> If a listing is removed by our moderation team for breaching these Terms, the charge for that listing is not refunded.</li>
              <li><strong>Store refunds.</strong> Nothing in these Terms limits any refund right you have directly from Apple or Google under their own policies, or any right you have under applicable consumer law.</li>
              <li>Referral credit has no cash value and cannot be withdrawn or transferred.</li>
              <li>Grid does not process payments between buyers and sellers. Payment for an item itself is arranged directly between users, and Grid is not a party to it.</li>
            </ul>
          </Section>

          <Section title="7. Subscriptions">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid may offer optional paid subscription tiers with additional features.</li>
              <li>Subscriptions renew automatically at the end of each billing period unless cancelled.</li>
              <li><strong>You can cancel at any time</strong>, and you keep access to subscription features until the end of the period you have already paid for.</li>
              <li><strong>Cancellation is managed by Apple or Google</strong>, not by Grid, through your device's subscription settings. Deleting your Grid account does <strong>not</strong> cancel a subscription — you must cancel it separately with the store, or billing will continue.</li>
              <li>Prices and tier contents may change. We will give notice of changes before they take effect for your next renewal.</li>
            </ul>
          </Section>

          <Section title="8. Advertising &amp; Boosted Listings">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid displays sponsored listings in the feed, and sellers may pay to boost their own listings for greater visibility.</li>
              <li>Boosting increases the prominence of a listing. It does not guarantee a sale, a number of views, or any particular outcome.</li>
              <li>Sponsored and boosted content must comply with all the rules in these Terms, including section 5.</li>
              <li>Grid does not target advertising by gender.</li>
            </ul>
          </Section>

          <Section title="9. Messaging Conduct">
            <p className="mb-4">When using Grid's in-app messaging, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Communicate respectfully with all users</li>
              <li>Not send spam, unsolicited advertisements, or bulk messages</li>
              <li>Not share personal information of others without their consent</li>
              <li>Not engage in harassment, threats, hate speech, or discriminatory language</li>
              <li>Not use messaging for any purpose unrelated to marketplace transactions</li>
              <li>Not attempt to move transactions outside of Grid to avoid safety features</li>
            </ul>
          </Section>

          <Section title="10. Content Moderation &amp; Enforcement">
            <p className="mb-4 text-primary font-bold">GRID OPERATES A STRICT MODERATION SYSTEM, COMBINING AUTOMATED SCREENING WITH HUMAN REVIEW.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Automated screening.</strong> Every image and every title and description you submit is checked automatically before it is published. Content that fails screening may be blocked from publication.</li>
              <li><strong>Human review.</strong> Our moderation team reviews reports raised by users and handles cases escalated from automated screening.</li>
              <li>When a report involves a conversation, our moderation team may review recent messages from that conversation — including text and image attachments — to evaluate the report. Only messages relevant to the reported incident are accessed.</li>
              <li>We reserve the right to remove any listing, message, or content that violates these Terms or our community guidelines.</li>
              <li><strong>Graduated enforcement.</strong> Enforcement escalates: an account may first be <strong>restricted</strong>, then <strong>suspended for seven days</strong>, and then <strong>permanently removed</strong>. Severe violations, including any breach of section 5, may result in immediate permanent removal without earlier steps.</li>
              <li>Users who receive multiple reports may face accelerated enforcement action.</li>
              <li>Users will be notified of moderation actions taken against their account, including the reason.</li>
              <li><strong>Appeals.</strong> If your account has been restricted or suspended, or your content removed, you may ask us to review that decision by contacting us at the address in section 17. Decisions arising from automated screening will be reviewed by a person. We aim to respond as quickly as we can. Grid's decision following review is final.</li>
            </ul>
          </Section>

          <Section title="11. Referral Program">
            <ul className="list-disc pl-6 space-y-2">
              <li>Each user receives a unique referral code upon registration.</li>
              <li>You earn credit for each successful referral, when a new user completes signup using your code.</li>
              <li>Referral credit may carry an expiry date, which is shown on the credit in your wallet.</li>
              <li>Self-referral is prohibited and will result in credit forfeiture.</li>
              <li>Grid employs fraud detection measures including device fingerprinting and rate limiting.</li>
              <li>Credits are non-transferable, have no cash value, and cannot be exchanged or sold.</li>
              <li>Grid reserves the right to modify or terminate the referral program at any time.</li>
            </ul>
          </Section>

          <Section title="12. Intellectual Property">
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of content you create and share on Grid (listings, messages, images).</li>
              <li>By posting content, you grant Grid a non-exclusive, worldwide licence to display, distribute, and promote your content within the platform.</li>
              <li>You must not post content that infringes on the intellectual property rights of others.</li>
              <li>The Grid brand, logo, and application design are the intellectual property of Grid and may not be used without permission.</li>
            </ul>
          </Section>

          <Section title="13. User Safety">
            <ul className="list-disc pl-6 space-y-2">
              <li>When meeting for an exchange, choose a safe, public place — a campus common area, an office reception or lobby, or another busy location.</li>
              <li>Check the item before you pay.</li>
              <li>Report any suspicious activity, fraudulent listings, or threatening behaviour immediately.</li>
              <li>Use the block feature to prevent contact from unwanted users.</li>
              <li>Do not share sensitive personal information (bank details, passwords, home address) through the app.</li>
              <li>Grid is not responsible for the safety of in-person meetups between users.</li>
            </ul>
          </Section>

          <Section title="14. Limitation of Liability">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid is a platform that connects buyers and sellers. We are not a party to any transaction between users.</li>
              <li>We do not guarantee the quality, safety, legality, or accuracy of any listing.</li>
              <li>We are not responsible for any loss, damage, or injury arising from transactions between users.</li>
              <li>Grid is provided "as is" without warranties of any kind, express or implied.</li>
              <li>Our total liability to you shall not exceed the fees you have paid to Grid in the preceding 12 months.</li>
              <li>Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.</li>
            </ul>
          </Section>

          <Section title="15. Account Termination">
            <ul className="list-disc pl-6 space-y-2">
              <li>Grid may suspend or terminate your account for violation of these Terms, following the graduated enforcement process in section 10.</li>
              <li>Permanent removal is issued for severe or repeated violations.</li>
              <li><strong>Self-service deletion:</strong> You can delete your account directly in the app. Deletion is permanent and irreversible.</li>
              <li><strong>Before deleting:</strong> request the return of any unspent credit (section 6), and cancel any active subscription with Apple or Google (section 7). Deleting your Grid account does not do either of these for you.</li>
              <li>Alternatively, you may request account deletion by emailing <a href="mailto:contact.galvam@gmail.com?subject=Account%20Deletion%20Request" className="text-primary hover:underline">contact.galvam@gmail.com</a> with the subject "Account Deletion Request".</li>
              <li>Upon account deletion, your active listings are anonymised and your personal data is permanently removed. Messages you sent in existing conversations are retained for the other party's transaction history, but your identity is scrubbed.</li>
            </ul>
          </Section>

          <Section title="16. Dispute Resolution">
            <ul className="list-disc pl-6 space-y-2">
              <li>Users are encouraged to resolve disputes between themselves directly.</li>
              <li>Grid may facilitate dispute resolution at its discretion but is not obligated to do so.</li>
              <li>For unresolved disputes, you agree to first attempt informal resolution by contacting us at <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a>.</li>
            </ul>
          </Section>

          <Section title="17. Governing Law">
            <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </Section>

          <Section title="18. Changes to These Terms">
            <p>We may update these Terms from time to time. When we make changes, we will update the "Last Updated" date and notify users through the app. Your continued use of Grid after changes constitutes acceptance of the updated Terms. If you do not agree to the new Terms, you should stop using the service.</p>
          </Section>

          <Section title="19. Contact Us">
            <p>If you have any questions about these Terms, wish to appeal a moderation decision, or wish to request the return of unspent credit, please contact us:</p>
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
