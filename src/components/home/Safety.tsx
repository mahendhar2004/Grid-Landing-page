import { EyeOff, CheckCheck, ShieldCheck, Flag, Ban, UserX } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Safety() {
  return (
    <section id="safety" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <AnimatedSection direction="left">
            <span className="text-primary font-bold text-sm block mb-4">Privacy & Safety First</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-6">
              You're in <span className="text-primary">Control</span>.
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed">
              Your privacy matters. Grid. puts you in charge of your campus presence with granular controls and a dedicated moderation team.
            </p>

            <div className="space-y-6">
              {[
                { icon: EyeOff, title: 'Online Status Control', desc: 'Choose whether to show your active status to other students.' },
                { icon: CheckCheck, title: 'Read Receipts', desc: 'Control if others can see when you\'ve read their messages.' },
                { icon: ShieldCheck, title: 'Report & Block', desc: 'Report suspicious listings and block users with a single tap.' },
                { icon: Flag, title: 'Admin Moderation', desc: 'A dedicated team reviews reports and takes action — warnings, bans, or content removal.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">{item.title}</h4>
                    <p className="text-text-muted text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Visual - Settings card + moderation badges */}
          <AnimatedSection direction="right" className="flex justify-center lg:justify-end">
            <div className="space-y-5 w-full max-w-[360px]">
              {/* Settings card */}
              <div className="bg-white rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-border">
                <h3 className="font-extrabold text-lg text-secondary mb-6">Privacy Settings</h3>
                {[
                  { label: 'Show Online Status', active: true },
                  { label: 'Read Receipts', active: false },
                  { label: 'Allow Messages', active: true },
                  { label: 'Anonymous Listings', active: false },
                ].map((setting) => (
                  <div key={setting.label} className="flex justify-between items-center py-4 border-b border-border last:border-0">
                    <span className="font-semibold text-sm text-secondary">{setting.label}</span>
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${setting.active ? 'bg-primary' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${setting.active ? 'left-[22px]' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety badges */}
              <div className="flex gap-3 flex-wrap justify-center">
                {[
                  { icon: Ban, label: 'Ban System', color: 'bg-red-50 text-red-600' },
                  { icon: UserX, label: 'Block Users', color: 'bg-orange-50 text-orange-600' },
                  { icon: Flag, label: 'Report Content', color: 'bg-blue-50 text-blue-600' },
                ].map((badge) => (
                  <div key={badge.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${badge.color}`}>
                    <badge.icon size={14} />
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
