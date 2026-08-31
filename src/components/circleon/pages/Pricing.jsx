// Ported from the CircleOn design export's pricing page, fitted to the plans
// actually sold. The design assumed a different business — a free tier, a
// "pick one service" plan, and modular add-ons at $39/$59/$29 — none of which
// exist here. Layout, styling and structure are the export's; the content is
// Atelier / Maison / Sovereign.
//
// Deliberate departures, all for the same reason (never show a price that
// cannot be honoured):
//   * No monthly/annual toggle. startCheckout() sends only the plan name, with
//     no billing interval, so the switch could not affect what Stripe charges.
//     Annual figures are shown, matching plan-select.
//   * No free tier and no per-service chooser — neither is purchasable.
//   * The calculator prices real minutes and overage instead of invented
//     per-service add-ons.
import { Fragment } from 'react';
import { cssToObj } from '../cssToObj';

const CARD = {
  background: '#fff', border: '1px solid #EAE7F2', borderRadius: '24px',
  padding: '34px 30px', display: 'flex', flexDirection: 'column',
  boxShadow: '0 6px 28px rgba(26,23,44,.05)',
};
const CARD_FEATURED = {
  position: 'relative',
  background: 'radial-gradient(130% 100% at 50% 0%,#3A2568 0%,#221641 45%,#130C26 100%)',
  borderRadius: '24px', padding: '34px 30px', display: 'flex',
  flexDirection: 'column', boxShadow: '0 24px 60px rgba(46,24,102,.4)',
};
const TIER = {
  fontSize: '12px', fontWeight: '600', letterSpacing: '.18em',
  textTransform: 'uppercase', marginBottom: '14px',
};
const NAME = {
  fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: '400',
  letterSpacing: '-.01em', marginBottom: '20px',
};
const AMOUNT = {
  fontFamily: "'Cormorant Garamond',serif", fontSize: '54px', lineHeight: '1',
  fontWeight: '400', letterSpacing: '-.02em',
};
const PER = {
  // The export sets 'Inter' here, which this site has never loaded, so the
  // suffix silently fell back to a system face. DM Sans is the export's own
  // body font; loading a fourth family for one "/mo" is not worth it.
  fontFamily: "'DM Sans',sans-serif", fontSize: '15px', fontWeight: '500',
  color: '#716F82', letterSpacing: '0',
};
const BLURB = { fontSize: '14px', lineHeight: '1.55', margin: '16px 0 22px' };
const FEAT_ROW = {
  display: 'flex', alignItems: 'flex-start', gap: '11px', padding: '11px 0',
  fontSize: '14px',
};
const BTN = {
  marginTop: 'auto', display: 'block', textAlign: 'center', padding: '14px',
  borderRadius: '999px', fontWeight: '600', fontSize: '14.5px',
  cursor: 'pointer', transition: '.2s', textDecoration: 'none',
};
const HEAD_CELL = {
  padding: '18px 12px', fontSize: '15px', fontWeight: '600', color: '#1A172C',
  textAlign: 'center', borderBottom: '1px solid #D8D5E2',
  borderLeft: '1px solid #F4F2FB',
};
const CELL = {
  padding: '15px 12px', fontSize: '14px', color: '#423F54', textAlign: 'center',
  borderBottom: '1px solid #F4F2FB', borderLeft: '1px solid #F4F2FB',
};
const SECTION_H2 = {
  fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,32px)',
  letterSpacing: '-.01em', fontWeight: '400', margin: '0 0 28px', color: '#1A172C',
};

