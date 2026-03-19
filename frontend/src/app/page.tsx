import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformBar } from '@/components/landing/PlatformBar';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ObjectionsSection } from '@/components/landing/ObjectionsSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <LandingNav />
      <HeroSection />
      <PlatformBar />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <SocialProofSection />
      <ComparisonSection />
      <PricingSection />
      <ObjectionsSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  );
}
