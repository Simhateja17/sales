import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import PageHero from '@/components/PageHero';
import CTA from '@/components/CTA';
import Timeline from '@/components/how-it-works/Timeline';
import Outcomes from '@/components/how-it-works/Outcomes';
import QuoteBlock from '@/components/how-it-works/QuoteBlock';

export default function HowItWorksPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <PageHero
        kicker="How it works"
        title={<>From signed contract to <em>booked meeting,</em> in a Tuesday afternoon.</>}
        lede="No prompt engineering team. No flow-chart tool. No six-week onboarding. Eight steps, three hours of your time, and a real agent on the phone before sunset."
      />
      <Timeline />
      <Outcomes />
      <QuoteBlock />
      <CTA
        title={<>Live by <em>Tuesday afternoon.</em></>}
        body="Pick a 30-minute slot. Bring a phone number. We'll have your first agent placing real calls before the meeting ends."
        cta="Schedule the Tuesday afternoon"
      />
      <Footer />
    </>
  );
}
