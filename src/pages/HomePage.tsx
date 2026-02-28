import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import Categories from '../components/home/Categories'
import Safety from '../components/home/Safety'
import Pricing from '../components/home/Pricing'
import Referral from '../components/home/Referral'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Categories />
      <Safety />
      <Pricing />
      <Referral />
      <DownloadCTA />
    </>
  )
}
