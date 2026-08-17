// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';

export default function Footer({ v }) {
  return (
    <>
      <footer style={{"borderTop": "1px solid #F1EEFD", "background": "#FAF9FF"}}>
        <div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "clamp(48px,6vw,72px) 24px 40px", "display": "grid", "gridTemplateColumns": "1.4fr 1fr 1fr 1fr", "gap": "40px"}}>
          <div style={{"minWidth": "220px"}}>
            <div style={{"display": "flex", "alignItems": "center", "gap": "11px", "marginBottom": "16px"}}>
              <span style={{"width": "26px", "height": "26px", "borderRadius": "50%", "border": "2.5px solid #7447C8", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
                <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#C49E62"}} />
              </span>
              {' '}
              <span style={{"fontWeight": "600", "fontSize": "20px", "letterSpacing": "-.02em"}}>
                Circle
                <span style={{"color": "#7447C8"}}>
                  On
                </span>
              </span>
            </div>
            <p className="co-footer-copy" style={{"fontSize": "14.5px", "color": "#716F82", "lineHeight": "1.6", "maxWidth": "280px", "margin": "0 0 20px"}}>
              AI agents that generate leads, answer calls, and follow up automatically, so your team can focus on what matters.
            </p>
            <div style={{"display": "flex", "gap": "10px"}}>
              {(v.socials || []).map((soc, $index) => (
                <Fragment key={$index}>
                <a style={{"width": "38px", "height": "38px", "borderRadius": "10px", "background": "#fff", "border": "1px solid #E9E4FA", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12px", "fontWeight": "600", "color": "#7447C8", "cursor": "pointer"}} className="co-pc9a608">
                  {soc.short}
                </a>
                </Fragment>
              ))}
            </div>
          </div>
          {(v.footerCols || []).map((col, $index) => (
            <Fragment key={$index}>
            <div>
              <div className="co-footer-title" style={{"fontSize": "13px", "fontWeight": "600", "textTransform": "uppercase", "letterSpacing": ".06em", "color": "#1A172C", "marginBottom": "16px"}}>
                {col.title}
              </div>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "11px"}}>
                {(col.links || []).map((ln, $index) => (
                  <Fragment key={$index}>
                  <a className="co-footer-link co-pcc1d41" onClick={ln.onClick} style={{"fontSize": "14.5px", "color": "#716F82", "cursor": "pointer"}}>
                    {ln.label}
                  </a>
                  </Fragment>
                ))}
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        <div className="co-footer-legal" style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "20px 24px 40px", "borderTop": "1px solid #F1EEFD", "fontSize": "13.5px", "color": "#716F82"}}>
          © 2026 CircleOn. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}
