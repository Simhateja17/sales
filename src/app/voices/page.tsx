import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import VoiceLibrary from '@/components/VoiceLibrary';
import CloneSection from '@/components/CloneSection';
import Languages from '@/components/Languages';
import CTA from '@/components/CTA';
import RevealObserver from '@/components/RevealObserver';

export const metadata = {
  title: 'Voices — Barsha AI',
};

export default function VoicesPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <PageHero />
      <VoiceLibrary />
      <CloneSection />
      <Languages />
      <CTA />
      <Footer />
    </>
  );
}
