'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'How is a "minute" counted?', a: 'Connected, two-way audio. Ringing, voicemail detection, and busy signals are not billed. Calls under 8 seconds (wrong-number, immediate hangup) are also not billed.' },
  { q: 'What happens if we exceed our included minutes?', a: 'You stay live — we never throttle. Overage is charged at the rate listed in your plan ($0.42 / min on Atelier, $0.32 / min on Maison), billed at the end of the month. We email you at 80% and 100% so there are no surprises.' },
  { q: 'Can we bring our own Twilio account?', a: 'Yes. Maison and Sovereign customers can bring their own SIP trunks. We charge a 30% discount on the per-minute rate when you do — you pay your carrier directly for the audio.' },
  { q: 'Do you offer a free trial?', a: "Every plan includes a 30-day pilot with unmetered minutes — placed on your real numbers, against your real lists. If Barsha doesn't book more meetings than your top SDR by day 21, we refund the setup fee." },
  { q: 'How does enterprise pricing work?', a: 'Sovereign is volume-based and starts at 100,000 minutes per quarter. We work backwards from your pipeline target — you pay a percentage of attributable revenue, capped. Most customers pay between $14k and $48k per month.' },
  { q: 'Is voice cloning safe and consent-locked?', a: 'Every cloned voice requires a signed consent form from the person being cloned. We watermark the audio inaudibly so it can be identified as synthetic. Consent can be revoked in one click — the voice is purged within 24 hours.' },
  { q: 'What about regulated industries?', a: 'Sovereign supports HIPAA-covered, PCI-DSS, and FINRA-supervised workloads with dedicated single-tenant infrastructure. Compliance documentation, BAAs, and DPAs are available before contract.' },
  { q: 'Can we cancel?', a: "Monthly plans cancel at the end of the current month, no questions asked. Annual plans can be canceled with 30 days' notice and we refund unused months pro-rata. We don't hold your data hostage — full export is one click." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Questions, answered</span>
          <h2 className="section-title">Things we&apos;d <em>also</em> want to know.</h2>
        </div>
        <div className="faq reveal" style={{ maxWidth: 820 }}>
          {FAQS.map((f, i) => (
            <div key={i} className={`q-item ${open === i ? 'open' : ''}`}>
              <button className="q-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="icn">+</span>
              </button>
              <div className="q-a">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
