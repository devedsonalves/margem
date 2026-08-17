import { CatalogSection } from '@/features/landing/components/CatalogSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { FinalCtaSection, Footer } from '@/features/landing/components/LandingFooter'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { PricingSection } from '@/features/landing/components/PricingSection'

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-white text-[#1b1b1d]'>
      <HeroSection />
      <FeaturesSection />
      <CatalogSection />
      <PricingSection />
      <FinalCtaSection />
      <Footer />
    </main>
  )
}
