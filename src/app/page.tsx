import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import Hero from '@/components/home/Hero';
import Trusted from '@/components/home/Trusted';
import Capabilities from '@/components/home/Capabilities';
import VoiceDemo from '@/components/home/VoiceDemo';
import HomeNumbers from '@/components/home/HomeNumbers';
import Workflow from '@/components/home/Workflow';
import Integrations from '@/components/home/Integrations';
import HomePricing from '@/components/home/HomePricing';
import HomeCTA from '@/components/home/HomeCTA';

export default function Home() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <Hero />
      <Trusted />
      <Capabilities />
      <VoiceDemo />
      <HomeNumbers />
      <Workflow />
      <Integrations />
      <HomePricing />
      <HomeCTA />
      <Footer />
    </>
  );
}
