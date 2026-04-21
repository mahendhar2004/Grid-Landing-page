import { motion } from 'framer-motion'
import { Search, Zap, BellRing, Navigation, ArrowRight, UserPlus, Sparkles } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function ProductRequests() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
      
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          
          {/* Left: Interactive Visual */}
          <div className="order-2 lg:order-1 relative">
            <AnimatedSection direction="left">
              <div className="relative aspect-square max-w-[500px] mx-auto">
                {/* Central Pulser */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary rounded-full blur-2xl"
                      />
                      <div className="relative w-24 h-24 rounded-3xl bg-surface border border-primary/30 flex items-center justify-center shadow-2xl">
                        <Search size={32} className="text-primary" />
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute -inset-2 border-2 border-dashed border-primary/20 rounded-full"
                        />
                      </div>
                   </div>
                </div>

                {/* Satellite Seller Avatars */}
                {[
                  { pos: 'top-0 left-1/4', delay: 0 },
                  { pos: 'top-1/4 right-0', delay: 0.5 },
                  { pos: 'bottom-1/4 left-0', delay: 1 },
                  { pos: 'bottom-0 right-1/4', delay: 1.5 }
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: s.delay + 0.5, duration: 0.6 }}
                    className={`absolute ${s.pos} flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/60 shadow-xl group`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-primary">
                       <Zap size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black italic text-primary uppercase leading-none mb-1">Seller Notified</span>
                      <span className="text-[11px] font-bold text-secondary">Has what you need</span>
                    </div>
                    {/* Connection Line */}
                    <div className="absolute top-1/2 right-full w-20 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
                  </motion.div>
                ))}

                {/* Floating Tags */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-10 right-10 px-4 py-2 rounded-xl bg-surface border border-primary/40 text-[10px] font-black text-primary italic shadow-lg"
                >
                  Urgently Needed
                </motion.div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <AnimatedSection direction="right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-bold text-[10px] uppercase tracking-widest italic">
                <Sparkles size={12} className="animate-pulse" />
                The New Two-Way Era
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-black text-secondary tracking-tighter leading-[0.9] italic mb-8">
                Stop Browsing.<br />
                <span className="text-primary not-italic">Start Requesting.</span>
              </h2>

              <p className="text-lg text-text-muted leading-relaxed font-medium mb-10 italic max-w-xl">
                Grid is now much more than just a list of items. It's a living campus network. If it isn't listed, just ask. Our smart matching algorithm notifies sellers across the campus who might have exactly what you're looking for.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-secondary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Navigation size={16} />
                    </div>
                    <span className="text-sm font-black italic uppercase tracking-tight">Geo-Spatial Match</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">Notifications are sent to sellers in your hostel or batch first for fastest pickup.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-secondary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <BellRing size={16} />
                    </div>
                    <span className="text-sm font-black italic uppercase tracking-tight">Smart Alerts</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">Sellers get a gentle nudge when their unlisted items match your specific request.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-5 rounded-[20px] bg-primary text-white font-black uppercase tracking-[3px] text-[11px] italic shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all"
                >
                  Try Product Requests <ArrowRight size={18} />
                </motion.button>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </div>
    </section>
  )
}
