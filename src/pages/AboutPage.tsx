import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Users,
  Sparkles,
  Recycle,
  ArrowRight,
  School,
  MessageCircle,
  Wallet,
  Search,
  Gift,
  EyeOff,
} from 'lucide-react'
import AnimatedSection from '../components/ui/AnimatedSection'
import VisionMission from '../components/home/VisionMission'

/**
 * About page — rendered standalone at /about and inside the mobile app's
 * WebView at /about?embed=1 (Navbar + Footer are hidden in embed mode via
 * the Layout component).
 */
export default function AboutPage() {
  return (
    <div className="transition-colors duration-500">
      {/* ──────────── Hero ──────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Soft background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-[0.45]"
          style={{
            background:
              'radial-gradient(ellipse, var(--color-primary-soft) 0%, transparent 70%)',
          }}
        />
        {/* Dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-5">
              About Grid
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary leading-[1.05] mb-6">
              The campus marketplace,
              <br />
              <span className="text-primary">built by students, for students.</span>
            </h1>
            <p className="text-text-muted text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              Grid is where college campuses across India buy, sell, and request the
              things that power student life — safely, locally, and in minutes, not
              days. No outsiders. No dodgy messages. Just your campus.
            </p>
          </AnimatedSection>

          {/* Quick stats row */}
          <AnimatedSection delay={0.15}>
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
              <Stat value="100%" label="Verified students" />
              <Stat value="0%" label="Platform commission" />
              <Stat value="1 campus" label="1 community" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ──────────── The story ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-4">
              Our story
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight">
              Students were already trading.
              <br />
              <span className="text-primary">We just made it safer.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="max-w-3xl mx-auto space-y-5 text-text-muted text-base sm:text-lg leading-relaxed">
              <p>
                Every hostel has a seniors' group with a used cycle, a calculator, a
                mattress, a cooler — someone passing them down to the next batch at
                the start of every semester. But the handoff usually happens on a
                crowded WhatsApp group, between strangers on a sketchy listing app,
                or not at all — and good stuff ends up in a dump.
              </p>
              <p>
                Grid was built to fix that. We took everything that already worked
                about trading with a peer you pass in the corridor — trust, price
                fairness, zero commission — and put it behind an app that only your
                campus can access. No scammers pretending to be students. No
                listings from cities you've never been to. Just the people you
                already share a mess hall with.
              </p>
              <p className="text-secondary font-semibold">
                If you've ever sold a book at a flea price because you didn't know
                who to sell it to, or dropped a bucket because you couldn't haul it
                home — Grid is for you.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ──────────── The campus-only principle ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection direction="left">
              <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-4">
                The core principle
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight">
                One campus.
                <br />
                <span className="text-primary">One circle.</span>
              </h2>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed mb-5">
                On Grid, every listing, every request, every message stays inside
                the walls of your own college. Your feed is your campus — not the
                city, not the state, not a random region.
              </p>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed">
                This single rule is what makes Grid feel different. You can meet
                the seller between classes. Returns are simple. Price is fair. And
                if something goes wrong, you're not hunting down a stranger — you
                know who they are.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.1}>
              <div
                className="relative rounded-3xl border border-border/70 p-8 lg:p-10 shadow-xl"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, var(--color-primary-soft), transparent 70%)',
                  }}
                />
                <div className="relative space-y-5">
                  <CampusRow
                    icon={<School size={18} />}
                    text="Every user is verified through their college"
                  />
                  <CampusRow
                    icon={<ShieldCheck size={18} />}
                    text="Listings are visible only to peers on the same campus"
                  />
                  <CampusRow
                    icon={<Users size={18} />}
                    text="Reports and blocks stay inside the community"
                  />
                  <CampusRow
                    icon={<EyeOff size={18} />}
                    text="Anonymous listing mode for sensitive categories"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ──────────── What you can do on Grid ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-4">
              What Grid is for
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary mb-5 leading-tight">
              A campus in your pocket.
            </h2>
            <p className="text-text-muted text-base sm:text-lg leading-relaxed">
              Six ways Grid fits into a normal student week.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <FeatureCard
              icon={<Sparkles size={20} />}
              title="Sell in minutes"
              body="Snap a photo, set a price, post. Everyone in your hostel sees it before dinner."
            />
            <FeatureCard
              icon={<Search size={20} />}
              title="Find the exact thing"
              body="Filter by category, condition, and price. Save what you like, skip what you don't."
            />
            <FeatureCard
              icon={<MessageCircle size={20} />}
              title="Chat without sharing a number"
              body="In-app chat with read receipts. Your phone number stays yours."
            />
            <FeatureCard
              icon={<Users size={20} />}
              title="Post a request"
              body="Need a specific item? Put up a Wanted post — sellers come to you instead."
            />
            <FeatureCard
              icon={<Wallet size={20} />}
              title="Wallet + payments"
              body="Razorpay-powered wallet for quick top-ups, free listing credits, and fair listing fees."
            />
            <FeatureCard
              icon={<Gift size={20} />}
              title="Earn by referring"
              body="Invite friends onto your campus. Every successful referral unlocks free listings."
            />
          </div>
        </div>
      </section>

      {/* ──────────── Vision + Mission (existing component) ──────────── */}
      <VisionMission />

      {/* ──────────── How we build ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-4">
              How we build
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary mb-5 leading-tight">
              The four things we refuse to compromise on.
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            <PrincipleCard
              number="01"
              icon={<ShieldCheck size={20} />}
              title="Trust over reach"
              body="We'd rather have 500 real students on a single campus than 50,000 random accounts. Verification is non-negotiable."
            />
            <PrincipleCard
              number="02"
              icon={<Sparkles size={20} />}
              title="Speed feels like magic"
              body="From tapping 'Sell' to a live listing: under a minute. From 'Buy' to 'Deal': a few messages. Anything slower is a bug."
            />
            <PrincipleCard
              number="03"
              icon={<Users size={20} />}
              title="Community before commission"
              body="We don't take a cut of your sale. A small listing fee keeps the platform clean — that's it. Your money stays yours."
            />
            <PrincipleCard
              number="04"
              icon={<Recycle size={20} />}
              title="Circular, not disposable"
              body="Every item resold on Grid is one less item in a landfill. Campus commerce is inherently sustainable — we just scaled it."
            />
          </div>
        </div>
      </section>

      {/* ──────────── Team / Origin ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="inline-block text-primary font-bold text-sm tracking-[3px] uppercase mb-4">
              Who's behind Grid
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary mb-6 leading-tight">
              Built in India, by a small team
              <br />
              <span className="text-primary">who've lived this problem.</span>
            </h2>
            <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Grid is a product of <span className="text-secondary font-semibold">Galvam</span>{' '}
              — a small software studio building tools for the everyday corners of
              Indian life that the global apps never quite get right. We write every
              line of code. We answer every bug report. We read every piece of
              feedback.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-full border border-border/70 bg-surface/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-text-muted uppercase tracking-[2px]">
                Actively rolling out to new campuses
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ──────────── Closing CTA ──────────── */}
      <section className="py-20 lg:py-28 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <motion.div
              className="relative rounded-[32px] border border-border/70 p-10 lg:p-14 text-center overflow-hidden shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)' }}
              whileHover={{
                y: -4,
                boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                borderColor: 'var(--color-primary)',
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-primary-soft), transparent 70%)',
                }}
              />
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-secondary mb-4 leading-tight">
                  Got a question?{' '}
                  <span className="text-primary">We read every message.</span>
                </h3>
                <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  Whether it's a bug, a feature you wish existed, or just a note —
                  reach out. There's a real person on the other side.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-[2px] hover:bg-primary-dark transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20"
                  >
                    Contact the team
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/faqs"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-text-muted hover:text-primary hover:border-primary/40 font-black text-xs uppercase tracking-[2px] transition-all"
                  >
                    Read FAQs
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

