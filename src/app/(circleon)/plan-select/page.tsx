'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PricingPlans, { type Plan, type PlanNotice } from '@/components/pricing/PricingPlans';
import SignOutButton from '@/components/circleon/SignOutButton';
import { ApiError, apiFetch, getWorkspace, startCheckout, type MonthlyPlanId, type WorkspaceBilling } from '@/lib/api';

function ApprovalRequest({ plan }: { plan: Plan }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  async function request() {
    setState('sending');
    try {
      await apiFetch('/api/support', { method: 'POST', body: JSON.stringify({ subject: 'Trial approval request', body: `Please approve a free trial for this workspace. I signed up with a personal email address and would like to start ${plan.name}.` }) });
      setState('sent');
    } catch { setState('failed'); }
  }
  if (state === 'sent') return <p>Request sent. We reply within one business day, here and by email.</p>;
  return <>
    <button type="button" onClick={request} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Request trial approval'}</button>
    {state === 'failed' && <p>Could not send the request. Try again, or write to us from the support page.</p>}
  </>;
}

export default function PlanSelectPage() {
  const router=useRouter(); const [startPaid,setStartPaid]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState<PlanNotice|null>(null); const [selecting,setSelecting]=useState<string|null>(null); const [billing,setBilling]=useState<WorkspaceBilling|null>(null);
  useEffect(()=>{
    let stopped=false, timer:ReturnType<typeof setTimeout>; let attempts=0;
    const checkout=new URLSearchParams(window.location.search).get('checkout');
    if(checkout==='cancelled') setError('Checkout was cancelled. Your trial has not started.');
    async function check() { try { const state=await getWorkspace(); if(stopped)return; setBilling(state.billing); if(state.subscriptionActive) {router.replace(state.workspace.onboarding_completed?'/dashboard':'/onboarding');return;} if(checkout==='success' && attempts++<15) timer=setTimeout(check,2000); else if(checkout==='success') setError('Your checkout is still being confirmed. Refresh in a moment.'); } catch(e) {if(stopped)return; if(e instanceof ApiError&&e.status===401){router.replace('/login?returnTo=%2Fplan-select');return;} setError(e instanceof Error?e.message:'Could not load account.');} }
    check(); return()=>{stopped=true;clearTimeout(timer);};
  },[router]);
  async function select(plan:Plan) {
    setSelecting(plan.id);setNotice(null);setError('');
    try {const {url}=await startCheckout(plan.id as MonthlyPlanId,startPaid);window.location.assign(url);}
    catch(e){
      const message=e instanceof Error?e.message:'Could not start checkout.';
      // Personal-email trials need a staff approval, so offer to request one right there.
      setNotice({planId:plan.id,message,action:/company email/i.test(message)?<ApprovalRequest plan={plan}/>:undefined});
      setSelecting(null);
    }
  }
  return <>
    <header className="ps-header"><div className="ps-logo"><span className="sb-mark" aria-hidden="true"><i /></span>CircleOn</div><SignOutButton /></header>
    <main className="ps-main"><div className="cp">
      <h1 className="ps-title">Choose your plan</h1>
      <p className="ps-sub">Start with a seven-day free trial. A card is required, and you can cancel before it ends to pay nothing.</p>
      {error&&<p role="alert" className="cp-error">{error}</p>}
      {billing?.stripe_subscription_id&&<p><a href="/billing">Manage your existing subscription</a></p>}
    </div>
    <PricingPlans onSelect={select} busy={selecting!==null} selectingId={selecting} notice={notice} comparison={false} approvedVoice={Boolean(billing?.voice_approved&&billing?.voice_ready)}/>
    <div className="cp ps-foot">
      <p><a href="/pricing#compare">Compare every feature</a> · <a href="/pricing">Pricing FAQ</a></p>
      <label className="ps-paid"><input type="checkbox" checked={startPaid} onChange={e=>setStartPaid(e.target.checked)}/> My company has already used its trial. Start a paid monthly subscription now, including any applicable setup fee.</label>
    </div></main>
  </>;
}
