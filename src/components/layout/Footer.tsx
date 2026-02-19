import { Link } from 'react-router-dom'
import { Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border pt-20 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="text-2xl font-extrabold tracking-tight text-secondary mb-4">
              Grid<span className="brand-dot" />
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              The smarter campus marketplace. Simplifying student life across India.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[2px] text-secondary mb-5">
                Platform
              </h4>
              <div className="flex flex-col gap-3">
                <a href="/#features" className="text-text-muted text-sm hover:text-primary transition-colors">Features</a>
                <a href="/#how-it-works" className="text-text-muted text-sm hover:text-primary transition-colors">How it Works</a>
                <a href="/#categories" className="text-text-muted text-sm hover:text-primary transition-colors">Categories</a>
                <a href="/#referrals" className="text-text-muted text-sm hover:text-primary transition-colors">Referrals</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[2px] text-secondary mb-5">
                Legal
              </h4>
              <div className="flex flex-col gap-3">
                <Link to="/privacy" className="text-text-muted text-sm hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-text-muted text-sm hover:text-primary transition-colors">Terms & Conditions</Link>
                <Link to="/faqs" className="text-text-muted text-sm hover:text-primary transition-colors">FAQs</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[2px] text-secondary mb-5">
                Support
              </h4>
              <div className="flex flex-col gap-3">
                <a href="mailto:support@grid.app" className="text-text-muted text-sm hover:text-primary transition-colors">Contact Us</a>
                <a href="/#safety" className="text-text-muted text-sm hover:text-primary transition-colors">Safety Center</a>
                <Link to="/faqs" className="text-text-muted text-sm hover:text-primary transition-colors">Help</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-4">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Grid. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-text-muted hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-text-muted hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
