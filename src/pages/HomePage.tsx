import Hero from '../components/home/Hero'
import Hubs from '../components/home/Hubs'
import Lifecycle from '../components/home/Lifecycle'
import HowItWorks from '../components/home/HowItWorks'
import Reach from '../components/home/Reach'
import ProductRequests from '../components/home/ProductRequests'
import ExperienceShowcase from '../components/home/ExperienceShowcase'
import Features from '../components/home/Features'
import Testimonials from '../components/home/Testimonials'
import Referral from '../components/home/Referral'
import AppExperience from '../components/home/AppExperience'
import TrustSafety from '../components/home/TrustSafety'
import DataPrivacy from '../components/home/DataPrivacy'
import VisionMission from '../components/home/VisionMission'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      {/* 1. HOOK — v2 is coming, and here's the one-line reason it matters */}
      <Hero />

      {/* 2. THE BIG IDEA — verified Hubs are what v2 is built around */}
      <Hubs />

      {/* 3. THE ECOSYSTEM — the problems it solves across campus life */}
      <Lifecycle />

      {/* 4. HOW — two screens from a cold email to browsing */}
      <HowItWorks />

      {/* 5. REACH — control how far you post, choose how wide you look */}
      <Reach />

      {/* 6. TWO-WAY — requests that come back with real priced offers */}
      <ProductRequests />

      {/* 7. DESIRE — the full experience, end to end */}
      <ExperienceShowcase />

      {/* 8. FEATURES — the complete v2 set */}
      <Features />

      {/* 9. SOCIAL PROOF — what students say about Grid */}
      <Testimonials />

      {/* 10. INCENTIVE — bring your Hub across */}
      <Referral />

      {/* 11. VISUAL APPEAL — it looks good on your phone */}
      <AppExperience />

      {/* 12. TRUST — screening, consequences, anonymity */}
      <TrustSafety />

      {/* 13. PRIVACY — your data, and what we refuse to do with it */}
      <DataPrivacy />

      {/* 14. CREDIBILITY — who's building this and why */}
      <VisionMission />

      {/* 15. ACTION — follow along until launch day */}
      <DownloadCTA />
    </>
  )
}
