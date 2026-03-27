import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import AppExperience from '../components/home/AppExperience'
import Safety from '../components/home/Safety'
import Pricing from '../components/home/Pricing'
import Referral from '../components/home/Referral'
import Testimonials from '../components/home/Testimonials'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <AppExperience />
      <Safety />
      <Pricing />
      <Referral />
      <Testimonials />
      <DownloadCTA />
    </>
  )
}
