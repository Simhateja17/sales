import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import PageHero from '@/components/PageHero';
import CTA from '@/components/CTA';
import Pillars from '@/components/platform/Pillars';
import Architecture from '@/components/platform/Architecture';
import Latency from '@/components/platform/Latency';
import CRMSection from '@/components/platform/CRMSection';
import DevSection from '@/components/platform/DevSection';

export default function PlatformPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <PageHero
        kicker="The platform"
        title={<>An agent stack <em>composed of obsessions.</em></>}
        lede="Six layers — voice synthesis, reasoning, retrieval, telephony, integration, observability — each tuned by a team that cared more than they had to. The seams disappear. What you hear is your buyer talking to a person who happens to never sleep."
      />
      <Pillars />
      <Architecture />
      <Latency />
      <CRMSection />
      <DevSection />
      <CTA
        title={<>Hear the <em>seams disappear.</em></>}
        body="Thirty minutes. A live call. Barsha calls a number you choose. You decide if the seams are still there."
        cta="Book a 30-minute demo"
      />
      <Footer />
    </>
  );
}
