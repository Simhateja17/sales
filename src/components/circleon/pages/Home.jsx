// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';
import { cssToObj } from '../cssToObj';

export default function Home({ v }) {
  return (
    <>
      <div className="co-home-page">
        <section className="co-hero">
          <div className="co-rain">
            <span style={{"left": "3%", "animationDuration": "10s", "animationDelay": "-4s"}}>
              92% MATCH
            </span>
            {' '}
            <span style={{"left": "5%", "animationDuration": "9.2s", "animationDelay": "-6.8s"}}>
              48%
            </span>
            {' '}
            <span style={{"left": "7%", "animationDuration": "8.5s", "animationDelay": "-1s"}}>
              21x
            </span>
            {' '}
            <span style={{"left": "9%", "animationDuration": "12.6s", "animationDelay": "-9.2s"}}>
              77%
            </span>
            {' '}
            <span style={{"left": "11%", "animationDuration": "11.2s", "animationDelay": "-6.5s"}}>
              05 MIN
            </span>
            {' '}
            <span style={{"left": "13%", "animationDuration": "8.4s", "animationDelay": "-3.6s"}}>
              12x
            </span>
            {' '}
            <span style={{"left": "15%", "animationDuration": "9.8s", "animationDelay": "-2.2s"}}>
              62%
            </span>
            {' '}
            <span style={{"left": "17%", "animationDuration": "10.8s", "animationDelay": "-8.1s"}}>
              31%
            </span>
            {' '}
            <span style={{"left": "19%", "animationDuration": "12s", "animationDelay": "-7s"}}>
              INVOICE
            </span>
            {' '}
            <span style={{"left": "21%", "animationDuration": "9.4s", "animationDelay": "-4.3s"}}>
              06
            </span>
            {' '}
            <span style={{"left": "23%", "animationDuration": "8.9s", "animationDelay": "-4.7s"}}>
              80%
            </span>
            {' '}
            <span style={{"left": "25%", "animationDuration": "11.9s", "animationDelay": "-1.4s"}}>
              2.4x
            </span>
            {' '}
            <span style={{"left": "27%", "animationDuration": "9.5s", "animationDelay": "-6s"}}>
              62% MISSED
            </span>
            {' '}
            <span style={{"left": "29%", "animationDuration": "8.1s", "animationDelay": "-7.1s"}}>
              44%
            </span>
            {' '}
            <span style={{"left": "31%", "animationDuration": "13.1s", "animationDelay": "-9.6s"}}>
              24/7
            </span>
            {' '}
            <span style={{"left": "33%", "animationDuration": "10.2s", "animationDelay": "-5.2s"}}>
              08
            </span>
            {' '}
            <span style={{"left": "35%", "animationDuration": "11s", "animationDelay": "-2.5s"}}>
              05 MIN
            </span>
            {' '}
            <span style={{"left": "37%", "animationDuration": "12.1s", "animationDelay": "-10.4s"}}>
              93%
            </span>
            {' '}
            <span style={{"left": "39%", "animationDuration": "8.3s", "animationDelay": "-5.4s"}}>
              CRM
            </span>
            {' '}
            <span style={{"left": "41%", "animationDuration": "9.1s", "animationDelay": "-2.7s"}}>
              14x
            </span>
            {' '}
            <span style={{"left": "43%", "animationDuration": "8s", "animationDelay": "-5s"}}>
              80% FOLLOW-UP
            </span>
            {' '}
            <span style={{"left": "45%", "animationDuration": "13.3s", "animationDelay": "-11.2s"}}>
              36%
            </span>
            {' '}
            <span style={{"left": "47%", "animationDuration": "10.7s", "animationDelay": "-1.8s"}}>
              1 SEC
            </span>
            {' '}
            <span style={{"left": "49%", "animationDuration": "8.6s", "animationDelay": "-6.4s"}}>
              07
            </span>
            {' '}
            <span style={{"left": "51%", "animationDuration": "12.5s", "animationDelay": "-9s"}}>
              CRM SYNC
            </span>
            {' '}
            <span style={{"left": "53%", "animationDuration": "9.7s", "animationDelay": "-3.1s"}}>
              68%
            </span>
            {' '}
            <span style={{"left": "55%", "animationDuration": "9.3s", "animationDelay": "-6.1s"}}>
              18%
            </span>
            {' '}
            <span style={{"left": "57%", "animationDuration": "11.4s", "animationDelay": "-8.6s"}}>
              4.8x
            </span>
            {' '}
            <span style={{"left": "59%", "animationDuration": "9s", "animationDelay": "-3.5s"}}>
              LEAD READY
            </span>
            {' '}
            <span style={{"left": "61%", "animationDuration": "8.2s", "animationDelay": "-1.9s"}}>
              29%
            </span>
            {' '}
            <span style={{"left": "63%", "animationDuration": "11.6s", "animationDelay": "-8.9s"}}>
              3x
            </span>
            {' '}
            <span style={{"left": "65%", "animationDuration": "10.6s", "animationDelay": "-4.9s"}}>
              11
            </span>
            {' '}
            <span style={{"left": "67%", "animationDuration": "10.5s", "animationDelay": "-8s"}}>
              24/7 CALL
            </span>
            {' '}
            <span style={{"left": "69%", "animationDuration": "12.8s", "animationDelay": "-10.7s"}}>
              57%
            </span>
            {' '}
            <span style={{"left": "71%", "animationDuration": "8.7s", "animationDelay": "-2.9s"}}>
              92%
            </span>
            {' '}
            <span style={{"left": "73%", "animationDuration": "9.9s", "animationDelay": "-5.8s"}}>
              6x
            </span>
            {' '}
            <span style={{"left": "75%", "animationDuration": "9s", "animationDelay": "-2s"}}>
              18% LIFT
            </span>
            {' '}
            <span style={{"left": "77%", "animationDuration": "11.1s", "animationDelay": "-7.4s"}}>
              86%
            </span>
            {' '}
            <span style={{"left": "79%", "animationDuration": "12.2s", "animationDelay": "-7.7s"}}>
              CALL
            </span>
            {' '}
            <span style={{"left": "81%", "animationDuration": "8.5s", "animationDelay": "-4.1s"}}>
              02
            </span>
            {' '}
            <span style={{"left": "83%", "animationDuration": "13s", "animationDelay": "-10s"}}>
              1 SEC ANSWER
            </span>
            {' '}
            <span style={{"left": "85%", "animationDuration": "10.1s", "animationDelay": "-6.2s"}}>
              74%
            </span>
            {' '}
            <span style={{"left": "87%", "animationDuration": "9.6s", "animationDelay": "-5.9s"}}>
              READY
            </span>
            {' '}
            <span style={{"left": "89%", "animationDuration": "12.4s", "animationDelay": "-9.8s"}}>
              9x
            </span>
            {' '}
            <span style={{"left": "91%", "animationDuration": "11s", "animationDelay": "-5s"}}>
              CALL BOOKED
            </span>
            {' '}
            <span style={{"left": "93%", "animationDuration": "8.7s", "animationDelay": "-2.3s"}}>
              33%
            </span>
            {' '}
            <span style={{"left": "95%", "animationDuration": "8.8s", "animationDelay": "-7.5s"}}>
              3 ENGINES
            </span>
            {' '}
            <span style={{"left": "97%", "animationDuration": "10.4s", "animationDelay": "-6.7s"}}>
              16x
            </span>
            {' '}
            <span style={{"left": "98%", "animationDuration": "10.9s", "animationDelay": "-3.8s"}}>
              99%
            </span>
          </div>
          <section className="co-intro">
            <div className="co-eyebrow">
              <b />
              SYSTEM ONLINE · ONE TEAM, THREE ENGINES
            </div>
            <h1>
              Every lead gets a call.
              <br />
              {"Every gap gets "}
              <em>
                followed up.
              </em>
            </h1>
            <p>
              A living AI team that sources opportunities, speaks with them, and keeps moving until the work is done. Choose one service, or let the whole crew run together.
            </p>
          </section>
          <div className="co-actions">
            <button className="co-button" onClick={v.gotoWaitlist}>
              Book a demo
            </button>
            {' '}
            <span className="co-see" onClick={v.scrollSolutions}>
              See the flow
            </span>
          </div>
          <section className="co-world">
            <div className="co-path" />
            <div className="co-hub">
              <div className="co-screen">
                <div className="co-tabs">
                  <span className="co-tab-lead">
                    LEAD GENERATION
                  </span>
                  <span className="co-tab-voice">
                    VOICE AGENT
                  </span>
                  <span className="co-tab-follow">
                    FOLLOW-UP
                  </span>
                </div>
                <div className="co-stage co-stage-lead">
                  <div className="co-stage-title">
                    {"Finding ideal prospects "}
                    <small>
                      ENRICHING LIVE
                    </small>
                  </div>
                  <div className="co-lead-grid">
                    <div className="co-lead-card">
                      <span className="co-avatar">
                        AM
                      </span>
                      <span className="co-lead-name">
                        Ava Martin
                      </span>
                      <span className="co-lead-role">
                        VP Sales · SaaS
                      </span>
                      <span className="co-score">
                        <b>
                          96%
                        </b>
                        {" MATCH"}
                      </span>
                    </div>
                    <div className="co-lead-card">
                      <span className="co-avatar">
                        JL
                      </span>
                      <span className="co-lead-name">
                        James Lee
                      </span>
                      <span className="co-lead-role">
                        Founder · Fintech
                      </span>
                      <span className="co-score">
                        <b>
                          91%
                        </b>
                        {" MATCH"}
                      </span>
                    </div>
                    <div className="co-lead-card">
                      <span className="co-avatar">
                        NS
                      </span>
                      <span className="co-lead-name">
                        Nina Shah
                      </span>
                      <span className="co-lead-role">
                        COO · Healthcare
                      </span>
                      <span className="co-score">
                        <b>
                          88%
                        </b>
                        {" MATCH"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="co-stage co-stage-voice">
                  <div className="co-stage-title">
                    {"AI voice agent connecting "}
                    <small>
                      CALL IN PROGRESS
                    </small>
                  </div>
                  <div className="co-voice-layout">
                    <div className="co-caller-card">
                      <span className="co-avatar">
                        AM
                      </span>
                      <span className="co-call-name">
                        Ava Martin
                      </span>
                      <span className="co-call-number">
                        Qualified lead
                      </span>
                    </div>
                    <div className="co-wave-wrap">
                      <div className="co-wave">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <span className="co-call-state">
                        AI AGENT SPEAKING
                      </span>
                    </div>
                    <div className="co-call-summary">
                      <b>
                        Call intelligence
                      </b>
                      <span>
                        Need confirmed
                      </span>
                      <span>
                        Budget qualified
                      </span>
                      <span>
                        Meeting requested
                      </span>
                    </div>
                  </div>
                </div>
                <div className="co-stage co-stage-follow">
                  <div className="co-stage-title">
                    {"Following up at the right moment "}
                    <small>
                      AUTOMATION ACTIVE
                    </small>
                  </div>
                  <div className="co-follow-layout">
                    <div className="co-message-stack">
                      <div className="co-message">
                        <span className="co-message-icon">
                          ✉
                        </span>
                        <span>
                          <b>
                            Email sent
                          </b>
                          <small>
                            Personalized by AI
                          </small>
                        </span>
                      </div>
                      <div className="co-message two">
                        <span className="co-message-icon">
                          S
                        </span>
                        <span>
                          <b>
                            SMS delivered
                          </b>
                          <small>
                            Replied in 42 sec
                          </small>
                        </span>
                      </div>
                      <div className="co-message three">
                        <span className="co-message-icon">
                          W
                        </span>
                        <span>
                          <b>
                            WhatsApp follow-up
                          </b>
                          <small>
                            Best time detected
                          </small>
                        </span>
                      </div>
                    </div>
                    <div className="co-follow-arrow">
                      <i />
                    </div>
                    <div className="co-calendar">
                      <strong>
                        MEETING
                      </strong>
                      <b>
                        10:30
                      </b>
                      <span>
                        BOOKED ✓
                      </span>
                    </div>
                  </div>
                </div>
                {' '}
                <span className="co-live">
                  LIVE
                </span>
              </div>
            </div>
            <div className="co-hotspot lead" />
            <div className="co-hotspot voice" />
            <div className="co-hotspot follow" />
            <div className="co-flow lead" />
            <div className="co-flow voice" />
            <div className="co-flow follow" />
            {' '}
            <span className="co-token lead">
              NEW LEAD
            </span>
            <span className="co-token voice">
              AI CALL
            </span>
            <span className="co-token follow">
              FOLLOW-UP
            </span>
            {' '}
            <span className="co-speech" />
            <span className="co-speech two" />
            <span className="co-speech three" />
            {' '}
            <span className="co-status one">
              ENRICHING + SCORING
            </span>
            <span className="co-status two">
              VOICE AGENT CALLING
            </span>
            <span className="co-status three">
              FOLLOW-UP SENT
            </span>
            {' '}
            <div className="co-desk co-desk1" />
            <div className="co-desk co-desk2" />
            <div className="co-desk co-desk3" />
            <div className="co-ladder">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="co-person co-p1">
              <span className="cap" />
              <span className="head" />
              <span className="body" />
              <span className="arm one" />
              <span className="arm two" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="label">
                LEAD FINDER
              </span>
            </div>
            <div className="co-person co-p2">
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="label">
                ENRICHING
              </span>
            </div>
            <div className="co-person co-p3">
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="co-phone" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="label">
                VOICE AGENT
              </span>
            </div>
            <div className="co-person co-p4">
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="co-case" />
              <span className="label">
                HAND-OFF
              </span>
            </div>
            <div className="co-person co-p5">
              <span className="cap" />
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="co-paper" />
              <span className="label">
                FOLLOW-UP
              </span>
            </div>
            <div className="co-person co-p6">
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="label">
                BOOKED
              </span>
            </div>
            <div className="co-person co-p7">
              <span className="head" />
              <span className="body" />
              <span className="arm" />
              <span className="leg one" />
              <span className="leg two" />
              <span className="label">
                RUNNER
              </span>
            </div>
            {' '}
            <span className="co-float co-invoice">
              INV-0417
            </span>
            <span className="co-float co-match">
              92% match
            </span>
            <span className="co-float co-booked">
              booked
            </span>
          </section>
        </section>
        <section id="solutions" style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(40px,5vw,72px) 24px"}}>
          <div data-reveal style={{"textAlign": "center", "maxWidth": "620px", "margin": "0 auto 44px"}}>
            <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginBottom": "16px"}}>
              <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
                One platform, three engines
              </span>
            </div>
            <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(30px,3.6vw,44px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 16px", "color": "#1A172C"}}>
              {"Everything you need to sell on "}
              <span style={{"fontStyle": "italic", "background": "linear-gradient(120deg,#471E86,#7447C8 52%,#C49E62)", "WebkitBackgroundClip": "text", "backgroundClip": "text", "WebkitTextFillColor": "transparent"}}>
                autopilot
              </span>
            </h2>
            <p style={{"fontSize": "17px", "color": "#423F54", "lineHeight": "1.6", "margin": "0"}}>
              Click a title to explore the full solution, or click into a card to jump straight to how it works.
            </p>
          </div>
          <div className="co-solutions-panel" data-reveal style={{"position": "relative", "maxWidth": "1000px", "margin": "0 auto", "background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "28px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)", "padding": "0 0 clamp(72px,8vw,96px)", "overflow": "hidden"}}>
            <div style={{"display": "flex", "justifyContent": "center", "margin": "0 0 40px", "padding": "0"}}>
              <div style={{"display": "flex", "justifyContent": "center", "width": "100%", "gap": "clamp(32px,5vw,64px)", "background": "transparent", "borderBottom": "none", "borderRadius": "0", "padding": "24px clamp(20px,3vw,32px)"}}>
                <div onClick={v.setActiveLead} style={cssToObj(v.leadTabStyle)}>
                  {v.leadActive ? <span className="co-sol-tab-dot" /> : null}
                  {" Lead Generation "}
                </div>
                <div onClick={v.setActiveVoice} style={cssToObj(v.voiceTabStyle)}>
                  {v.voiceActive ? <span className="co-sol-tab-dot" /> : null}
                  {" Voice Agent "}
                </div>
                <div onClick={v.setActiveFollow} style={cssToObj(v.followTabStyle)}>
                  {v.followActive ? <span className="co-sol-tab-dot" /> : null}
                  {" Follow Up "}
                </div>
              </div>
            </div>
            <div style={{"position": "relative", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "gap": "clamp(8px,2vw,20px)", "padding": "0 clamp(20px,3vw,32px) 0"}}>
              <div className="co-sol-col co-sol-col-1" style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "position": "relative", "zIndex": "2", "marginTop": "92px"}}>
                <div className="co-sol-orb co-sol-float" onMouseEnter={v.setActiveLead} onClick={v.goLeadContent} style={cssToObj(v.leadOrbStyle)}>
                  <span className="co-solution-icon" style={cssToObj(v.leadIconWrapStyle)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7447C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                    </svg>
                  </span>
                </div>
                <div className="co-solution-title" onClick={v.goLeadTitle} style={cssToObj(v.leadTitleStyle)}>
                  {"Lead Generation "}
                  <span style={cssToObj(v.leadArrowStyle)}>
                    →
                  </span>
                </div>
                <p className="co-solution-desc" onClick={v.goLeadContent} style={cssToObj(v.leadDescStyle)}>
                  Discover, enrich, and score prospects that match your ICP, then route them to your CRM the moment they're sales-ready.
                </p>
              </div>
              <div className="co-sol-col co-sol-col-2" style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "position": "relative", "zIndex": "3", "marginTop": "0"}}>
                <div className="co-sol-orb co-sol-orb-2 co-sol-float co-sol-float-2" onMouseEnter={v.setActiveVoice} onClick={v.goVoiceContent} style={cssToObj(v.voiceOrbStyle)}>
                  <span className="co-solution-icon" style={cssToObj(v.voiceIconWrapStyle)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C49E62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5.5-4-7-7l2-2-2-4z" />
                      <path d="M15 4a5 5 0 0 1 5 5M15 8a1.5 1.5 0 0 1 1.5 1.5" />
                    </svg>
                  </span>
                </div>
                <div className="co-solution-title" onClick={v.goVoiceTitle} style={cssToObj(v.voiceTitleStyle)}>
                  {"Voice Agent "}
                  <span style={cssToObj(v.voiceArrowStyle)}>
                    →
                  </span>
                </div>
                <p className="co-solution-desc" onClick={v.goVoiceContent} style={cssToObj(v.voiceDescStyle)}>
                  Answer every call in under a second, 24/7. Qualify prospects, book appointments, and handle support, no voicemail, no lost jobs.
                </p>
              </div>
              <div className="co-sol-col co-sol-col-3" style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "position": "relative", "zIndex": "1", "marginTop": "52px"}}>
                <div className="co-sol-orb co-sol-orb-3 co-sol-float co-sol-float-3" onMouseEnter={v.setActiveFollow} onClick={v.goFollowContent} style={cssToObj(v.followOrbStyle)}>
                  <span className="co-solution-icon" style={cssToObj(v.followIconWrapStyle)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7447C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                    </svg>
                  </span>
                </div>
                <div className="co-solution-title" onClick={v.goFollowTitle} style={cssToObj(v.followTitleStyle)}>
                  {"Follow Up "}
                  <span style={cssToObj(v.followArrowStyle)}>
                    →
                  </span>
                </div>
                <p className="co-solution-desc" onClick={v.goFollowContent} style={cssToObj(v.followDescStyle)}>
                  Personalized email, SMS, and WhatsApp sequences, timed by AI, because 80% of sales close only after five or more follow-ups.
                </p>
              </div>
            </div>
            {/* Live demo for whichever solution is active — same markup as the
                hero hub's stages, but switched by the tabs instead of a loop. */}
            <div className="co-sol-demo-card">
              {v.leadActive ? (
                <div className="co-sol-demo">
                  <div className="co-stage-title">
                    {"Finding ideal prospects "}
                    <small>
                      ENRICHING LIVE
                    </small>
                  </div>
                  <div className="co-lead-grid">
                    <div className="co-lead-card">
                      <span className="co-avatar">AM</span>
                      <span className="co-lead-name">Ava Martin</span>
                      <span className="co-lead-role">VP Sales · SaaS</span>
                      <span className="co-score"><b>96%</b>{" MATCH"}</span>
                    </div>
                    <div className="co-lead-card">
                      <span className="co-avatar">JL</span>
                      <span className="co-lead-name">James Lee</span>
                      <span className="co-lead-role">Founder · Fintech</span>
                      <span className="co-score"><b>91%</b>{" MATCH"}</span>
                    </div>
                    <div className="co-lead-card">
                      <span className="co-avatar">NS</span>
                      <span className="co-lead-name">Nina Shah</span>
                      <span className="co-lead-role">COO · Healthcare</span>
                      <span className="co-score"><b>88%</b>{" MATCH"}</span>
                    </div>
                  </div>
                </div>
              ) : null}
              {v.voiceActive ? (
                <div className="co-sol-demo">
                  <div className="co-stage-title">
                    {"AI voice agent connecting "}
                    <small>
                      CALL IN PROGRESS
                    </small>
                  </div>
                  <div className="co-voice-layout">
                    <div className="co-caller-card">
                      <span className="co-avatar">AM</span>
                      <span className="co-call-name">Ava Martin</span>
                      <span className="co-call-number">Qualified lead</span>
                    </div>
                    <div className="co-wave-wrap">
                      <div className="co-wave">
                        <i /><i /><i /><i /><i /><i /><i />
                      </div>
                      <span className="co-call-state">AI AGENT SPEAKING</span>
                    </div>
                    <div className="co-call-summary">
                      <b>Call intelligence</b>
                      <span>Need confirmed</span>
                      <span>Budget qualified</span>
                      <span>Meeting requested</span>
                    </div>
                  </div>
                </div>
              ) : null}
              {v.followActive ? (
                <div className="co-sol-demo">
                  <div className="co-stage-title">
                    {"Following up at the right moment "}
                    <small>
                      AUTOMATION ACTIVE
                    </small>
                  </div>
                  <div className="co-follow-layout">
                    <div className="co-message-stack">
                      <div className="co-message">
                        <span className="co-message-icon">✉</span>
                        <span>
                          <b>Email sent</b>
                          <small>Personalized by AI</small>
                        </span>
                      </div>
                      <div className="co-message two">
                        <span className="co-message-icon">S</span>
                        <span>
                          <b>SMS delivered</b>
                          <small>Replied in 42 sec</small>
                        </span>
                      </div>
                      <div className="co-message three">
                        <span className="co-message-icon">W</span>
                        <span>
                          <b>WhatsApp follow-up</b>
                          <small>Best time detected</small>
                        </span>
                      </div>
                    </div>
                    <div className="co-follow-arrow">
                      <i />
                    </div>
                    <div className="co-calendar">
                      <strong>MEETING</strong>
                      <b>10:30</b>
                      <span>BOOKED ✓</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {' '}
            <a onClick={v.gotoWaitlist} style={{"position": "absolute", "right": "clamp(20px,3vw,32px)", "bottom": "clamp(20px,3vw,28px)", "display": "inline-flex", "alignItems": "center", "gap": "12px", "padding": "6px 6px 6px 24px", "borderRadius": "999px", "fontWeight": "600", "fontSize": "14.5px", "letterSpacing": ".02em", "color": "#fff", "background": "linear-gradient(135deg,#8B5CF6,#5B2A9E)", "boxShadow": "0 12px 24px -10px rgba(71,30,134,.55)", "cursor": "pointer", "transition": ".2s", "whiteSpace": "nowrap"}} className="co-p1066ae">
              {"Sign up "}
              <span style={{"width": "32px", "height": "32px", "borderRadius": "50%", "background": "rgba(255,255,255,.22)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "15px"}}>
                →
              </span>
            </a>
          </div>
        </section>
        <section className="co-workflows" style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(48px,6vw,88px) 24px", "display": "flex", "flexDirection": "column", "gap": "clamp(56px,7vw,96px)"}}>
          <div id="wf-lead" data-reveal style={{"scrollMarginTop": "100px"}}>
            <h3 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(22px,2.6vw,28px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 14px", "color": "#1A172C"}}>
              {"How "}
              <span style={{"fontStyle": "italic", "background": "linear-gradient(120deg,#471E86,#7447C8 52%,#C49E62)", "WebkitBackgroundClip": "text", "backgroundClip": "text", "WebkitTextFillColor": "transparent"}}>
                Lead Generation
              </span>
              {" works"}
            </h3>
            <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.7", "margin": "0 0 28px", "maxWidth": "640px"}}>
              {"AI prospecting that discovers, enriches, and scores leads matching your ICP, then routes them to your CRM the instant they're ready, while buying intent is still at its peak. No lists to buy, no spreadsheets to maintain, just a steady stream of qualified leads reps can act on immediately. "}
              <a onClick={v.goLeadTitle} style={{"color": "#471E86", "fontWeight": "600", "cursor": "pointer", "borderBottom": "1px solid #471E86"}}>
                Learn more →
              </a>
            </p>
            <div className="co-workflow-panel" style={{"background": "#FAF9FF", "border": "1px solid #D8D5E2", "borderRadius": "28px", "padding": "clamp(28px,4vw,44px) clamp(20px,3vw,32px)", "overflowX": "auto"}}>
              <div style={{"display": "flex", "flexWrap": "nowrap", "justifyContent": "center", "alignItems": "flex-start", "width": "max-content", "minWidth": "100%"}}>
                {(v.homeLeadFlow || []).map((s, $index) => (
                  <Fragment key={$index}>
                  <div style={{"display": "flex", "alignItems": "flex-start"}}>
                    <div onClick={s.onClick} style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "width": "150px", "flexShrink": "0"}}>
                      <div className="co-workflow-node" style={cssToObj(s.circleStyle)}>
                        <div style={cssToObj(s.ringStyle)} />
                        {s.isStep1 ? (
                          <>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep2 ? (
                          <>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep3 ? (
                          <>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M3 10h18M8 3v3M16 3v3" />
                            <circle cx="12" cy="15" r="1.6" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep4 ? (
                          <>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14h4l2-9 4 18 2-9h4" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep5 ? (
                          <>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2 11 13" />
                            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                          </svg>
                          </>
                        ) : null}
                      </div>
                      <div className="co-workflow-word" style={cssToObj(s.wordStyle)}>
                        {s.word}
                      </div>
                      <div className="co-workflow-label" style={{"fontSize": "13px", "color": "#716F82", "lineHeight": "1.5"}}>
                        {s.label}
                      </div>
                    </div>
                    {s.notLast ? (
                      <>
                      <div className="co-workflow-arrow" style={cssToObj(s.arrowStyle)}>
                        {" »»» "}
                        {s.isDone ? (
                          <>
                          <span style={{"position": "absolute", "top": "6px", "left": "0", "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#C49E62", "animation": "leadDotTravel 1.1s linear infinite"}} />
                          </>
                        ) : null}
                      </div>
                      </>
                    ) : null}
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div id="wf-voice" data-reveal style={{"scrollMarginTop": "100px"}}>
            <h3 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(22px,2.6vw,28px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 14px", "color": "#1A172C"}}>
              {"How the "}
              <span style={{"fontStyle": "italic", "background": "linear-gradient(120deg,#471E86,#7447C8 52%,#C49E62)", "WebkitBackgroundClip": "text", "backgroundClip": "text", "WebkitTextFillColor": "transparent"}}>
                Voice Agent
              </span>
              {" works"}
            </h3>
            <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.7", "margin": "0 0 28px", "maxWidth": "640px"}}>
              {"Human-sounding voice agents that answer in under a second, qualify prospects, book meetings, and handle support, day or night, in any timezone. No voicemail, no hold music, no missed opportunities while your team is offline. "}
              <a onClick={v.goVoiceTitle} style={{"color": "#471E86", "fontWeight": "600", "cursor": "pointer", "borderBottom": "1px solid #471E86"}}>
                Learn more →
              </a>
            </p>
            <div className="co-workflow-panel" style={{"background": "#FAF9FF", "border": "1px solid #D8D5E2", "borderRadius": "28px", "padding": "clamp(28px,4vw,44px) clamp(20px,3vw,32px)"}}>
              <div style={{"display": "flex", "flexWrap": "nowrap", "justifyContent": "center", "alignItems": "flex-start"}}>
                {(v.homeVoiceFlow || []).map((s, $index) => (
                  <Fragment key={$index}>
                  <div style={{"display": "flex", "alignItems": "flex-start", "minWidth": "0"}}>
                    <div onClick={s.onClick} style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "width": "clamp(70px,10vw,150px)", "flexShrink": "1", "minWidth": "0", "cursor": "pointer"}}>
                      <div className="co-workflow-node" style={cssToObj(`width:clamp(38px,5.5vw,64px);height:clamp(38px,5.5vw,64px);position:relative;${s.circleStyle ?? ""}display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:clamp(8px,1.6vw,16px)`)}>
                        <div style={cssToObj(s.ringStyle)} />
                        {s.isStep1 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5.5-4-7-7l2-2-2-4z" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep2 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep3 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep4 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep5 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M3 10h18M8 3v3M16 3v3" />
                            <path d="m9 14 2 2 4-4" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep6 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2 11 13" />
                            <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                          </svg>
                          </>
                        ) : null}
                      </div>
                      <div className="co-workflow-word" style={cssToObj(`font-size:clamp(11px,1.4vw,15.5px);margin-bottom:4px;letter-spacing:-.01em;white-space:nowrap;${s.wordStyle ?? ""}`)}>
                        {s.word}
                      </div>
                      <div className="co-workflow-label" style={{"fontSize": "clamp(9px,1vw,13px)", "color": "#716F82", "lineHeight": "1.4"}}>
                        {s.label}
                      </div>
                    </div>
                    {s.notLast ? (
                      <>
                      <div className="co-workflow-arrow" style={cssToObj(`font-size:clamp(10px,1.4vw,18px);margin:clamp(14px,2.2vw,22px) clamp(2px,.6vw,6px) 0;${s.arrowStyle ?? ""}`)}>
                        {" »»» "}
                        {s.isDone ? (
                          <>
                          <span style={{"position": "absolute", "top": "6px", "left": "0", "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#C49E62", "animation": "leadDotTravel 1.1s linear infinite"}} />
                          </>
                        ) : null}
                      </div>
                      </>
                    ) : null}
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div id="wf-follow" data-reveal style={{"scrollMarginTop": "100px"}}>
            <h3 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(22px,2.6vw,28px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 14px", "color": "#1A172C"}}>
              {"How "}
              <span style={{"fontStyle": "italic", "background": "linear-gradient(120deg,#471E86,#7447C8 52%,#C49E62)", "WebkitBackgroundClip": "text", "backgroundClip": "text", "WebkitTextFillColor": "transparent"}}>
                Follow Up
              </span>
              {" works"}
            </h3>
            <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.7", "margin": "0 0 28px", "maxWidth": "640px"}}>
              {"Personalized email, SMS, and WhatsApp sequences, timed by AI, because 80% of sales close between the 5th and 12th touch, and most reps stop after two. CircleOn makes every one of those touches without you lifting a finger. "}
              <a onClick={v.goFollowTitle} style={{"color": "#471E86", "fontWeight": "600", "cursor": "pointer", "borderBottom": "1px solid #471E86"}}>
                Learn more →
              </a>
            </p>
            <div className="co-workflow-panel" style={{"background": "#FAF9FF", "border": "1px solid #D8D5E2", "borderRadius": "28px", "padding": "clamp(28px,4vw,44px) clamp(20px,3vw,32px)"}}>
              <div style={{"display": "flex", "flexWrap": "nowrap", "justifyContent": "center", "alignItems": "flex-start"}}>
                {(v.homeFollowFlow || []).map((s, $index) => (
                  <Fragment key={$index}>
                  <div style={{"display": "flex", "alignItems": "flex-start", "minWidth": "0"}}>
                    <div onClick={s.onClick} style={{"display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "width": "clamp(70px,10vw,150px)", "flexShrink": "1", "minWidth": "0", "cursor": "pointer"}}>
                      <div className="co-workflow-node" style={cssToObj(`width:clamp(38px,5.5vw,64px);height:clamp(38px,5.5vw,64px);position:relative;${s.circleStyle ?? ""}display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:clamp(8px,1.6vw,16px)`)}>
                        <div style={cssToObj(s.ringStyle)} />
                        {s.isStep1 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep2 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2h12M6 22h12M6 2c0 6 12 6 12 0M6 22c0-6 12-6 12 0" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep3 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16v16H4z" />
                            <path d="M4 4l8 8 8-8" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep4 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep5 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M3 10h18M8 3v3M16 3v3" />
                            <path d="m9 14 2 2 4-4" />
                          </svg>
                          </>
                        ) : null}
                        {s.isStep6 ? (
                          <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColorB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          </>
                        ) : null}
                      </div>
                      <div className="co-workflow-word" style={cssToObj(`font-size:clamp(11px,1.4vw,15.5px);margin-bottom:4px;letter-spacing:-.01em;white-space:nowrap;${s.wordStyle ?? ""}`)}>
                        {s.word}
                      </div>
                      <div className="co-workflow-label" style={{"fontSize": "clamp(9px,1vw,13px)", "color": "#716F82", "lineHeight": "1.4"}}>
                        {s.label}
                      </div>
                    </div>
                    {s.notLast ? (
                      <>
                      <div className="co-workflow-arrow" style={cssToObj(`font-size:clamp(10px,1.4vw,18px);margin:clamp(14px,2.2vw,22px) clamp(2px,.6vw,6px) 0;${s.arrowStyle ?? ""}`)}>
                        {" »»» "}
                        {s.isDone ? (
                          <>
                          <span style={{"position": "absolute", "top": "6px", "left": "0", "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#C49E62", "animation": "leadDotTravel 1.1s linear infinite"}} />
                          </>
                        ) : null}
                      </div>
                      </>
                    ) : null}
                  </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div data-reveal style={{"marginTop": "clamp(56px,7vw,88px)"}}>
            <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "marginBottom": "14px"}}>
              <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
                Voice Library
              </span>
            </div>
            <h3 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(24px,2.8vw,32px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 8px", "color": "#1A172C"}}>
              {"Meet "}
              <span style={{"fontStyle": "italic", "background": "linear-gradient(120deg,#471E86,#7447C8 52%,#C49E62)", "WebkitBackgroundClip": "text", "backgroundClip": "text", "WebkitTextFillColor": "transparent"}}>
                the voices
              </span>
            </h3>
            <p style={{"fontSize": "15.5px", "color": "#423F54", "lineHeight": "1.6", "margin": "0 0 32px", "maxWidth": "520px"}}>
              Every agent ships with a tunable voice profile, warmth, pace, and depth dialed to the moment in the call.
            </p>
            <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(260px,1fr))", "gap": "20px"}}>
              {(v.voices || []).map((v, $index) => (
                <Fragment key={$index}>
                <div className="co-voice-card" style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "26px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "14px", "marginBottom": "22px"}}>
                    <div style={cssToObj(`width:50px;height:50px;border-radius:50%;flex-shrink:0;position:relative;background:${v.orb ?? ""};box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)`)}>
                      <div style={{"position": "absolute", "inset": "8px", "borderRadius": "50%", "background": "radial-gradient(circle at 38% 32%,rgba(255,255,255,.8),rgba(255,255,255,0) 60%)"}} />
                    </div>
                    <div>
                      <div className="co-voice-name" style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "19px", "color": "#1A172C"}}>
                        {v.name}
                      </div>
                      <div className="co-voice-tag" style={{"fontSize": "11px", "fontWeight": "600", "letterSpacing": ".06em", "color": "#716F82", "marginTop": "3px"}}>
                        {v.tag}
                      </div>
                    </div>
                  </div>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "10px", "marginBottom": "18px"}}>
                    <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
                      <span className="co-voice-meter-label" style={{"width": "54px", "fontSize": "10.5px", "fontWeight": "600", "letterSpacing": ".05em", "color": "#9E9CAD", "flexShrink": "0"}}>
                        WARMTH
                      </span>
                      {' '}
                      <div className="co-voice-meter" style={{"flex": "1", "height": "3px", "borderRadius": "2px", "background": "#ECE9F6", "position": "relative"}}>
                        <div style={cssToObj(`position:absolute;inset:0;width:${v.warmth ?? ""}%;border-radius:2px;background:linear-gradient(90deg,#471E86,#945FF9)`)} />
                      </div>
                    </div>
                    <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
                      <span className="co-voice-meter-label" style={{"width": "54px", "fontSize": "10.5px", "fontWeight": "600", "letterSpacing": ".05em", "color": "#9E9CAD", "flexShrink": "0"}}>
                        PACE
                      </span>
                      {' '}
                      <div className="co-voice-meter" style={{"flex": "1", "height": "3px", "borderRadius": "2px", "background": "#ECE9F6", "position": "relative"}}>
                        <div style={cssToObj(`position:absolute;inset:0;width:${v.pace ?? ""}%;border-radius:2px;background:linear-gradient(90deg,#471E86,#945FF9)`)} />
                      </div>
                    </div>
                    <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
                      <span className="co-voice-meter-label" style={{"width": "54px", "fontSize": "10.5px", "fontWeight": "600", "letterSpacing": ".05em", "color": "#9E9CAD", "flexShrink": "0"}}>
                        DEPTH
                      </span>
                      {' '}
                      <div className="co-voice-meter" style={{"flex": "1", "height": "3px", "borderRadius": "2px", "background": "#ECE9F6", "position": "relative"}}>
                        <div style={cssToObj(`position:absolute;inset:0;width:${v.depth ?? ""}%;border-radius:2px;background:linear-gradient(90deg,#471E86,#945FF9)`)} />
                      </div>
                    </div>
                  </div>
                  <div className="co-voice-divider" style={{"height": "1px", "background": "#D8D5E2", "marginBottom": "16px"}} />
                  <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
                    <span className="co-voice-meta" style={{"fontFamily": "'DM Mono',monospace", "fontSize": "11px", "color": "#716F82", "flexShrink": "0"}}>
                      {v.lang}{" · "}{v.dur}
                    </span>
                    {' '}
                    <div className="co-voice-wave" style={{"flex": "1", "display": "flex", "alignItems": "center", "gap": "2px", "height": "17px", "overflow": "hidden"}}>
                      <span style={{"width": "2px", "height": "3px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "7px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "12px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "11px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "14px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "13px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "17px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "15px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "15px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "16px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "17px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "16px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "14px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "14px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "12px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "8px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "9px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                      <span style={{"width": "2px", "height": "5px", "background": "#D8D5E2", "borderRadius": "1px", "flexShrink": "0"}} />
                    </div>
                    <div className="co-voice-play" style={{"width": "30px", "height": "30px", "borderRadius": "50%", "background": "#F4F2FB", "border": "1px solid #D8D5E2", "display": "flex", "alignItems": "center", "justifyContent": "center", "flexShrink": "0", "cursor": "pointer", "fontSize": "10.5px", "color": "#471E86"}}>
                      ▶
                    </div>
                  </div>
                </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
        <section id="waitlist" style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(40px,5vw,72px) 24px clamp(64px,8vw,110px)"}}>
          <div className="co-waitlist-panel" data-reveal style={{"position": "relative", "overflow": "hidden", "background": "radial-gradient(85% 65% at 100% 0%, oklch(0.42 0.17 295 / 0.60), transparent 62%),radial-gradient(70% 60% at 0% 100%, oklch(0.5 0.09 82 / 0.14), transparent 60%),linear-gradient(155deg, oklch(0.21 0.05 292), oklch(0.155 0.045 292))", "border": "1px solid oklch(0.42 0.06 295 / 0.35)", "boxShadow": "0 40px 90px -40px oklch(0.36 0.16 295 / 0.55)", "padding": "clamp(48px,7vw,84px) clamp(24px,4vw,64px)", "borderRadius": "24px"}}>
            <div style={{"position": "relative", "maxWidth": "500px", "margin": "0 auto", "textAlign": "center"}}>
              <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginBottom": "20px"}}>
                <span style={{"fontSize": "12px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
                  Early Access
                </span>
              </div>
              <h2 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(28px,3.6vw,42px)", "letterSpacing": "-.01em", "fontWeight": "400", "color": "#fff", "margin": "0 0 14px"}}>
                Join the CircleOn Waitlist
              </h2>
              <p style={{"fontSize": "16.5px", "color": "#9E9CAD", "lineHeight": "1.6", "margin": "0 0 40px"}}>
                Get early access to our AI platform before public launch.
              </p>
              {v.submitted ? (
                <>
                <div style={{"border": "1px solid rgba(196,158,98,.5)", "padding": "38px 28px"}}>
                  <div style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "32px", "color": "#C49E62", "marginBottom": "10px"}}>
                    ✓
                  </div>
                  <div style={{"fontSize": "19px", "fontWeight": "600", "color": "#fff", "marginBottom": "6px"}}>
                    You're on the list
                  </div>
                  <div style={{"fontSize": "14.5px", "color": "#9E9CAD"}}>
                    We'll email you the moment early access opens.
                  </div>
                </div>
                </>
              ) : null}
              {v.notSubmitted ? (
                <>
                <form onSubmit={v.submit} style={{"display": "flex", "flexDirection": "column", "gap": "20px", "textAlign": "left"}}>
                  <input value={v.form.name} onChange={v.onName} placeholder="Full name" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                  {' '}
                  <input value={v.form.email} onChange={v.onEmail} type="email" placeholder="Email address" required style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                  {' '}
                  <input value={v.form.company} onChange={v.onCompany} placeholder="Company name" style={{"width": "100%", "padding": "12px 2px", "border": "none", "borderBottom": "1px solid rgba(255,255,255,.25)", "background": "transparent", "fontSize": "15px", "color": "#fff", "outline": "none"}} />
                  {' '}
                  <button type="submit" style={{"marginTop": "14px", "width": "100%", "padding": "16px", "border": "1px solid #C49E62", "borderRadius": "10px", "fontWeight": "600", "fontSize": "15px", "letterSpacing": ".02em", "color": "#471E86", "background": "#C49E62", "cursor": "pointer", "transition": "background .2s,color .2s"}} className="co-pc6e9be co-on-gold">
                    Join Waitlist
                  </button>
                  {' '}
                  <div style={{"textAlign": "center", "fontSize": "13px", "color": "#716F82", "marginTop": "2px"}}>
                    No spam. Early access only.
                  </div>
                </form>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
