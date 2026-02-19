import { Smartphone, CheckCircle } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function DownloadCTA() {
  return (
    <section id="download" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="bg-primary rounded-[40px] py-20 sm:py-24 px-8 text-center text-white">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              The Grid<span className="brand-dot" style={{ background: 'white' }} /> is <span className="opacity-50">Coming Soon</span>.
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-xl mx-auto mb-10">
              Be the first in your batch to experience the smarter campus marketplace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-4 rounded-2xl">
                <Smartphone size={24} />
                <div className="text-left">
                  <p className="text-xs opacity-70">Coming soon on</p>
                  <p className="font-bold">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-4 rounded-2xl">
                <Smartphone size={24} />
                <div className="text-left">
                  <p className="text-xs opacity-70">Coming soon on</p>
                  <p className="font-bold">Google Play</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm opacity-70">
              <CheckCircle size={16} />
              <span>Available for 900+ colleges across India</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
