import { Instagram, Mail, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedSection from '../ui/AnimatedSection'

export default function DownloadCTA() {
  return (
    <section id="stay-posted" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="relative overflow-hidden rounded-[40px] py-20 sm:py-24 px-6 sm:px-8 text-center will-change-transform border transition-all duration-500 shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >

            {/* Accent glow - top left */}
            <motion.div
              className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, var(--color-primary), transparent 70%)',
                opacity: 0.1,
                filter: 'blur(100px)',
                willChange: 'transform',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Accent glow - bottom right */}
            <motion.div
              className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, var(--color-primary), transparent 70%)',
                opacity: 0.1,
                filter: 'blur(100px)',
                willChange: 'transform',
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] mb-8 text-primary transition-colors">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                Coming Soon
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-black mb-6 tracking-tight leading-[1.1] text-secondary transition-colors">
                Grid v2 is<br />
                <span className="bg-gradient-to-r from-primary via-primary-bright to-primary bg-clip-text text-transparent">
                  almost here
                </span>
                <span className="text-secondary/20">.</span>
              </h2>

              <p className="text-base sm:text-lg text-text-muted max-w-lg mx-auto mb-12 leading-relaxed transition-colors">
                We're in the last stretch of the build. Follow along and you'll hear the day it lands — on Android and iOS together.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                {/* Instagram */}
                <motion.a
                  href="https://www.instagram.com/gridmarketplace?igsh=eXZ1ZjFsOGxrZDR0"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3.5 px-7 py-4 rounded-2xl text-white font-black shadow-xl shadow-primary/25"
                  style={{ background: 'linear-gradient(135deg, #8468F5 0%, #6E52E8 40%, #4A3AC4 100%)' }}
                >
                  <Instagram size={22} strokeWidth={2} />
                  <div className="text-left">
                    <p className="text-[10px] text-white/65 font-extrabold uppercase tracking-widest">Follow the build</p>
                    <p className="text-[15px] font-black -mt-0.5">@gridmarketplace</p>
                  </div>
                </motion.a>

                {/* Contact */}
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    to="/contact"
                    className="flex items-center justify-center gap-3.5 border px-7 py-4 rounded-2xl transition-colors duration-300 shadow-xl"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--color-border)' }}
                  >
                    <Mail size={22} strokeWidth={2} className="text-secondary transition-colors" />
                    <div className="text-left">
                      <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-widest transition-colors">Questions?</p>
                      <p className="text-[15px] font-black text-secondary -mt-0.5 transition-colors">Talk to us</p>
                    </div>
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-[2px] transition-colors">
                <MapPin size={15} />
                <span>Built in India, for Indian campuses &amp; workplaces</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
