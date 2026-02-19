import { UserCheck, Search, MessageCircle, Handshake } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const steps = [
  {
    icon: UserCheck,
    step: '01',
    title: 'Sign Up Instantly',
    description: 'Create your account with Google in seconds. Select your college, set your graduation year, and you\'re verified.',
  },
  {
    icon: Search,
    step: '02',
    title: 'Browse or List',
    description: 'Explore items listed by your campus peers or post your own with photos, price, and category.',
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Chat in Real-Time',
    description: 'Message buyers or sellers directly. Negotiate prices, ask questions, and finalize details — all in-app.',
  },
  {
    icon: Handshake,
    step: '04',
    title: 'Close the Deal',
    description: 'Meet on campus and make the exchange. Safe, local, and hassle-free — no shipping needed.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            How <span className="text-primary">Grid</span> Works
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Four simple steps from signup to sealed deal. It's that easy.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={step.step} delay={i * 0.1}>
              <div className="relative text-center">
                <div className="w-16 h-16 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon size={28} />
                </div>
                <span className="text-xs font-bold text-primary/50 tracking-widest uppercase mb-2 block">
                  Step {step.step}
                </span>
                <h3 className="text-xl font-bold text-secondary mb-3">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 border-t-2 border-dashed border-slate-200" />
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
