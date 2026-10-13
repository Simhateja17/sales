import PricingPlans from '@/components/pricing/PricingPlans';
export default function Pricing() {
  return <main style={{maxWidth:1120,margin:'0 auto',padding:'60px 24px 80px'}}>
    <header style={{textAlign:'center',maxWidth:760,margin:'0 auto 32px'}}><p>CircleOn pricing</p><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:400,fontSize:'clamp(34px,5vw,54px)',margin:'16px 0'}}>Monthly plans for lead outreach and AI calls</h1><p>Choose Follow Up, Voice Agent, or both. All prices in SGD, excl. GST.</p></header>
    <PricingPlans/>
  </main>;
}
