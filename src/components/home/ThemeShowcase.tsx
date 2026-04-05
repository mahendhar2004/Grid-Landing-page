import { Sun, Moon, Smartphone, Layout, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeShowcase() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section id="theme-showcase" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-1000">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* ── Left Content: The Story ── */}
          <AnimatedSection direction="left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 transition-colors font-medium">
                <Layout size={12} />
                <span className="text-[10px] font-bold uppercase tracking-[2px] leading-none">Designed for you</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-tighter mb-8 transition-colors text-secondary italic">
                {isDark ? 'Dark Mode' : 'Bright Mode'}<br />
                <span className="text-primary not-italic">& Clear.</span>
              </h2>
              <p className="text-text-muted text-lg mb-12 leading-relaxed transition-colors">
                Whether you're in a morning lecture or up late in the hostel, the app changes to match your day. One tap to switch between a clean bright look and a sleek dark theme.
              </p>

              {/* Simple Toggle Button */}
              <button 
                onClick={toggleTheme}
                className={`group relative flex items-center gap-4 px-8 py-5 rounded-[24px] border transition-all duration-700 shadow-xl overflow-hidden ${isDark ? 'border-primary/30 bg-primary/20 shadow-primary/20' : 'border-border bg-surface shadow-slate-100'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-700 opacity-0 group-hover:opacity-10 ${isDark ? 'from-white to-transparent' : 'from-primary to-transparent'}`} />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${isDark ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-muted text-text-muted'}`}>
                  {isDark ? <Moon size={22} fill="currentColor" /> : <Sun size={22} />}
                </div>
                <div className="text-left relative z-10">
                  <p className={`text-[11px] font-black uppercase tracking-[2px] ${isDark ? 'text-white' : 'text-secondary'}`}>
                    {isDark ? 'Back to Bright' : 'Try Dark Mode'}
                  </p>
                  <p className={`text-[9px] font-black uppercase tracking-[2px] opacity-40 ${isDark ? 'text-white' : 'text-text-muted'}`}>
                    {isDark ? 'Clarity' : 'Comfort'}
                  </p>
                </div>
                <ArrowRight size={18} className={`ml-4 transition-all duration-500 group-hover:translate-x-1 ${isDark ? 'text-primary' : 'text-text-muted'}`} />
              </button>
            </div>
          </AnimatedSection>

          {/* ── Right Content: The Visual Proof ── */}
          <AnimatedSection direction="right" className="relative">
            {/* Crystal Clear Preview Panel */}
            <div className="relative h-[600px] rounded-[56px] transition-all duration-1000 overflow-hidden shadow-2xl border p-1"
              style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)' }}
            >
              {/* Dynamic Theme Glow Indicator */}
              <motion.div 
                 className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 animate={{ backgroundColor: isDark ? 'var(--color-primary)' : 'transparent' }}
                 transition={{ duration: 1 }}
              />

              {/* Content Areas */}
              <div className="h-full flex flex-col p-8 lg:p-12 gap-8">
                
                {/* Header Preview */}
                <div className="flex items-center justify-between pb-6 border-b border-border transition-colors duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors">
                      <Layout size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-secondary transition-colors uppercase tracking-widest">
                        {isDark ? 'Dark Mode' : 'Bright Mode'}
                      </h4>
                      <p className="text-[10px] font-bold text-text-muted uppercase transition-colors">Visual Preview</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-text-muted border border-border'}`}>
                    Active
                  </div>
                </div>

                {/* Main Feature Cards */}
                <div className="flex-1 flex flex-col gap-6 justify-center">
                  
                  {/* Card 1: Feed Item */}
                  <motion.div 
                    layout
                    className="p-6 rounded-[32px] border shadow-xl transition-all duration-700"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-orange-600 transition-all">
                        <Smartphone size={18} />
                       </div>
                       <div>
                         <div className="h-2 w-24 bg-primary/20 rounded-full mb-2" />
                         <div className="h-1.5 w-16 bg-muted rounded-full" />
                       </div>
                    </div>
                    <p className="text-sm font-bold text-secondary transition-colors leading-relaxed">
                       "A premium campus marketplace designed to look beautiful in every light."
                    </p>
                  </motion.div>

                  {/* Card 2: Interactive Element */}
                  <motion.div 
                    layout
                    className="self-end w-[85%] p-6 rounded-[32px] border shadow-xl transition-all duration-1000"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-primary)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Performance</span>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                       <motion.div 
                         className="h-full bg-primary shadow-[0_0_12px_var(--color-primary)]"
                         animate={{ width: isDark ? '100%' : '60%' }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                       />
                    </div>
                  </motion.div>

                </div>

                {/* Bottom Status */}
                <div className="pt-6 border-t border-border flex items-center justify-between transition-colors duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest transition-colors">System Ready</span>
                  </div>
                  <span className="text-[9px] font-black text-text-muted/40 uppercase tracking-[2px] transition-colors italic">Made for campus.</span>
                </div>

              </div>

              {/* Ambient Artistic Glows */}
              <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[120px] transition-all duration-1000 opacity-[0.08] bg-primary" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] transition-all duration-1000 opacity-[0.05] bg-primary" />
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
