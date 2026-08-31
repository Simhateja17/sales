// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';
import { cssToObj } from '../cssToObj';

export default function Product({ v }) {
  return (
    <>
      <div>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(32px,4vw,56px)", "position": "relative"}}>
          <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "display": "inline-flex", "alignItems": "center", "gap": "6px", "marginBottom": "30px", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
            ← Back to home
          </a>
          {' '}
          <div style={{"maxWidth": "720px", "position": "relative", "zIndex": "1"}}>
            <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "marginBottom": "16px"}}>
              <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
                {v.product.eyebrow}
              </span>
            </div>
            <h1 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(36px,4.8vw,58px)", "lineHeight": "1.08", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 22px", "color": "#1A172C"}}>
              {v.product.title}
            </h1>
            <p style={{"fontSize": "clamp(17px,1.6vw,19px)", "lineHeight": "1.7", "color": "#423F54", "margin": "0 0 36px"}}>
              {v.product.subtitle}
            </p>
            <div style={{"display": "flex", "flexWrap": "wrap", "gap": "22px", "alignItems": "center"}}>
              {v.isLeadPage ? (
                <>
                <a onClick={v.openFreeLeads} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "padding": "16px 30px", "borderRadius": "10px", "fontWeight": "600", "fontSize": "15px", "letterSpacing": ".02em", "color": "#fff", "background": "linear-gradient(180deg,#945FF9,#7447C8 50%,#471E86)", "boxShadow": "0 8px 24px -10px #7447C8", "cursor": "pointer", "transition": "transform .2s,box-shadow .2s"}} className="co-p275fc0">
                  Get 3 Free Leads →
                </a>
                </>
              ) : null}
              {' '}
              <a onClick={v.gotoWaitlist} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "padding": "16px 30px", "borderRadius": "10px", "fontWeight": "600", "fontSize": "15px", "letterSpacing": ".02em", "color": "#FAF9FF", "background": "#1A172C", "cursor": "pointer", "transition": "background .25s,transform .2s"}} className="co-pa7e2f4">
                Join the Waitlist →
              </a>
              {' '}
              <a onClick={v.gotoHome} style={{"display": "inline-flex", "alignItems": "center", "padding": "16px 4px", "fontWeight": "600", "fontSize": "15px", "color": "#1A172C", "cursor": "pointer", "borderBottom": "1px solid #1A172C", "transition": ".2s"}} className="co-p3c9245">
                Explore platform
              </a>
            </div>
          </div>
          <div style={{"position": "absolute", "top": "96px", "right": "calc(-40px - max(0px, (100vw - 1200px) / 2))", "width": "560px", "height": "560px", "overflow": "hidden", "pointerEvents": "none", "zIndex": "0"}}>
            <div className="co-orbit-arc" style={{"position": "absolute", "left": "0px", "top": "0px", "width": "1120px", "height": "1120px", "borderRadius": "50%", "border": "105px solid #ECE9F6", "boxSizing": "border-box"}} />
            <div style={{"position": "absolute", "left": "560px", "top": "560px", "width": "0", "height": "0"}}>
              <div style={{"position": "absolute", "width": "0", "height": "0", "animation": "orbitSpin 10s linear -6s infinite"}}>
                <div style={{"position": "absolute", "top": "-40px", "left": "-40px", "width": "96px", "height": "96px", "borderRadius": "50%", "filter": "blur(24px)", "opacity": ".5", "background": "radial-gradient(circle,#1A172C 0%,rgba(21,14,42,.4) 45%,transparent 75%)"}} />
                <div style={{"position": "absolute", "top": "-28px", "left": "-28px", "width": "56px", "height": "56px", "animation": "orbitSpinRev 10s linear -6s infinite"}}>
                  <span style={{"width": "56px", "height": "56px", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "background": "#1A172C", "boxShadow": "0 16px 32px -12px rgba(21,14,42,.55)"}}>
                    {v.isLeadPage ? (
                      <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                      </svg>
                      </>
                    ) : null}
                    {v.isVoicePage ? (
                      <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5.5-4-7-7l2-2-2-4z" />
                        <path d="M15 4a5 5 0 0 1 5 5M15 8a1.5 1.5 0 0 1 1.5 1.5" />
                      </svg>
                      </>
                    ) : null}
                    {v.isFollowPage ? (
                      <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2 11 13" />
                        <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                      </svg>
                      </>
                    ) : null}
                  </span>
                </div>
              </div>
              <div style={{"position": "absolute", "width": "0", "height": "0", "animation": "orbitSpin 10s linear -8s infinite"}}>
                <div style={{"position": "absolute", "top": "-40px", "left": "-40px", "width": "96px", "height": "96px", "borderRadius": "50%", "filter": "blur(20px)", "opacity": ".45", "background": "radial-gradient(circle,#1A172C 0%,rgba(21,14,42,.35) 45%,transparent 75%)"}} />
                <div style={{"position": "absolute", "top": "-28px", "left": "-28px", "width": "56px", "height": "56px", "animation": "orbitSpinRev 10s linear -8s infinite"}}>
                  <span style={{"width": "56px", "height": "56px", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "background": "#1A172C", "boxShadow": "0 14px 28px -10px rgba(21,14,42,.5)"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 18 6 10M12 18 12 6M18 18 18 13" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{"position": "absolute", "width": "0", "height": "0", "animation": "orbitSpin 10s linear -4s infinite"}}>
                <div style={{"position": "absolute", "top": "-40px", "left": "-40px", "width": "96px", "height": "96px", "borderRadius": "50%", "filter": "blur(20px)", "opacity": ".45", "background": "radial-gradient(circle,#1A172C 0%,rgba(21,14,42,.35) 45%,transparent 75%)"}} />
                <div style={{"position": "absolute", "top": "-28px", "left": "-28px", "width": "56px", "height": "56px", "animation": "orbitSpinRev 10s linear -4s infinite"}}>
                  <span style={{"width": "56px", "height": "56px", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "background": "#1A172C", "boxShadow": "0 12px 24px -10px rgba(21,14,42,.5)"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v13H8l-4 4z" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{"position": "absolute", "width": "0", "height": "0", "animation": "orbitSpin 10s linear -2s infinite"}}>
                <div style={{"position": "absolute", "top": "-40px", "left": "-40px", "width": "96px", "height": "96px", "borderRadius": "50%", "filter": "blur(22px)", "opacity": ".48", "background": "radial-gradient(circle,#1A172C 0%,rgba(21,14,42,.38) 45%,transparent 75%)"}} />
                <div style={{"position": "absolute", "top": "-28px", "left": "-28px", "width": "56px", "height": "56px", "animation": "orbitSpinRev 10s linear -2s infinite"}}>
                  <span style={{"width": "56px", "height": "56px", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "background": "#1A172C", "boxShadow": "0 13px 26px -10px rgba(21,14,42,.52)"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5h16v16H4z" />
                      <path d="M4 10h16" />
                      <path d="M8 3v4" />
                      <path d="M16 3v4" />
                    </svg>
                  </span>
                </div>
              </div>
              <div style={{"position": "absolute", "width": "0", "height": "0", "animation": "orbitSpin 10s linear 0s infinite"}}>
                <div style={{"position": "absolute", "top": "-40px", "left": "-40px", "width": "96px", "height": "96px", "borderRadius": "50%", "filter": "blur(18px)", "opacity": ".42", "background": "radial-gradient(circle,#1A172C 0%,rgba(21,14,42,.32) 45%,transparent 75%)"}} />
                <div style={{"position": "absolute", "top": "-28px", "left": "-28px", "width": "56px", "height": "56px", "animation": "orbitSpinRev 10s linear 0s infinite"}}>
                  <span style={{"width": "56px", "height": "56px", "borderRadius": "50%", "display": "flex", "alignItems": "center", "justifyContent": "center", "background": "#1A172C", "boxShadow": "0 11px 22px -9px rgba(21,14,42,.48)"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {v.isLeadPage ? (
          <>
          {v.freeLeadsOpen ? (
            <>
            <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "0 24px clamp(24px,3vw,40px)"}}>
              <div data-reveal style={{"position": "relative", "overflow": "hidden", "background": "radial-gradient(85% 65% at 100% 0%, oklch(0.42 0.17 295 / 0.60), transparent 62%),radial-gradient(70% 60% at 0% 100%, oklch(0.5 0.09 82 / 0.14), transparent 60%),linear-gradient(155deg, oklch(0.21 0.05 292), oklch(0.155 0.045 292))", "border": "1px solid oklch(0.42 0.06 295 / 0.35)", "boxShadow": "0 40px 90px -40px oklch(0.36 0.16 295 / 0.55)", "padding": "clamp(36px,5vw,56px)", "borderRadius": "24px"}}>
                <a onClick={v.closeFreeLeads} aria-label="Close" style={{"position": "absolute", "top": "20px", "right": "24px", "width": "32px", "height": "32px", "borderRadius": "50%", "background": "rgba(255,255,255,.1)", "color": "#fff", "display": "flex", "alignItems": "center", "justifyContent": "center", "cursor": "pointer", "fontSize": "15px", "transition": ".2s", "zIndex": "1"}} className="co-p6a633a">
                  ✕
                </a>
                {' '}
                {v.freeLeadsNotSubmitted ? (
                  <>
                  <div style={{"maxWidth": "560px", "margin": "0 auto", "position": "relative"}}>
                    <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "marginBottom": "16px"}}>
                      <span style={{"fontSize": "12px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
                        Free Preview
                      </span>
                    </div>
                    <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(24px,3vw,34px)", "letterSpacing": "-.01em", "fontWeight": "400", "color": "#fff", "margin": "0 0 12px"}}>
                      Tell us about your business, get 3 free leads
                    </h2>
                    <p style={{"fontSize": "15.5px", "color": "#9E9CAD", "lineHeight": "1.6", "margin": "0 0 34px"}}>
                      Answer five quick questions and we'll email you up to 3 enriched prospects matched to your audience. No credit card required.
                    </p>
                    <form onSubmit={v.submitFreeLeads} className="co-free-leads-form" style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "22px 20px", "textAlign": "left"}}>
                      <input value={v.freeLeadsForm.company} onChange={v.onFreeLeadCompany} aria-label="Company name" placeholder="Company name" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                      {' '}
                      <input value={v.freeLeadsForm.industry} onChange={v.onFreeLeadIndustry} aria-label="Which industry should we target?" placeholder="Which industry should we target?" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                      {' '}
                      <input value={v.freeLeadsForm.product} onChange={v.onFreeLeadProduct} aria-label="What do you sell?" placeholder="What do you sell?" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none", "gridColumn": "1/-1"}} />
                      {' '}
                      <input value={v.freeLeadsForm.titles} onChange={v.onFreeLeadTitles} aria-label="Who usually buys it?" placeholder="Who usually buys it? (e.g. VP Sales, Founder)" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none", "gridColumn": "1/-1"}} />
                      {' '}
                      <input value={v.freeLeadsForm.region} onChange={v.onFreeLeadRegion} aria-label="Where are those prospects located?" placeholder="Where are those prospects located?" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                      {' '}
                      <input value={v.freeLeadsForm.companySize} onChange={v.onFreeLeadCompanySize} aria-label="What company size is a good fit?" placeholder="What company size is a good fit?" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                      {' '}
                      <input value={v.freeLeadsForm.email} onChange={v.onFreeLeadEmail} aria-label="Work email" type="email" placeholder="Work email" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none", "gridColumn": "1/-1"}} />
                      {' '}
                      {v.freeLeadsError ? <div role="alert" style={{"gridColumn": "1/-1", "fontSize": "13px", "lineHeight": "20px", "color": "#F3B6A5"}}>{v.freeLeadsError}</div> : null}
                      <button type="submit" disabled={v.freeLeadsSubmitting} style={{"gridColumn": "1/-1", "marginTop": "14px", "width": "100%", "padding": "16px", "border": "1px solid #C49E62", "borderRadius": "10px", "fontWeight": "600", "fontSize": "15px", "letterSpacing": ".02em", "color": "#471E86", "background": "#C49E62", "cursor": v.freeLeadsSubmitting ? "wait" : "pointer", "opacity": v.freeLeadsSubmitting ? ".7" : "1", "transition": "background .2s,color .2s"}} className="co-pc6e9be co-on-gold">
                        {v.freeLeadsSubmitting ? 'Preparing your preview…' : 'Show My 3 Free Leads →'}
                      </button>
                      {' '}
                      <div style={{"gridColumn": "1/-1", "textAlign": "center", "fontSize": "13px", "color": "#716F82"}}>
                        No spam. No outreach to prospects.
                      </div>
                    </form>
                  </div>
                  </>
                ) : null}
                {v.freeLeadsSubmitted ? (
                  <>
                  <div style={{"maxWidth": "640px", "margin": "0 auto", "textAlign": "center", "position": "relative"}}>
                    <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "32px", "color": "#C49E62", "marginBottom": "10px"}}>
                      ✓
                    </div>
                    {/* The export listed three hardcoded people here — identical
                        for every visitor — despite the form promising prospects
                        matched to your ICP. The layout is kept; the claim now
                        matches what actually happens (the request is emailed). */}
                    <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(22px,2.8vw,30px)", "letterSpacing": "-.01em", "fontWeight": "400", "color": "#fff", "margin": "0 0 8px"}}>
                      Your lead preview is queued
                    </h2>
                    <p style={{"fontSize": "14.5px", "color": "#9E9CAD", "margin": "0 0 30px"}}>
                      {v.freeLeadsHeadline}{". We'll email up to 3 enriched matches to "}{v.freeLeadsEmail || 'you'}{" once the research is ready."}
                    </p>
                    <div style={{"display": "flex", "flexWrap": "wrap", "gap": "16px", "justifyContent": "center", "marginTop": "34px"}}>
                      <a onClick={v.gotoWaitlist} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "padding": "15px 28px", "borderRadius": "10px", "fontWeight": "600", "fontSize": "14.5px", "letterSpacing": ".02em", "color": "#471E86", "background": "#C49E62", "cursor": "pointer", "transition": ".2s"}} className="co-pda0398 co-on-gold">
                        Get unlimited leads →
                      </a>
                      {' '}
                      <a onClick={v.resetFreeLeads} style={{"display": "inline-flex", "alignItems": "center", "padding": "15px 4px", "fontWeight": "600", "fontSize": "14.5px", "color": "#fff", "cursor": "pointer", "borderBottom": "1px solid rgba(255,255,255,.4)", "transition": ".2s"}} className="co-p3c9245">
                        Try another business
                      </a>
                    </div>
                  </div>
                  </>
                ) : null}
              </div>
            </section>
            </>
          ) : null}
          </>
        ) : null}
        <section style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(24px,3vw,40px) 24px clamp(40px,5vw,64px)", "position": "relative"}}>
          <div data-reveal style={{"display": "grid", "gridTemplateColumns": "0.82fr 1fr", "gap": "clamp(32px,4vw,60px)", "alignItems": "center", "position": "relative", "zIndex": "1"}}>
            <div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "marginBottom": "20px"}}>
                <span style={{"fontSize": "12px", "fontWeight": "600", "letterSpacing": ".18em", "textTransform": "uppercase", "color": "#C49E62"}}>
                  In Action
                </span>
              </div>
              <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(26px,3vw,38px)", "lineHeight": "1.14", "letterSpacing": "-.015em", "fontWeight": "400", "margin": "0 0 16px", "color": "#1A172C", "textWrap": "balance"}}>
                What it looks like on your side
              </h2>
              <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.7", "margin": "0", "maxWidth": "340px"}}>
                {v.product.eyebrow}{" runs quietly in the background, every step logged, nothing for you to babysit."}
              </p>
            </div>
            <div className="co-dark-card" style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "18px", "boxShadow": "0 30px 60px -34px rgba(21,14,42,.35)", "overflow": "hidden", "animation": "cardFade 9000ms ease-in-out infinite"}}>
              <div style={cssToObj(`display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid ${v.mockBorder ?? ""};background:${v.mockSoftBg ?? ""}`)}>
                <span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "#EBB2A3"}} />
                {' '}
                <span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "#EAD08A"}} />
                {' '}
                <span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "#A9CBA6"}} />
                {' '}
                <span style={cssToObj(`font-size:12.5px;font-weight:600;color:${v.mockBody ?? ""};margin-left:8px`)}>
                  {v.product.eyebrow}
                </span>
                {' '}
                <span style={{"flex": "1"}} />
                {' '}
                <span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "11px", "fontWeight": "600", "color": "#7A9C77", "letterSpacing": ".03em"}}>
                  <span style={{"width": "6px", "height": "6px", "borderRadius": "50%", "background": "#7A9C77", "animation": "pulseDot 1.6s ease-in-out infinite"}} />
                  {" LIVE "}
                </span>
              </div>
              {v.isLeadPage ? (
                <>
                <div style={{"padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>
                  {(v.leadSamples || []).map((l, $index) => (
                    <Fragment key={$index}>
                    <div style={cssToObj(`display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;background:${v.mockSoftBg ?? ""};animation:popInX 9000ms ease-out infinite;animation-delay:${l.delayMs ?? ""}ms`)}>
                      <div style={{"width": "36px", "height": "36px", "borderRadius": "50%", "background": "linear-gradient(155deg,#945FF9,#7447C8)", "color": "#fff", "fontSize": "13px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flexShrink": "0"}}>
                        {l.initials}
                      </div>
                      <div style={{"flex": "1", "minWidth": "0"}}>
                        <div style={cssToObj(`font-weight:700;font-size:14.5px;color:${v.mockHeading ?? ""}`)}>
                          {l.name}
                        </div>
                        <div style={cssToObj(`font-size:12.5px;color:${v.mockMuted ?? ""};margin-top:2px`)}>
                          {l.company}
                        </div>
                      </div>
                      <div className="co-chip" style={cssToObj(`padding:5px 11px;border-radius:100px;font-size:11px;font-weight:700;flex-shrink:0;${l.pillStyle ?? ""}`)}>
                        {l.score}{" · "}{l.tag}
                      </div>
                    </div>
                    </Fragment>
                  ))}
                  <div style={{"marginTop": "6px", "borderRadius": "12px", "background": "linear-gradient(135deg,#1A172C,#3A2E5C)", "padding": "16px 18px", "display": "flex", "alignItems": "center", "gap": "14px", "animation": "popIn 9000ms ease-out infinite", "animationDelay": "4000ms"}}>
                    <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "24px", "fontWeight": "600", "color": "#C49E62", "flexShrink": "0"}}>
                      128
                    </div>
                    <div style={{"fontSize": "12.5px", "color": "#D8D5E2", "lineHeight": "1.45"}}>
                      new qualified leads found today, avg. score 87
                    </div>
                  </div>
                </div>
                </>
              ) : null}
              {v.isVoicePage ? (
                <>
                <div style={{"padding": "22px", "display": "flex", "flexDirection": "column", "gap": "16px"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "14px"}}>
                    <div style={{"position": "relative", "width": "46px", "height": "46px", "flexShrink": "0", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>
                      <div style={{"position": "absolute", "inset": "0", "borderRadius": "50%", "border": "2px solid #7447C8", "animation": "ringPulse 9000ms ease-out infinite"}} />
                      <div style={{"width": "46px", "height": "46px", "borderRadius": "50%", "background": "linear-gradient(155deg,#945FF9,#7447C8)", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5.5-4-7-7l2-2-2-4z" />
                        </svg>
                      </div>
                    </div>
                    <div style={{"position": "relative", "flex": "1", "height": "32px"}}>
                      <div style={{"position": "absolute", "inset": "0", "display": "flex", "flexDirection": "column", "justifyContent": "center"}}>
                        <div style={cssToObj(`font-weight:700;font-size:14.5px;color:${v.mockHeading ?? ""}`)}>
                          Connected
                        </div>
                        <div style={{"fontSize": "12px", "color": "#7A9C77"}}>
                          0:00
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "10px"}}>
                    <div style={cssToObj(`align-self:flex-start;max-width:78%;background:${v.mockSoftBg ?? ""};border-radius:14px 14px 14px 4px;padding:11px 15px;font-size:13px;color:${v.mockBody ?? ""};line-height:1.5`)}>
                      "Hi, I saw your ad about automating outreach…"
                    </div>
                    <div style={{"alignSelf": "flex-end", "maxWidth": "78%", "background": "#1A172C", "color": "#fff", "borderRadius": "14px 14px 4px 14px", "padding": "11px 15px", "fontSize": "13px", "lineHeight": "1.5"}}>
                      Absolutely, I can check available times right now.
                    </div>
                  </div>
                  <div style={{"borderRadius": "12px", "background": "linear-gradient(135deg,#1A172C,#3A2E5C)", "padding": "16px 18px", "display": "flex", "alignItems": "center", "gap": "14px"}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49E62" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{"flexShrink": "0"}}>
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v3M16 3v3" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                    {' '}
                    <div style={{"fontSize": "13px", "color": "#fff", "lineHeight": "1.45"}}>
                      <b style={{"color": "#C49E62"}}>
                        Meeting booked
                      </b>
                      {" · Thu 2:00 PM"}
                    </div>
                  </div>
                </div>
                </>
              ) : null}
              {v.isFollowPage ? (
                <>
                <div style={{"padding": "22px", "display": "flex", "flexDirection": "column", "gap": "22px"}}>
                  <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "flex-start", "position": "relative"}}>
                    <div style={cssToObj(`position:absolute;top:20px;left:34px;right:34px;height:0;border-top:2px dotted ${v.mockBorder ?? ""};z-index:0`)} />
                    <div style={{"position": "relative", "zIndex": "1", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px", "flex": "1", "opacity": "0", "animation": "popIn 9000ms ease-out infinite", "animationDelay": "700ms"}}>
                      <div style={{"width": "40px", "height": "40px", "borderRadius": "50%", "background": "#7447C8", "display": "flex", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 8px 16px -8px #7447C8"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16v16H4z" />
                          <path d="M4 4l8 8 8-8" />
                        </svg>
                      </div>
                      <div style={cssToObj(`font-size:11.5px;font-weight:700;color:${v.mockHeading ?? ""};text-align:center`)}>
                        Email sent
                      </div>
                      <div style={cssToObj(`font-size:10.5px;color:${v.mockMuted ?? ""}`)}>
                        Day 0
                      </div>
                    </div>
                    <div style={{"position": "relative", "zIndex": "1", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px", "flex": "1", "opacity": "0", "animation": "popIn 9000ms ease-out infinite", "animationDelay": "2000ms"}}>
                      <div style={{"width": "40px", "height": "40px", "borderRadius": "50%", "background": "#C49E62", "display": "flex", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 8px 16px -8px #C49E62"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </div>
                      <div style={cssToObj(`font-size:11.5px;font-weight:700;color:${v.mockHeading ?? ""};text-align:center`)}>
                        SMS reminder
                      </div>
                      <div style={cssToObj(`font-size:10.5px;color:${v.mockMuted ?? ""}`)}>
                        Day 2
                      </div>
                    </div>
                    <div style={{"position": "relative", "zIndex": "1", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "8px", "flex": "1", "opacity": "0", "animation": "popIn 9000ms ease-out infinite", "animationDelay": "3300ms"}}>
                      <div style={{"width": "40px", "height": "40px", "borderRadius": "50%", "background": "#7447C8", "display": "flex", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 8px 16px -8px #7447C8"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5.5-4-7-7l2-2-2-4z" />
                        </svg>
                      </div>
                      <div style={cssToObj(`font-size:11.5px;font-weight:700;color:${v.mockHeading ?? ""};text-align:center`)}>
                        WhatsApp check-in
                      </div>
                      <div style={cssToObj(`font-size:10.5px;color:${v.mockMuted ?? ""}`)}>
                        Day 5
                      </div>
                    </div>
                  </div>
                  <div style={{"borderRadius": "12px", "background": "linear-gradient(135deg,#1A172C,#3A2E5C)", "padding": "16px 18px", "display": "flex", "alignItems": "center", "gap": "14px", "opacity": "0", "animation": "popIn 9000ms ease-out infinite", "animationDelay": "4600ms"}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9C77" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{"flexShrink": "0"}}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {' '}
                    <div style={{"fontSize": "13px", "color": "#fff", "lineHeight": "1.45"}}>
                      <b style={{"color": "#C49E62"}}>
                        Replied
                      </b>
                      , meeting scheduled for Tuesday
                    </div>
                  </div>
                </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(32px,4vw,56px) 24px"}}>
          <h2 data-reveal style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(24px,3vw,34px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 32px", "color": "#1A172C"}}>
            Features
          </h2>
          <div className="co-dark-panel" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(250px,1fr))", "gap": "1px", "background": "#D8D5E2", "border": "1px solid #D8D5E2", "borderRadius": "16px", "overflow": "hidden"}}>
            {(v.product.features || []).map((f, $index) => (
              <Fragment key={$index}>
              <div className="co-dark-card" data-reveal style={{"background": "#FAF9FF", "padding": "30px"}}>
                <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "22px", "fontWeight": "400", "color": "#C49E62", "marginBottom": "16px"}}>
                  {f.n2}
                </div>
                <div style={{"fontSize": "18px", "fontWeight": "600", "marginBottom": "8px", "color": "#1A172C"}}>
                  {f.title}
                </div>
                <div style={{"fontSize": "14.5px", "lineHeight": "1.6", "color": "#423F54"}}>
                  {f.desc}
                </div>
              </div>
              </Fragment>
            ))}
          </div>
        </section>
        <section style={{"maxWidth": "1140px", "margin": "0 auto", "padding": "clamp(40px,5vw,72px) 24px"}}>
          <div data-reveal style={{"display": "grid", "gridTemplateColumns": "0.92fr 0.86fr 1.05fr", "gap": "clamp(28px,4vw,56px)", "alignItems": "center"}}>
            <div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "marginBottom": "20px"}}>
                <span style={{"fontSize": "12px", "fontWeight": "600", "letterSpacing": ".18em", "textTransform": "uppercase", "color": "#C49E62"}}>
                  Workflow
                </span>
              </div>
              <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(28px,3.2vw,42px)", "lineHeight": "1.1", "letterSpacing": "-.015em", "fontWeight": "400", "margin": "0 0 18px", "color": "#1A172C", "textWrap": "balance"}}>
                {v.product.workflowTitle}
              </h2>
              <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.7", "margin": "0 0 30px", "maxWidth": "330px"}}>
                A simple pipeline that runs on its own, end to end, no manual handoffs required.
              </p>
              <div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
                {(v.product.flowNotes || []).map((note, $index) => (
                  <Fragment key={$index}>
                  <div className="co-dark-chip" style={{"display": "inline-flex", "alignItems": "center", "gap": "9px", "padding": "9px 16px 9px 13px", "borderRadius": "100px", "background": "#fff", "border": "1px solid #D8D5E2", "boxShadow": "0 2px 10px -6px rgba(21,14,42,.25)"}}>
                    <span style={{"width": "7px", "height": "7px", "borderRadius": "50%", "background": "#C49E62", "flexShrink": "0"}} />
                    {' '}
                    <span style={{"fontSize": "13px", "fontWeight": "600", "color": "#423F54", "textTransform": "capitalize", "letterSpacing": ".01em"}}>
                      {note}
                    </span>
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{"display": "flex", "justifyContent": "center"}}>
              <div style={{"position": "relative", "width": "250px", "height": "250px", "flexShrink": "0"}}>
                <div style={{"position": "absolute", "inset": "26px", "borderRadius": "50%", "background": "radial-gradient(circle,rgba(116,71,200,.16) 0%,rgba(116,71,200,0) 68%)"}} />
                <div style={{"position": "absolute", "inset": "0", "borderRadius": "50%", "border": "1.5px dashed #D8D5E2", "animation": "arcSpin 26s linear infinite"}} />
                <div style={{"position": "absolute", "inset": "22px", "borderRadius": "50%", "border": "1px dashed #D8D5E2", "animation": "arcSpinRev 34s linear infinite"}} />
                <div style={{"position": "absolute", "inset": "0", "animation": "arcSpin 26s linear infinite"}}>
                  <span style={{"position": "absolute", "top": "-4px", "left": "50%", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "#C49E62", "transform": "translateX(-50%)", "boxShadow": "0 0 0 4px rgba(196,158,98,.15)"}} />
                </div>
                <div style={{"position": "absolute", "inset": "22px", "animation": "arcSpinRev 34s linear infinite"}}>
                  <span style={{"position": "absolute", "bottom": "-3px", "left": "50%", "width": "7px", "height": "7px", "borderRadius": "50%", "background": "#7447C8", "transform": "translateX(-50%)", "boxShadow": "0 0 0 4px rgba(116,71,200,.15)"}} />
                </div>
                <div style={{"position": "absolute", "inset": "46px", "borderRadius": "50%", "background": "radial-gradient(130% 130% at 30% 22%,#1A172C 0%,#1A172C 58%)", "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "boxShadow": "0 26px 54px -22px rgba(21,14,42,.65),inset 0 1px 0 rgba(255,255,255,.06)"}}>
                  <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "44px", "fontWeight": "600", "color": "#fff", "lineHeight": "1", "letterSpacing": "-.01em"}}>
                    {v.product.heroStat.value}
                  </div>
                  <div style={{"fontSize": "11px", "color": "#9E9CAD", "marginTop": "8px", "textAlign": "center", "padding": "0 22px", "lineHeight": "1.5"}}>
                    {v.product.heroStat.label}
                  </div>
                </div>
              </div>
            </div>
            <div style={{"position": "relative"}}>
              <div style={{"position": "absolute", "top": "24px", "bottom": "24px", "left": "23px", "width": "2px", "background": "linear-gradient(#7447C8,#C49E62)", "opacity": ".25"}} />
              <div style={{"display": "flex", "flexDirection": "column", "gap": "22px"}}>
                {(v.product.flowHighlights || []).map((s, $index) => (
                  <Fragment key={$index}>
                  <div style={{"display": "flex", "gap": "18px", "alignItems": "flex-start", "position": "relative"}}>
                    <div style={cssToObj(`width:48px;height:48px;border-radius:50%;background:${s.accent ?? ""};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:16px;box-shadow:0 8px 20px -8px ${s.accent ?? ""};position:relative;z-index:1;border:3px solid #FAF9FF`)}>
                      {s.n2}
                    </div>
                    <div style={{"paddingTop": "4px"}}>
                      <div style={{"fontWeight": "700", "fontSize": "17px", "color": "#1A172C", "marginBottom": "5px", "letterSpacing": "-.01em"}}>
                        {s.word}
                      </div>
                      <div style={{"fontSize": "13.5px", "color": "#423F54", "lineHeight": "1.55", "maxWidth": "300px"}}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(24px,3vw,40px) 24px clamp(32px,4vw,56px)"}}>
          <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginBottom": "28px"}}>
            <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
              {"The numbers behind "}{v.product.eyebrow}
            </span>
          </div>
          <div className="co-dark-panel" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(320px,1fr))", "gap": "1px", "background": "#D8D5E2", "border": "1px solid #D8D5E2", "borderRadius": "20px", "overflow": "hidden", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
            <div className="co-dark-card" data-reveal style={{"background": "#FAF9FF", "padding": "clamp(28px,3.2vw,36px) clamp(24px,3vw,32px) 32px"}}>
              <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "19px", "fontWeight": "400", "letterSpacing": "-.005em", "color": "#1A172C", "marginBottom": "32px", "maxWidth": "320px", "lineHeight": "1.35"}}>
                {v.product.statsBar.title}
              </div>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "26px", "minHeight": "200px", "justifyContent": "center"}}>
                {(v.product.statsBar.bars || []).map((b, $index) => (
                  <Fragment key={$index}>
                  <div>
                    <div style={{"display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "marginBottom": "9px"}}>
                      <span style={{"fontSize": "13.5px", "fontWeight": "700", "color": "#1A172C"}}>
                        {b.label}
                      </span>
                      {' '}
                      <span style={cssToObj(`font-size:13.5px;font-weight:700;color:${b.labelColor ?? ""}`)}>
                        {b.value}%
                      </span>
                    </div>
                    <div style={{"width": "100%", "height": "10px", "borderRadius": "999px", "background": "#ECE9F6", "overflow": "hidden"}}>
                      <div style={cssToObj(b.barStyle)} />
                    </div>
                  </div>
                  </Fragment>
                ))}
              </div>
              <p style={{"fontSize": "13px", "color": "#716F82", "margin": "28px 0 0", "lineHeight": "1.55"}}>
                {v.product.statsBar.caption}
              </p>
            </div>
            <div className="co-dark-card" data-reveal style={{"background": "#FAF9FF", "padding": "clamp(28px,3.2vw,36px) clamp(24px,3vw,32px) 32px"}}>
              <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "19px", "fontWeight": "400", "letterSpacing": "-.005em", "color": "#1A172C", "marginBottom": "32px", "maxWidth": "320px", "lineHeight": "1.35"}}>
                {v.product.statsTrend.title}
              </div>
              <div style={{"position": "relative", "height": "200px"}}>
                <svg width="100%" height="100%" viewBox={"0 0 " + String(v.product.statsTrend.viewW ?? "") + " " + String(v.product.statsTrend.viewH ?? "")} preserveAspectRatio="none" style={{"position": "absolute", "inset": "0"}}>
                  <defs>
                    <pattern id="trendDots" width="7" height="7" patternUnits="userSpaceOnUse">
                      <circle cx="1.4" cy="1.4" r="1.4" fill="rgba(255,255,255,.65)" />
                    </pattern>
                    <linearGradient id="trendFade" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#7447C8" stopOpacity="0" />
                      <stop offset="0.2" stopColor="#7447C8" stopOpacity="1" />
                      <stop offset="1" stopColor="#C49E62" />
                    </linearGradient>
                    <linearGradient id="trendAreaFade" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#7447C8" />
                      <stop offset="1" stopColor="#C49E62" />
                    </linearGradient>
                    <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {(v.product.statsTrend.gridY || []).map((gy, $index) => (
                    <Fragment key={$index}>
                    <line x1="0" y1={gy} x2={v.product.statsTrend.viewW} y2={gy} stroke="#D8D5E2" strokeWidth="1" strokeDasharray="3 5" />
                    </Fragment>
                  ))}
                  <path d={v.product.statsTrend.areaD} fill="url(#trendAreaFade)" opacity=".12" />
                  <path d={v.product.statsTrend.areaD} fill="url(#trendDots)" opacity=".5" />
                  <path d={v.product.statsTrend.lineD} fill="none" stroke="url(#trendFade)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {(v.product.statsTrend.dots || []).map((d, $index) => (
                    <Fragment key={$index}>
                    <circle cx={d.x} cy={d.y} r="4" fill="#fff" stroke="#7447C8" strokeWidth="2" />
                    </Fragment>
                  ))}
                  <circle cx={v.product.statsTrend.dots[5].x} cy={v.product.statsTrend.dots[5].y} r="6" fill="#C49E62" filter="url(#dotGlow)" />
                  <circle cx={v.product.statsTrend.dots[5].x} cy={v.product.statsTrend.dots[5].y} r="5" fill="#fff" stroke="#C49E62" strokeWidth="2.5" />
                </svg>
              </div>
              <div style={{"display": "flex", "marginTop": "14px"}}>
                {(v.product.statsTrend.months || []).map((m, $index) => (
                  <Fragment key={$index}>
                  <div style={{"flex": "1", "textAlign": "center", "fontSize": "11px", "fontWeight": "600", "color": "#716F82", "letterSpacing": ".02em"}}>
                    {m}
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(32px,4vw,56px) 24px", "display": "flex", "flexDirection": "column", "gap": "clamp(40px,5vw,64px)"}}>
          {(v.product.sections || []).map((sec, $index) => (
            <Fragment key={$index}>
            <div data-reveal>
              <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(22px,2.6vw,30px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 8px", "color": "#1A172C"}}>
                {sec.heading}
              </h2>
              <p style={{"fontSize": "16px", "color": "#423F54", "margin": "0 0 26px", "maxWidth": "660px", "lineHeight": "1.6"}}>
                {sec.note}
              </p>
              {sec.notChart ? (
                <>
                <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(232px,1fr))", "gap": "20px"}}>
                  {(sec.items || []).map((it, $index) => (
                    <Fragment key={$index}>
                    <div className="co-dark-card co-p3dd0a2" style={{"display": "flex", "flexDirection": "column", "gap": "16px", "padding": "30px 26px", "background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)", "transition": "transform .3s,box-shadow .3s,border-color .3s"}}>
                      <span style={cssToObj(it.badgeStyle)}>
                        {it.iconEl}
                      </span>
                      {' '}
                      <div style={{"minWidth": "0"}}>
                        <div style={{"fontSize": "16.5px", "fontWeight": "700", "color": "#1A172C", "marginBottom": "7px", "letterSpacing": "-.012em"}}>
                          {it.title}
                        </div>
                        <div style={{"fontSize": "14px", "lineHeight": "1.6", "color": "#716F82"}}>
                          {it.desc}
                        </div>
                      </div>
                    </div>
                    </Fragment>
                  ))}
                </div>
                </>
              ) : null}
              {sec.isChart ? (
                <>
                <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(288px,1fr))", "gap": "14px"}}>
                  {(sec.charts || []).map((ch, $index) => (
                    <Fragment key={$index}>
                    <div className="co-dark-card" style={{"background": "#fff", "border": "1px solid #ECE9F6", "borderRadius": "16px", "padding": "24px", "display": "flex", "flexDirection": "column"}}>
                      <div style={{"fontSize": "15px", "fontWeight": "600", "color": "#1A172C", "marginBottom": "22px"}}>
                        {ch.title}
                      </div>
                      <div style={{"display": "flex", "flexDirection": "column", "gap": "16px", "flex": "1"}}>
                        {(ch.bars || []).map((bar, $index) => (
                          <Fragment key={$index}>
                          <div>
                            <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "baseline", "marginBottom": "7px", "gap": "12px"}}>
                              <span style={cssToObj(`font-size:12.5px;font-weight:600;color:${bar.labelColor ?? ""}`)}>
                                {bar.label}
                              </span>
                              {' '}
                              <span style={cssToObj(`font-size:13px;font-weight:700;color:${bar.labelColor ?? ""};flex-shrink:0`)}>
                                {bar.value}
                              </span>
                            </div>
                            <div style={{"width": "100%", "height": "9px", "borderRadius": "6px", "background": "#F4F2FB", "overflow": "hidden"}}>
                              <div style={cssToObj(bar.fillStyle)} />
                            </div>
                          </div>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{"fontSize": "12.5px", "color": "#716F82", "lineHeight": "1.5", "marginTop": "22px", "paddingTop": "16px", "borderTop": "1px solid #F4F2FB"}}>
                        {ch.caption}
                      </div>
                    </div>
                    </Fragment>
                  ))}
                </div>
                </>
              ) : null}
            </div>
            </Fragment>
          ))}
        </section>
        <section style={{"maxWidth": "840px", "margin": "0 auto", "padding": "clamp(32px,4vw,56px) 24px"}}>
          <div data-reveal style={{"display": "flex", "alignItems": "center", "gap": "12px", "marginBottom": "30px"}}>
            <span style={{"fontSize": "12px", "fontWeight": "600", "letterSpacing": ".18em", "textTransform": "uppercase", "color": "#C49E62"}}>
              FAQ
            </span>
          </div>
          <h2 data-reveal style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(26px,3.2vw,40px)", "lineHeight": "1.1", "letterSpacing": "-.015em", "fontWeight": "400", "margin": "0 0 34px", "color": "#1A172C"}}>
            Frequently asked questions
          </h2>
          <div style={{"display": "flex", "flexDirection": "column"}}>
            {(v.product.faqs || []).map((q, $index) => (
              <Fragment key={$index}>
              <div className="co-faq-row" data-reveal style={{"borderTop": "1px solid #D8D5E2"}}>
                <div onClick={q.toggle} style={{"display": "flex", "alignItems": "flex-start", "gap": "20px", "padding": "24px 4px", "cursor": "pointer", "userSelect": "none"}}>
                  <span style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "14px", "fontWeight": "600", "color": "#C49E62", "paddingTop": "3px", "flexShrink": "0", "width": "26px"}}>
                    {q.n2}
                  </span>
                  {' '}
                  <span className="co-faq-question" style={{"flex": "1", "fontSize": "17.5px", "fontWeight": "600", "color": "#1A172C", "letterSpacing": "-.01em", "lineHeight": "1.4"}}>
                    {q.q}
                  </span>
                  {' '}
                  <span className="co-faq-toggle" style={{"flexShrink": "0", "width": "30px", "height": "30px", "borderRadius": "50%", "border": "1px solid #D8D5E2", "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "1px"}}>
                    {q.isClosed ? (
                      <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7447C8" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      </>
                    ) : null}
                    {q.isOpen ? (
                      <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C49E62" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M5 12h14" />
                      </svg>
                      </>
                    ) : null}
                  </span>
                </div>
                {q.isOpen ? (
                  <>
                  <div className="co-faq-answer" style={{"padding": "0 60px 26px 46px", "fontSize": "15px", "lineHeight": "1.65", "color": "#423F54"}}>
                    {q.a}
                  </div>
                  </>
                ) : null}
              </div>
              </Fragment>
            ))}
          </div>
        </section>
        <section style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(40px,5vw,72px) 24px clamp(64px,8vw,100px)"}}>
          <div data-reveal style={{"textAlign": "center", "background": "#1A172C", "padding": "clamp(48px,7vw,80px) 24px", "borderRadius": "20px"}}>
            <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(26px,3.2vw,38px)", "letterSpacing": "-.01em", "fontWeight": "400", "color": "#fff", "margin": "0 0 12px"}}>
              Ready to get started?
            </h2>
            <p style={{"fontSize": "16.5px", "color": "#9E9CAD", "margin": "0 0 30px"}}>
              Join the waitlist and be first in line for early access.
            </p>
            {' '}
            <a onClick={v.gotoWaitlist} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "padding": "16px 30px", "border": "1px solid #C49E62", "borderRadius": "10px", "fontWeight": "600", "fontSize": "15px", "letterSpacing": ".02em", "color": "#C49E62", "cursor": "pointer", "transition": "background .2s,color .2s"}} className="co-p1f1771">
              Join the Waitlist →
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
