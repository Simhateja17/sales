import PricingPlans, { Gst } from '@/components/pricing/PricingPlans';
export default function Pricing() {
  return <main className="cp-page">
    <header className="cp-hero"><h1>Simple pricing. <em>One new client pays for CircleOn for a year.</em></h1><p>Start with a 7-day free trial. Monthly plans, cancel anytime. All prices in SGD, <Gst lower />.</p></header>
    <PricingPlans/>
  </main>;
}
