import { useState } from 'react'
import { EyeOff, Eye, CheckCheck, Check, ShieldCheck, UserRound, UserX, Flag, Ban, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const badges = [
  { icon: Ban, label: 'Ban System', color: 'bg-red-50 text-red-600 border-red-100' },
  { icon: UserX, label: 'Block Users', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { icon: Flag, label: 'Report Content', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: ShieldAlert, label: 'Admin Moderation', color: 'bg-violet-50 text-violet-600 border-violet-100' },
]

const toggleConfig = [
  {
    key: 'anonymousMode' as const,
    label: 'Anonymous Mode',
    on: { icon: UserRound, chip: 'Name hidden from campus', chipColor: 'bg-violet-50 text-violet-600 border-violet-100', featureValue: 'Active', featureColor: 'text-violet-600' },
    off: { icon: UserRound, chip: 'Public student profile', chipColor: 'bg-slate-50 text-slate-400 border-slate-200', featureValue: 'Public', featureColor: 'text-slate-400' },
  },
  {
    key: 'onlineStatus' as const,
    label: 'Online Status',
    on: { icon: Eye, chip: 'Visible to campus', chipColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', featureValue: 'Visible', featureColor: 'text-emerald-600' },
    off: { icon: EyeOff, chip: 'Hidden from others', chipColor: 'bg-slate-50 text-slate-400 border-slate-200', featureValue: 'Hidden', featureColor: 'text-slate-400' },
  },
  {
    key: 'readReceipts' as const,
    label: 'Read Receipts',
    on: { icon: CheckCheck, chip: 'Others see "Seen"', chipColor: 'bg-blue-50 text-blue-600 border-blue-100', featureValue: 'Active', featureColor: 'text-blue-600' },
    off: { icon: Check, chip: 'Delivery only', chipColor: 'bg-slate-50 text-slate-400 border-slate-200', featureValue: 'Off', featureColor: 'text-slate-400' },
  },
  {
    key: 'blockRestrict' as const,
    label: 'Block & Restrict',
    on: { icon: UserX, chip: 'Active moderation ready', chipColor: 'bg-primary/5 text-primary border-primary/10', featureValue: 'Strict', featureColor: 'text-primary' },
    off: { icon: ShieldCheck, chip: 'Open community engagement', chipColor: 'bg-slate-50 text-slate-400 border-slate-200', featureValue: 'Standard', featureColor: 'text-slate-400' },
  },
]

type SettingsKey = 'anonymousMode' | 'onlineStatus' | 'readReceipts' | 'blockRestrict'

export default function Safety() {
  const [settings, setSettings] = useState<Record<SettingsKey, boolean>>({
    anonymousMode: true,
    onlineStatus: true,
    readReceipts: false,
    blockRestrict: true,
  })

  const toggle = (key: SettingsKey) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <section id="safety" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Laboratory grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left Content: Messaging & Status Card ── */}
          <AnimatedSection direction="left">
            <div className="max-w-xl">
              <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-6">Security & Privacy</span>
              <h2 className="text-5xl sm:text-6xl font-black text-secondary leading-[1.05] tracking-tight mb-8 transition-colors">
                Absolute <span className="text-primary">Control</span>,<br />Zero Stress.
              </h2>
              <p className="text-text-muted text-lg mb-12 leading-relaxed transition-colors">
                Privacy isn't a feature; it's the foundation. Grid empowers you with granular settings to control exactly how you're seen on campus.
              </p>

              {/* Live Status Card (Premium Glassmorphism) */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-[32px] border transition-colors duration-500 p-8 shadow-xl"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary transition-colors">Privacy Score: High</h4>
                      <p className="text-xs text-text-muted font-medium transition-colors">Your profile is campus-scoped & secure</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {toggleConfig.map(({ key, label, on, off }) => {
                      const active = settings[key]
                      const state = active ? on : off
                      return (
                        <div key={key} className="p-4 rounded-2xl border transition-all duration-500"
                          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                        >
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 transition-colors">{label}</p>
                          <p className={`text-sm font-extrabold transition-colors ${state.featureValue === 'Standard' || state.featureValue === 'Public' || state.featureValue === 'Hidden' || state.featureValue === 'Off' ? 'text-primary' : 'text-primary'}`}>
                            {state.featureValue}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right Content: Interactive Settings Panel ── */}
          <AnimatedSection direction="right">
            <div className="relative">
              {/* Outer decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-30" />

              <div className="relative rounded-[40px] border p-10 lg:p-12 transition-colors duration-500 shadow-2xl"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', backdropFilter: 'blur(20px)' }}
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-secondary mb-2 transition-colors">Live Privacy Panel</h3>
                  <p className="text-sm text-text-muted transition-colors">Manage your visibility and interaction rules.</p>
                </div>

                <div className="space-y-6 mb-12">
                  {toggleConfig.map(({ key, label, on, off }) => {
                    const active = settings[key]
                    const state = active ? on : off
                    const StateIcon = state.icon

                    return (
                      <div key={key} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-text-muted'}`}>
                              <StateIcon size={18} />
                            </div>
                            <span className={`text-base font-bold transition-colors ${active ? 'text-secondary' : 'text-text-muted'}`}>
                              {label}
                            </span>
                          </div>

                          {/* Refined iOS-style Toggle */}
                          <button
                            onClick={() => toggle(key)}
                            className={`w-14 h-7 rounded-full relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${active ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <motion.div
                              layout
                              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg"
                              animate={{ x: active ? 28 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={active ? 'active' : 'inactive'}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-text-muted border-border'}`}
                          >
                            <div className="w-1 h-1 rounded-full bg-current" />
                            {state.chip}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>

                {/* Integrated Moderation Row */}
                <div className="pt-8 border-t border-border mt-auto">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[2px] mb-6 transition-colors">Moderation Engine</p>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((b) => (
                      <div key={b.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all hover:scale-105 cursor-default bg-surface border-border text-secondary`}>
                        <b.icon size={14} strokeWidth={2.5} className="text-primary" />
                        <span className="uppercase tracking-tight">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
