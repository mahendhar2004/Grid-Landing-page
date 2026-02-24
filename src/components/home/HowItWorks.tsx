import { UserCheck, Search, MessageCircle, Handshake, ChevronRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const steps = [
  {
    icon: UserCheck,
    title: 'Sign Up Instantly',
    description: 'Create your account with Google in seconds. Select your college, set your graduation year, and you\'re verified.',
  },
  {
    icon: Search,
    title: 'Browse or List',
    description: 'Explore items listed by your campus peers or post your own with photos, price, and category.',
  },
  {
    icon: MessageCircle,
    title: 'Chat in Real-Time',
    description: 'Message buyers or sellers directly. Negotiate prices, ask questions, and finalize details — all in-app.',
  },
  {
    icon: Handshake,
    title: 'Close the Deal',
    description: 'Meet on campus and make the exchange. Safe, local, and hassle-free — no shipping needed.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">Getting Started</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            How <span className="text-primary">Grid</span> Works
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Four simple steps from signup to sealed deal. It's that easy.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.1}>
              <div className="relative text-center px-4">
                <div className="w-16 h-16 bg-white text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-border">
                  <step.icon size={26} />
                </div>

                <h3 className="text-lg font-bold text-secondary mb-2.5">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>

                {/* Connector arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-8 -right-3 text-slate-300">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
