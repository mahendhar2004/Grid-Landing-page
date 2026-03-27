import { useState } from 'react'
import { EyeOff, Eye, CheckCheck, Check, ShieldCheck, MessageCircle, LockKeyhole, UserRound, UserX, Flag, Ban } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const badges = [
  { icon: Ban,    label: 'Ban System',     color: 'bg-red-500/10 border-red-500/20 text-red-300'         },
  { icon: UserX,  label: 'Block Users',    color: 'bg-orange-500/10 border-orange-500/20 text-orange-300' },
  { icon: Flag,   label: 'Report Content', color: 'bg-blue-500/10 border-blue-500/20 text-blue-300'       },
]

// Per-toggle visual config for both states
const toggleConfig = [
  {
    key: 'onlineStatus' as const,
    label: 'Show Online Status',
    on:  { icon: Eye,            chip: 'Visible to campus', chipColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', featureValue: 'Visible',  featureColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
    off: { icon: EyeOff,         chip: 'Hidden from others', chipColor: 'bg-white/5 text-white/30 border-white/10',                featureValue: 'Hidden',   featureColor: 'text-white/30 bg-white/5 border-white/10' },
  },
  {
    key: 'readReceipts' as const,
    label: 'Read Receipts',
    on:  { icon: CheckCheck,     chip: 'Others see "Seen"',  chipColor: 'bg-blue-500/15 text-blue-300 border-blue-500/20',         featureValue: 'Seen ✓✓', featureColor: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
    off: { icon: Check,          chip: 'Delivery only',       chipColor: 'bg-white/5 text-white/30 border-white/10',                featureValue: 'Private',  featureColor: 'text-white/30 bg-white/5 border-white/10' },
  },
  {
    key: 'allowMessages' as const,
    label: 'Allow Messages',
    on:  { icon: MessageCircle,  chip: 'Open to campus',     chipColor: 'bg-primary/15 text-primary border-primary/20',            featureValue: 'Open',     featureColor: 'text-primary bg-primary/10 border-primary/20' },
    off: { icon: LockKeyhole,    chip: 'No one can message', chipColor: 'bg-rose-500/15 text-rose-300 border-rose-500/20',         featureValue: 'Locked',   featureColor: 'text-rose-300 bg-rose-500/10 border-rose-500/20' },
  },
  {
    key: 'anonymousListings' as const,
    label: 'Anonymous Listings',
    on:  { icon: UserX,          chip: 'Name hidden',        chipColor: 'bg-violet-500/15 text-violet-300 border-violet-500/20',   featureValue: 'Masked',   featureColor: 'text-violet-300 bg-violet-500/10 border-violet-500/20' },
    off: { icon: UserRound,      chip: 'Name shown',         chipColor: 'bg-white/5 text-white/30 border-white/10',                featureValue: 'Shown',    featureColor: 'text-white/30 bg-white/5 border-white/10' },
  },
]

type SettingsKey = 'onlineStatus' | 'readReceipts' | 'allowMessages' | 'anonymousListings'

const featureIcons: Record<SettingsKey, React.ElementType> = {
  onlineStatus:     EyeOff,
  readReceipts:     CheckCheck,
  allowMessages:    ShieldCheck,
  anonymousListings: Flag,
}

export default function Safety() {
  const [settings, setSettings] = useState<Record<SettingsKey, boolean>>({
    onlineStatus: true,
    readReceipts: false,
    allowMessages: true,
    anonymousListings: false,
  })

  const toggle = (key: SettingsKey) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <section id="safety" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="relative rounded-[36px] overflow-hidden border border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, #080c18 0%, #09090b 50%, #0d0814 100%)' }}
          >
            {/* Glow orbs */}
            <motion.div className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,123,255,0.16), transparent 70%)', filter: 'blur(80px)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.14), transparent 70%)', filter: 'blur(70px)' }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)', backgroundSize: '28px 28px' }}
            />

            <div className="relative grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">

              {/* ── Left: feature rows (react to toggle state) ── */}
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-5">Privacy & Safety</span>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                  You're in <span className="text-primary">Control</span>.
                </h2>
                <p className="text-white/40 text-base max-w-md mb-10 leading-relaxed">
                  Every privacy setting is yours to own. Grid puts you in charge — with a moderation team always watching your back.
                </p>

                <div className="space-y-3">
                  {toggleConfig.map(({ key, on, off }) => {
                    const active = settings[key]
                    const state = active ? on : off
                    const Icon = featureIcons[key]
                    return (
                      <motion.div key={key}
                        layout
                        className="flex items-center justify-between rounded-2xl border px-5 py-3.5 transition-colors duration-300"
                        style={{ borderColor: active ? undefined : 'rgba(255,255,255,0.07)', background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${active ? 'bg-primary/20' : 'bg-white/[0.06]'}`}>
                            <Icon size={14} className={active ? 'text-primary' : 'text-white/30'} />
                          </div>
                          <span className={`text-sm font-medium transition-colors duration-300 ${active ? 'text-white/70' : 'text-white/30'}`}>
                            {toggleConfig.find(t => t.key === key)!.label}
                          </span>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.span key={state.featureValue}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${state.featureColor}`}
                          >
                            {state.featureValue}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* ── Right: interactive toggles ── */}
              <div className="p-10 lg:p-14 flex flex-col justify-center gap-6">

                <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6">
                  <p className="text-white/70 text-sm font-extrabold mb-5 tracking-wide">Privacy Settings</p>

                  <div className="space-y-2">
                    {toggleConfig.map(({ key, label, on, off }) => {
                      const active = settings[key]
                      const state = active ? on : off
                      const StateIcon = state.icon
                      return (
                        <div key={key}
                          className="rounded-2xl border border-white/[0.06] overflow-hidden transition-colors duration-300"
                          style={{ background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)' }}
                        >
                          {/* Toggle row */}
                          <button
                            onClick={() => toggle(key)}
                            className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <StateIcon size={14} className={`flex-shrink-0 transition-colors duration-300 ${active ? 'text-white/60' : 'text-white/25'}`} />
                              <span className={`text-sm font-medium transition-colors duration-300 ${active ? 'text-white/70' : 'text-white/35'}`}>
                                {label}
                              </span>
                            </div>
                            {/* Toggle pill */}
                            <div
                              className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors duration-300 ${active ? 'bg-primary' : 'bg-white/10'}`}
                            >
                              <motion.div
                                layout
                                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                                animate={{ x: active ? 22 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            </div>
                          </button>

                          {/* State chip — slides in below when active */}
                          <AnimatePresence>
                            {active && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className={`mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold ${on.chipColor}`}>
                                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                  {on.chip}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Moderation badges */}
                <div className="flex flex-wrap gap-2.5">
                  {badges.map((b) => (
                    <div key={b.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${b.color}`}>
                      <b.icon size={13} />
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
