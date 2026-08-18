// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';

export default function About({ v }) {
  return (
    <>
      <div style={{"maxWidth": "1000px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        {' '}
        <div style={{"fontSize": "13px", "fontWeight": "600", "letterSpacing": ".08em", "textTransform": "uppercase", "color": "#C49E62", "marginBottom": "14px"}}>
          About CircleOn
        </div>
        <h1 data-reveal style={{"fontFamily": "'Fraunces',serif", "fontSize": "clamp(32px,4.4vw,52px)", "letterSpacing": "-.02em", "fontWeight": "400", "margin": "0 0 20px", "color": "#1A172C", "maxWidth": "760px", "lineHeight": "1.08"}}>
          We're building the AI workforce for growing businesses
        </h1>
        <p data-reveal style={{"fontSize": "19px", "lineHeight": "1.65", "color": "#423F54", "maxWidth": "680px", "margin": "0 0 48px"}}>
          CircleOn started with a simple belief: small teams shouldn't have to choose between growth and sanity. We build AI agents that handle the repetitive work of finding, calling, and following up with customers, so people can focus on what only people can do.
        </p>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(240px,1fr))", "gap": "20px", "marginBottom": "56px"}}>
          <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "28px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
            <div style={{"fontSize": "18px", "fontWeight": "600", "color": "#7447C8", "marginBottom": "10px"}}>
              Our Mission
            </div>
            <p style={{"margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#423F54"}}>
              Give every business an AI team that works around the clock, accessible, affordable, and effortless to deploy.
            </p>
          </div>
          <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "28px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
            <div style={{"fontSize": "18px", "fontWeight": "600", "color": "#7447C8", "marginBottom": "10px"}}>
              Our Vision
            </div>
            <p style={{"margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#423F54"}}>
              A world where no opportunity is missed because someone was too busy to follow up.
            </p>
          </div>
          <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "28px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
            <div style={{"fontSize": "18px", "fontWeight": "600", "color": "#7447C8", "marginBottom": "10px"}}>
              Our Values
            </div>
            <p style={{"margin": "0", "fontSize": "15px", "lineHeight": "1.6", "color": "#423F54"}}>
              Trust first, ship fast, stay human. We build AI that's transparent and always in your control.
            </p>
          </div>
        </div>
        {/* The export listed four invented people here. Add the real
            team to `team` in CircleOn.jsx and this section returns. */}
        {v.team && v.team.length ? (
        <>
        <h2 data-reveal style={{"fontFamily": "'Fraunces',serif", "fontSize": "clamp(22px,2.6vw,30px)", "fontWeight": "400", "letterSpacing": "-.02em", "color": "#1A172C", "margin": "0 0 24px"}}>
          The team
        </h2>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(180px,1fr))", "gap": "18px"}}>
          {(v.team || []).map((t, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#FAF9FF", "border": "1px solid #F1EEFD", "borderRadius": "18px", "padding": "22px", "textAlign": "center"}}>
              <div style={{"width": "60px", "height": "60px", "borderRadius": "50%", "margin": "0 auto 14px", "background": "linear-gradient(150deg,#7447C8,#C49E62)", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "#fff", "fontWeight": "600", "fontSize": "20px"}}>
                {t.initials}
              </div>
              <div style={{"fontSize": "16px", "fontWeight": "600", "color": "#1A172C"}}>
                {t.name}
              </div>
              <div style={{"fontSize": "13.5px", "color": "#716F82", "fontWeight": "600"}}>
                {t.role}
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        </>
        ) : null}
      </div>
    </>
  );
}
