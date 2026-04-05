import { EyeOff, UserRound, ShieldCheck, Lock, Sparkles, UserX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import AnimatedSection from '../ui/AnimatedSection'

export default function AnonymousMode() {
  const [isAnonymous, setIsAnonymous] = useState(true)

  return (
    <section id="anonymous" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="up" className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 transition-colors">
            <Lock size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Privacy at Core</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-secondary tracking-tight leading-[1.1] mb-6 transition-colors">
            Your Identity.<br /><span className="text-primary">Your Terms.</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto transition-colors">
            Grid's signature Anonymous Mode lets you list items without revealing who you are. One toggle, total privacy.
          </p>
        </AnimatedSection>

        <div className="relative max-w-5xl mx-auto">
          {/* Glass Container */}
          <div className="relative rounded-[48px] border p-8 lg:p-16 overflow-hidden transition-colors duration-500 shadow-xl"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Minimal Background accents */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* ── Left: The Logic ── */}
              <div className="order-2 lg:order-1">
                <div className="space-y-10 group">
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500"
                      style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                    >
                      <UserX size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary mb-2 transition-colors">Masked Avatar</h4>
                      <p className="text-text-muted text-sm leading-relaxed transition-colors">Your real DP and name are instantly replaced with a sleek, anonymous ghost identity across the entire campus.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500"
                      style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary mb-2 transition-colors">Campus Trust</h4>
                      <p className="text-text-muted text-sm leading-relaxed transition-colors">Even while hidden, you keep your student status. Buyers trust you're a real student, without knowing your branch or year.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500"
                      style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                    >
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary mb-2 transition-colors">Instant Reveal</h4>
                      <p className="text-text-muted text-sm leading-relaxed transition-colors">Closing the deal? Reveal your identity only when you're comfortable. Total control from listing to final pickup.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: The Interactive Toggle Experience ── */}
              <div className="order-1 lg:order-2 flex flex-col items-center">
                <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-[40px] border p-6 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  
                  {/* Floating Elements Animation */}
                  <AnimatePresence mode="wait">
                    {isAnonymous ? (
                      <motion.div
                        key="anon"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -10 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative transition-colors"
                          style={{ backgroundColor: 'var(--color-primary-soft)', border: '4px solid var(--color-border)' }}
                        >
                          <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-primary/40"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <UserX size={40} className="text-primary" />
                        </div>
                        <h5 className="text-xl font-black text-secondary leading-none mb-2 tracking-tight transition-colors">Anonymous Student</h5>
                        <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors"
                          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                        >
                          <EyeOff size={10} /> IDENTITY MASKED
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="visible"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -10 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-6 overflow-hidden shadow-inner transition-colors"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop" 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <h5 className="text-xl font-black text-secondary leading-none mb-2 tracking-tight transition-colors">Aryan Sharma</h5>
                        <p className="text-primary text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors"
                          style={{ backgroundColor: 'var(--color-primary-soft)', borderColor: 'var(--color-primary)' }}
                        >
                           B.Tech · 3rd Year
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* The Premium Toggle */}
                  <div className="absolute bottom-8 w-[80%]">
                    <button 
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-full group h-12 rounded-2xl relative flex items-center px-1.5 transition-all duration-500 shadow-inner ${
                        isAnonymous ? 'bg-primary shadow-primary/50' : 'bg-muted'
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-[45%] h-[80%] bg-white rounded-xl shadow-lg flex items-center justify-center gap-2"
                        animate={{ x: isAnonymous ? '118%' : '0%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      >
                        {isAnonymous ? (
                          <>
                            <UserX size={14} className="text-violet-600" />
                            <span className="text-[10px] font-black text-violet-600 tracking-tight">HIDDEN</span>
                          </>
                        ) : (
                          <>
                            <UserRound size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 tracking-tight">SHOWN</span>
                          </>
                        )}
                      </motion.div>
                      <span className={`flex-1 text-[11px] font-bold transition-all duration-500 ${isAnonymous ? 'text-white/40 ml-4' : 'text-text-muted mr-4 text-right'}`}>
                        {isAnonymous ? 'Tap to Reveal' : 'Go Stealth'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Subtle detail text */}
                <motion.p 
                  className="mt-6 text-[11px] text-text-muted font-medium transition-colors"
                  animate={{ opacity: isAnonymous ? 1 : 0.5 }}
                >
                  {isAnonymous ? "Masked identity is active for this listing." : "Listing as Aryan Sharma (Trusted Student)."}
                </motion.p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
