import Hero from '../components/home/Hero'
import UseCases from '../components/home/UseCases'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import AppExperience from '../components/home/AppExperience'
import ThemeShowcase from '../components/home/ThemeShowcase'
import Safety from '../components/home/Safety'
import AnonymousMode from '../components/home/AnonymousMode'
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
      <AnonymousMode />
      <AppExperience />
      <ThemeShowcase />
      <Safety />
      <Pricing />
      <Referral />
      <Testimonials />
      <VisionMission />
      <DownloadCTA />
    </>
  )
}
