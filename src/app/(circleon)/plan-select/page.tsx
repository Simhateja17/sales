'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PricingPlans, { type Plan } from '@/components/pricing/PricingPlans';
import { getWorkspace, startCheckout, type MonthlyPlanId, type WorkspaceBilling } from '@/lib/api';
export default function PlanSelectPage() {
  const router=useRouter(); const [startPaid,setStartPaid]=useState(false); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [billing,setBilling]=useState<WorkspaceBilling|null>(null);
  useEffect(()=>{
    let stopped=false, timer:ReturnType<typeof setTimeout>; let attempts=0;
    const checkout=new URLSearchParams(window.location.search).get('checkout');
    if(checkout==='cancelled') setError('Checkout was cancelled. Your trial has not started.');
    async function check() { try { const state=await getWorkspace(); if(stopped)return; setBilling(state.billing); if(state.subscriptionActive) {router.replace(state.workspace.onboarding_completed?'/dashboard':'/onboarding');return;} if(checkout==='success' && attempts++<15) timer=setTimeout(check,2000); else if(checkout==='success') setError('Your checkout is still being confirmed. Refresh in a moment.'); } catch(e) {if(!stopped)setError(e instanceof Error?e.message:'Could not load account.');} }
    check(); return()=>{stopped=true;clearTimeout(timer);};
  },[router]);
  async function select(plan:Plan) { setBusy(true);setError('');try {const {url}=await startCheckout(plan.id as MonthlyPlanId,startPaid);window.location.assign(url);}catch(e){setError(e instanceof Error?e.message:'Could not start checkout.');setBusy(false);} }
  return <main style={{maxWidth:1120,margin:'0 auto',padding:'48px 24px'}}><div className="cp"><label><input type="checkbox" style={{width:'auto'}} checked={startPaid} onChange={e=>setStartPaid(e.target.checked)}/> If my company has already used its trial, I agree to start a paid monthly subscription immediately, including any applicable setup fee.</label><a href="/pricing">← Public pricing</a><h1>Choose your monthly plan</h1><p>A card is required. Your seven-day trial starts at checkout. Connect your own verified mailbox before sending.</p>{error&&<p role="alert" className="cp-error">{error}</p>}{billing?.stripe_subscription_id&&<p><a href="/dashboard?page=billing">Manage your existing subscription</a></p>}</div><PricingPlans onSelect={select} busy={busy} approvedVoice={Boolean(billing?.voice_approved&&billing?.voice_ready)}/></main>;
}