/* ─────────── Small presentation helpers ─────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-secondary leading-none mb-2">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs font-black uppercase tracking-[2px] text-text-muted">
        {label}
      </div>
    </div>
  )
}

function CampusRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-primary"
        style={{ backgroundColor: 'var(--color-primary-soft)' }}
      >
        {icon}
      </div>
      <p className="text-text-muted text-sm sm:text-base leading-relaxed pt-1.5">
        {text}
      </p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <motion.div
      className="relative rounded-2xl border border-border/70 p-6 h-full overflow-hidden transition-colors shadow-sm"
      style={{ backgroundColor: 'var(--color-surface)' }}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
        borderColor: 'var(--color-primary)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-primary mb-4"
        style={{ backgroundColor: 'var(--color-primary-soft)' }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-secondary mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-text-muted text-sm leading-relaxed">{body}</p>
    </motion.div>
  )
}

function PrincipleCard({
  number,
  icon,
  title,
  body,
}: {
  number: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <motion.div
      className="relative rounded-3xl border border-border/70 p-8 overflow-hidden shadow-sm"
      style={{ backgroundColor: 'var(--color-surface)' }}
      whileHover={{
        y: -4,
        boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
        borderColor: 'var(--color-primary)',
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-primary"
          style={{ backgroundColor: 'var(--color-primary-soft)' }}
        >
          {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-[3px] text-text-muted/60 pt-3">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-extrabold text-secondary mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-text-muted text-sm sm:text-base leading-relaxed">{body}</p>
    </motion.div>
  )
}
