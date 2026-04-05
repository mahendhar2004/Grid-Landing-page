import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

export default function DownloadCTA() {
  return (
    <section id="download" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="relative overflow-hidden rounded-[40px] py-20 sm:py-24 px-8 text-center text-white will-change-transform border border-border transition-all duration-500 shadow-2xl"
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
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Get the App
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-black mb-6 tracking-tight leading-[1.1] text-secondary transition-colors">
                Join the<br />
                <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                  Grid Today
                </span>
                <span className="text-secondary/20">.</span>
              </h2>

              <p className="text-base sm:text-lg text-text-muted max-w-md mx-auto mb-12 leading-relaxed transition-colors">
                Be the first in your batch to experience the smarter campus marketplace.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                {/* Google Play */}
                <a 
                  href="https://play.google.com/store/apps/details?id=com.galvam.grid&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 bg-muted/80 border border-border hover:bg-surface hover:border-primary/30 backdrop-blur-sm px-7 py-4 rounded-2xl transition-all duration-300 shadow-xl"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" className="fill-secondary transition-colors"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.395 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/></svg>
                  <div className="text-left">
                    <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-widest transition-colors">Get it on</p>
                    <p className="text-[15px] font-black text-secondary -mt-0.5 transition-colors">Google Play</p>
                  </div>
                </a>

                {/* App Store */}
                <div className="group flex items-center gap-3.5 bg-muted/50 border border-border backdrop-blur-sm px-7 py-4 rounded-2xl transition-all duration-300 opacity-60 shadow-xl grayscale">
                  <svg width="26" height="26" viewBox="0 0 24 24" className="fill-secondary transition-colors"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-left">
                    <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-widest transition-colors">Coming soon on</p>
                    <p className="text-[15px] font-black text-secondary -mt-0.5 transition-colors">App Store</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-[2px] transition-colors">
                <CheckCircle size={15} />
                <span>Available across Indian campuses</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
