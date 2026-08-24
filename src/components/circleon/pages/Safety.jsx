// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';

export default function Safety({ v }) {
  return (
    <>
      <div style={{"maxWidth": "1000px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        {' '}
        <div style={{"fontSize": "13px", "fontWeight": "600", "letterSpacing": ".08em", "textTransform": "uppercase", "color": "#C49E62", "marginBottom": "14px"}}>
          Safety & Trust
        </div>
        <h1 data-reveal style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(32px,4.4vw,52px)", "letterSpacing": "-.02em", "fontWeight": "400", "margin": "0 0 20px", "color": "#1A172C", "maxWidth": "760px", "lineHeight": "1.08"}}>
          Responsible AI, built on trust
        </h1>
        <p data-reveal style={{"fontSize": "19px", "lineHeight": "1.65", "color": "#423F54", "maxWidth": "680px", "margin": "0 0 48px"}}>
          Your data and your customers' trust are the foundation of everything we build. Here's how we keep both protected.
        </p>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(260px,1fr))", "gap": "20px"}}>
          {(v.safety || []).map((s, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "26px", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}}>
              <div style={{"display": "flex", "alignItems": "center", "gap": "9px", "marginBottom": "10px"}}>
                <span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "#C49E62"}} />
                <span style={{"fontSize": "17px", "fontWeight": "600", "color": "#1A172C"}}>
                  {s.title}
                </span>
              </div>
              <p style={{"margin": "0", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#423F54"}}>
                {s.desc}
              </p>
            </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
