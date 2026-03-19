import { Link } from 'react-router-dom'

export default function DeleteAccountPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">Delete Your Account</h1>
          <p className="text-text-muted">How to permanently delete your Grid account and all associated data.</p>
        </div>

        <div className="space-y-10 text-text-muted leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">How to Delete Your Account</h2>
            <p>You can delete your Grid account directly from within the app. Follow these steps:</p>
            <ol className="list-decimal list-inside mt-4 space-y-3">
              <li>Open the <strong>Grid</strong> app on your device.</li>
              <li>Tap the <strong>Profile</strong> tab (bottom-right).</li>
              <li>Tap <strong>Edit Profile</strong>.</li>
              <li>Scroll to the bottom and tap <strong>Delete Account</strong>.</li>
              <li>Confirm the deletion when prompted.</li>
            </ol>
            <p className="mt-4">Your account will be permanently deleted immediately. This action cannot be undone.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">What Gets Deleted</h2>
            <p>When you delete your account, the following data is permanently removed:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Your profile (name, phone number, profile picture, college, hostel)</li>
              <li>All your product listings</li>
              <li>All your conversations and chat messages</li>
              <li>Your saved products</li>
              <li>Your notifications</li>
              <li>Your push notification tokens</li>
              <li>Your referral records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">What May Be Retained</h2>
            <p>Certain records are retained after account deletion for legal and financial compliance:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li><strong>Payment and wallet transaction records</strong> — retained for up to 7 years as required by Indian financial regulations (GST, income tax).</li>
              <li><strong>Moderation and safety records</strong> — reports, bans, or fraud flags tied to your account may be retained for up to 2 years to protect the platform and other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">Wallet Balance</h2>
            <p>Any remaining Grid Wallet balance at the time of deletion is forfeited. Grid Wallet credits are non-refundable and non-transferable as stated in our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">Need Help?</h2>
            <p>
              If you are unable to access the app or need assistance with account deletion, contact us at{' '}
              <a href="mailto:contact.galvam@gmail.com" className="text-primary hover:underline">contact.galvam@gmail.com</a>.
              We will process your request within 30 days.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
