import { Gift, Zap, Award, ArrowRight, Sparkles, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

export default function Referral() {
  return (
    <section id="referrals" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Background dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.15 }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-6 relative">
        <AnimatedSection direction="up" delay={0.1}>
          <div className="relative rounded-[2.5rem] p-10 sm:p-16 lg:p-20 border shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-3xl overflow-hidden group/card transition-colors duration-500"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Animated background gradient blobs */}
            <motion.div 
              animate={{ 
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.1, 1] 
               }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 pointer-events-none mix-blend-multiply"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(139,92,246,0.1) 70%)' }}
            />
            
            <motion.div 
              animate={{ 
                rotate: [360, 270, 180, 90, 0],
                scale: [1, 1.2, 1] 
               }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 pointer-events-none mix-blend-multiply"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.1) 70%)' }}
            />

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              
              {/* Left Column (Text & Features) */}
              <div className="flex-1 max-w-xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 shadow-sm"
                >
                  <Sparkles size={16} />
                  <span className="text-[13px] font-black tracking-widest uppercase">Grid Rewards</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl sm:text-6xl font-extrabold text-secondary mb-6 leading-[1.1] tracking-tight"
                >
                  Grow the Grid,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
                    Earn Rewards.
                  </span>
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-text-muted text-lg sm:text-xl mb-10 leading-relaxed font-medium"
                >
                  Invite your friends to the campus marketplace. Build your local student grid and get free listing credits for every signup.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {[
                    { icon: Gift, title: 'Free Listings', desc: 'List items at zero cost' },
                    { icon: Users, title: 'Build Community', desc: 'Grow your campus grid' },
                    { icon: Zap, title: 'Instant Credits', desc: 'Applied automatically' },
                    { icon: Award, title: 'No Limits', desc: 'Refer as many as you want' },
                  ].map((perk, i) => (
                    <motion.div 
                      key={perk.title} 
                      className="flex gap-4 items-start group/perk p-3 -m-3 rounded-2xl transition-colors hover:bg-black/5"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl shadow-sm border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/perk:scale-110 group-hover/perk:bg-primary/5 group-hover/perk:border-primary/20 group-hover/perk:shadow-md"
                        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                      >
                        <perk.icon size={22} className="text-primary transition-transform group-hover/perk:rotate-12" />
                      </div>
                      <div className="pt-1">
                        <h4 className="text-secondary font-bold mb-1 text-[15px] transition-colors">{perk.title}</h4>
                        <p className="text-text-muted text-[13px] leading-snug transition-colors">{perk.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right Column (Interactive Card / CTA) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                className="w-full lg:w-[420px]"
              >
                <div className="relative group/cta perspective-1000">
                  {/* Glowing background behind card */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-indigo-400 to-purple-500 rounded-[2.5rem] blur opacity-30 group-hover/cta:opacity-50 transition duration-500 group-hover/cta:duration-200" />
                  
                  {/* Card itself */}
                  <div 
                    className="relative rounded-[2rem] p-8 sm:p-10 border shadow-2xl flex flex-col items-center text-center transform transition-all duration-500 group-hover/cta:-translate-y-2"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-8 border border-primary/20 shadow-inner">
                      <Gift size={36} className="text-primary" />
                      {/* Floating mini spark */}
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-2 -right-2 text-yellow-400"
                      >
                        <Sparkles size={24} />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-[26px] font-black text-secondary mb-3 leading-tight transition-colors">Claim your free listing</h3>
                    <p className="text-text-muted text-[15px] mb-8 leading-relaxed transition-colors">Refer friends to Grid and watch the zero-cost listing credits roll in.</p>
                    
                    <motion.a 
                      href="#download"
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 30px -5px rgba(37,99,235, 0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full relative overflow-hidden bg-primary text-white py-4.5 rounded-xl font-bold text-[14px] uppercase tracking-[1.5px] flex items-center justify-center gap-2 group/btn transition-all shadow-lg"
                    >
                      {/* Shimmer animation light streak */}
                      <motion.span 
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                        initial={{ x: '-150%' }}
                        animate={{ x: '150%' }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                      />
                      Start Referring
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </motion.a>
                    
                    <div className="mt-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      <p className="text-[12px] text-text-muted font-semibold uppercase tracking-wider">Credits never expire</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
