import Hero from '../components/home/Hero'
import Lifecycle from '../components/home/Lifecycle'
import HowItWorks from '../components/home/HowItWorks'
import ExperienceShowcase from '../components/home/ExperienceShowcase'
import Features from '../components/home/Features'
import Pricing from '../components/home/Pricing'
import Testimonials from '../components/home/Testimonials'
import Referral from '../components/home/Referral'
import AppExperience from '../components/home/AppExperience'
import VisionMission from '../components/home/VisionMission'
import FreeListingBonus from '../components/home/FreeListingBonus'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      {/* 1. HOOK — grab attention, set the stage */}
      <Hero />

      {/* NEW BONUS — the immediate incentive */}
      <FreeListingBonus />

      {/* 2. THE ECOSYSTEM — problems, solutions, and lifelong campus value */}
      <Lifecycle />

      {/* 3. HOW — remove friction, show it's dead simple */}
      <HowItWorks />

      {/* 4. DESIRE — wow them with the full experience */}
      <ExperienceShowcase />

      {/* 5. FEATURES — deepen desire with specifics */}
      <Features />

      {/* 6. PRICE OBJECTION — zero commission, costs nothing to try */}
      <Pricing />

      {/* 7. SOCIAL PROOF — real students already use it */}
      <Testimonials />

      {/* 8. INCENTIVE — refer friends, earn money (FOMO + bonus value) */}
      <Referral />

      {/* 9. VISUAL APPEAL — it looks stunning, I want this on my phone */}
      <AppExperience />

      {/* 10. CREDIBILITY — we're serious people building this */}
      <VisionMission />

      {/* 11. ACTION — download RIGHT NOW */}
      <DownloadCTA />
    </>
  )
}
