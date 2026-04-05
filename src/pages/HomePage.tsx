import Hero from '../components/home/Hero'
import UseCases from '../components/home/UseCases'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import ExperienceShowcase from '../components/home/ExperienceShowcase'
import AppExperience from '../components/home/AppExperience'
import Pricing from '../components/home/Pricing'
import Referral from '../components/home/Referral'
import Testimonials from '../components/home/Testimonials'
import VisionMission from '../components/home/VisionMission'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <UseCases />
      <Features />
      <HowItWorks />
      <ExperienceShowcase />
      <AppExperience />
      <Pricing />
      <Referral />
      <Testimonials />
      <VisionMission />
      <DownloadCTA />
    </>
  )
}
