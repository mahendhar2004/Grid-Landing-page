import Hero from '../components/home/Hero'
import CollegeTicker from '../components/home/CollegeTicker'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import Categories from '../components/home/Categories'
import Safety from '../components/home/Safety'
import Referral from '../components/home/Referral'
import DownloadCTA from '../components/home/DownloadCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollegeTicker />
      <Features />
      <HowItWorks />
      <Categories />
      <Safety />
      <Referral />
      <DownloadCTA />
    </>
  )
}