function PlanCard({ plan }) {
  const dark = plan.featured;
  return (
    <div data-reveal className={dark ? undefined : 'co-dark-card'} style={dark ? CARD_FEATURED : CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <span style={{ ...TIER, marginBottom: 0, color: dark ? '#B9A7E8' : '#9691A8' }}>
          {plan.tier}
        </span>
        {plan.ribbon ? (
          <span className="co-on-gold" style={{ display: 'inline-block', padding: '4px 11px', borderRadius: '999px', background: '#C49E62', color: '#1A172C', fontSize: '10.5px', fontWeight: '700', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {plan.ribbon}
          </span>
        ) : null}
      </div>
      <div style={{ ...NAME, color: dark ? '#fff' : '#1A172C' }}>
        {'For '}
        <em style={{ fontStyle: 'italic' }}>{plan.audience}</em>
      </div>
      <div style={{ ...AMOUNT, color: dark ? '#fff' : '#1A172C' }}>
        {plan.price}
        {plan.per ? (
          <span style={{ ...PER, color: dark ? '#B9A7E8' : '#716F82' }}>{plan.per}</span>
        ) : null}
      </div>
      <div style={{ fontSize: '12.5px', color: dark ? '#B9A7E8' : '#9691A8', marginTop: '10px' }}>
        {plan.billingNote}
      </div>
      <p style={{ ...BLURB, color: dark ? '#B8B5C6' : '#716F82' }}>{plan.blurb}</p>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '26px' }}>
        {plan.feats.map((ft, i) => (
          <div key={i} style={{ ...FEAT_ROW, borderTop: `1px solid ${dark ? 'rgba(255,255,255,.12)' : '#EFECF6'}`, color: dark ? '#D9D4E8' : '#423F54' }}>
            <span style={{ color: dark ? '#C49E62' : '#7C3AED', fontWeight: '700', lineHeight: '1.4' }}>✓</span>
            {ft}
          </div>
        ))}
      </div>
      <a
        href={plan.href}
        onClick={plan.onClick}
        className={dark ? 'co-pda0398 co-on-gold' : 'co-p859bb1'}
        style={dark
          ? { ...BTN, background: '#C49E62', color: '#1A172C' }
          : { ...BTN, border: '1px solid #1A172C', color: '#1A172C' }}
      >
        {plan.cta}
      </a>
    </div>
  );
}

export default function Pricing({ v }) {
  return (
    <>
      <div style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        <div data-reveal style={{"textAlign": "center", "maxWidth": "620px", "margin": "0 auto 48px"}}>
          <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginBottom": "16px"}}>
            <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
              Pricing
            </span>
          </div>
          <h1 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(32px,4vw,46px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 14px", "color": "#1A172C"}}>
            Simple pricing that scales with you
          </h1>
          <p style={{"fontSize": "17px", "color": "#423F54", "margin": "0"}}>
            Every plan is billed annually and includes voice minutes. Pay for extra minutes only when you use them.
          </p>
        </div>

        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(290px,1fr))", "gap": "22px", "alignItems": "stretch"}}>
          {(v.plans || []).map((p) => <PlanCard key={p.tier} plan={p} />)}
        </div>

        {/* Calculator. The export priced invented per-service add-ons; this
            works from the real included-minutes and overage rates. */}
        <div className="co-dark-card" data-reveal style={{"marginTop": "clamp(56px,7vw,88px)", "background": "#FAF9FF", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "clamp(32px,5vw,52px)", "display": "flex", "flexWrap": "wrap", "gap": "clamp(32px,5vw,56px)"}}>
          <div style={{"flex": "1 1 340px", "minWidth": "280px"}}>
            <h2 style={SECTION_H2}>Estimate your monthly cost</h2>
            <div style={{"fontSize": "12.5px", "fontWeight": "500", "color": "#716F82", "textTransform": "uppercase", "letterSpacing": ".08em", "marginBottom": "14px"}}>
              Voice minutes per month
            </div>
            <div style={{"display": "flex", "alignItems": "center", "gap": "16px"}}>
              <input className="co-range" type="range" min="0" max="15000" step="250" value={v.calcMinutes} onChange={v.setCalcMinutes} style={{"flex": "1", "height": "6px"}} />
              <span style={{"fontSize": "14px", "fontWeight": "500", "color": "#1A172C", "width": "92px", "textAlign": "right", "flexShrink": "0"}}>
                {v.calcMinutesLabel}
              </span>
            </div>
            <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "12.5px", "color": "#9E9CAD", "marginTop": "4px"}}>
              <span>0</span>
              <span>15,000</span>
            </div>
            <p style={{"fontSize": "13.5px", "lineHeight": "1.6", "color": "#716F82", "margin": "22px 0 0"}}>
              Atelier includes 2,000 minutes, then {v.atelierOverage} per minute. Maison includes 10,000, then {v.maisonOverage}.
            </p>
          </div>
          <div style={{"flex": "1 1 300px", "minWidth": "260px", "maxWidth": "360px"}}>
            <div style={{"position": "relative", "overflow": "hidden", "borderRadius": "16px", "background": "#1A172C", "padding": "28px"}}>
              <div style={{"fontSize": "12px", "fontWeight": "500", "color": "#C49E62", "textTransform": "uppercase", "letterSpacing": ".08em", "marginBottom": "8px"}}>
                Your estimated plan
              </div>
              <div style={{"fontSize": "42px", "fontWeight": "600", "color": "#fff", "letterSpacing": "-.01em", "marginBottom": "2px"}}>
                {v.calcTotal}
                <span style={{"fontSize": "15px", "fontWeight": "600", "color": "#716F82"}}>{' / mo'}</span>
              </div>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "10px", "margin": "22px 0", "fontSize": "14px", "color": "#B8B5C6"}}>
                <div>{v.calcPlanLabel}</div>
                <div>{v.calcMinutesNote}</div>
                <div>Billed annually</div>
              </div>
              <a onClick={v.gotoSignup} style={{"display": "block", "textAlign": "center", "padding": "15px", "borderRadius": "10px", "background": "#C49E62", "color": "#1A172C", "fontWeight": "600", "fontSize": "15px", "cursor": "pointer", "transition": ".2s"}} className="co-pda0398 co-on-gold">
                Talk to us about this
              </a>
            </div>
          </div>
        </div>

        {/* The dark theme paints this card a solid panel, which squared off
            against the rounded table inside it. Radius is harmless in light
            mode, where the card has no background of its own. */}
        <div className="co-dark-card" data-reveal style={{"marginTop": "clamp(56px,7vw,88px)", "borderRadius": "20px", "padding": "clamp(20px,3vw,28px)"}}>
          <h2 style={{ ...SECTION_H2, textAlign: 'center' }}>Compare plans</h2>
          <div style={{"overflowX": "auto", "border": "1px solid #D8D5E2", "borderRadius": "16px", "background": "#fff"}}>
            <div style={{"display": "grid", "gridTemplateColumns": "1.4fr 1fr 1fr 1fr", "minWidth": "560px"}}>
              <div style={{"padding": "18px 20px", "fontSize": "12.5px", "fontWeight": "500", "color": "#716F82", "textTransform": "uppercase", "letterSpacing": ".06em", "borderBottom": "1px solid #D8D5E2"}}>
                Feature
              </div>
              <div style={HEAD_CELL}>Atelier</div>
              <div style={{ ...HEAD_CELL, color: '#fff', background: '#1A172C' }}>Maison</div>
              <div style={HEAD_CELL}>Sovereign</div>
              {(v.comparisonRows || []).map((row, $index) => (
                <Fragment key={$index}>
                  <div style={{"padding": "15px 20px", "fontSize": "14px", "color": "#423F54", "borderBottom": "1px solid #F4F2FB"}}>
                    {row.label}
                  </div>
                  <div style={CELL}>{row.atelier}</div>
                  <div style={{ ...CELL, color: '#1A172C', fontWeight: '500', background: '#FAF9FF' }}>{row.maison}</div>
                  <div style={CELL}>{row.sovereign}</div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
