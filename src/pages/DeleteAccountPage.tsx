import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone, Database, AlertTriangle, ShieldCheck, Mail } from 'lucide-react'
import AnimatedSection from '../components/ui/AnimatedSection'

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen transition-colors duration-1000 relative"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32 relative z-10"
        style={{ color: 'var(--color-text)' }}
      >
        
        {/* ── Header ── */}
        <AnimatedSection direction="up" className="mb-20">
          <Link to="/" className="group inline-flex items-center gap-2 text-sm font-bold text-primary mb-10 hover:translate-x-[-4px] transition-all">
            <ArrowRight size={16} className="rotate-180" /> Back to Home
          </Link>
          
          <div className="max-w-2xl">
            <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-6">Offboarding</span>
            <h1 className="text-5xl sm:text-7xl font-bold text-secondary tracking-tight leading-[0.95] mb-8 transition-colors">
              Delete<br />
              <span className="text-primary italic">Account.</span>
            </h1>
            <p className="text-text-muted text-lg leading-relaxed transition-colors">
              We're sorry to see you go. Here's a quick guide on how to permanently delete your Grid presence.
            </p>
          </div>
        </AnimatedSection>

        {/* ── Content ── */}
        <div className="space-y-24">
          <AnimatedSection direction="up" delay={0.1}>
            <div className="prose-custom">
              <div className="grid gap-16">
                
                <OffboardingSection icon={<Smartphone size={22} />} title="How to Delete">
                  You can delete your Grid account directly from within the application. It's the fastest way to scrub your data:
                  <ol className="list-decimal pl-6 mt-6 space-y-4 font-medium text-secondary">
                    <li>Open <strong>Grid</strong> and go to the <strong>Profile</strong> tab</li>
                    <li>Tap on <strong>Edit Profile</strong></li>
                    <li>Scroll to the bottom and select <strong>Delete Account</strong></li>
                    <li>Confirm the deletion. This action is <span className="text-primary font-bold italic">immediate and irreversible.</span></li>
                  </ol>
                </OffboardingSection>

                <OffboardingSection icon={<Database size={22} />} title="What Gets Removed">
                  When you delete your account, we atomically scrub the following data from our active database:
                  <ul className="list-none grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {[
                      'Profile details & Phone',
                      'Active & Sold Listings',
                      'Conversation history',
                      'Saved products & Likes',
                      'Notifications & Preferences',
                      'Referral records'
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-bold text-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </OffboardingSection>

                <OffboardingSection icon={<AlertTriangle size={22} />} title="Important Notice">
                  <div className="p-8 rounded-[32px] border bg-primary/5 border-primary/20">
                    <p className="text-sm font-medium text-text-muted leading-relaxed">
                      Any remaining <span className="font-bold text-secondary">Grid Wallet balance</span> at the time of deletion will be forfeited. Credits are non-refundable and non-transferable as per our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
                    </p>
                  </div>
                </OffboardingSection>

                <OffboardingSection icon={<ShieldCheck size={22} />} title="Records Retained">
                  For legal and financial compliance (GST, income tax), transaction records are retained for up to 7 years. Additionally, safety or moderation logs (reports, flags) may be kept for up to 2 years to protect our campus community.
                </OffboardingSection>

                <OffboardingSection icon={<Mail size={22} />} title="Need Assistance?">
                  If you can't access the app or need help with offboarding, our support team is available:
                  <div className="mt-8 p-8 rounded-[32px] border flex items-center justify-between group" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <div>
                      <p className="text-sm font-bold text-secondary italic mb-1">Direct support</p>
                      <p className="text-primary font-bold">contact.galvam@gmail.com</p>
                    </div>
                    <a href="mailto:contact.galvam@gmail.com" className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center transition-all group-hover:scale-110">
                      <ArrowRight size={20} />
                    </a>
                  </div>
                </OffboardingSection>

              </div>
            </div>
          </AnimatedSection>
        </div>

      </div>
    </div>
  )
}

function OffboardingSection({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-secondary tracking-tight transition-colors">{title}</h2>
      </div>
      <div className="text-text-muted leading-relaxed pl-1 pr-6 transition-colors font-medium">
        {children}
      </div>
    </section>
  )
}
