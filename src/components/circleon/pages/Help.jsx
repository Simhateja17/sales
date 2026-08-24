// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';

export default function Help({ v }) {
  return (
    <>
      <div style={{"maxWidth": "960px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        {' '}
        <div data-reveal style={{"textAlign": "center", "marginBottom": "40px"}}>
          <div style={{"fontSize": "13px", "fontWeight": "600", "letterSpacing": ".08em", "textTransform": "uppercase", "color": "#C49E62", "marginBottom": "14px"}}>
            Help Center
          </div>
          <h1 style={{"fontFamily": "'Cormorant Garamond',serif", "fontSize": "clamp(30px,4vw,46px)", "letterSpacing": "-.02em", "fontWeight": "400", "margin": "0 0 24px", "color": "#1A172C"}}>
            How can we help?
          </h1>
          <div style={{"maxWidth": "560px", "margin": "0 auto", "position": "relative"}}>
            <input placeholder="Search articles, guides, and docs…" style={{"width": "100%", "padding": "17px 20px 17px 48px", "borderRadius": "15px", "border": "1px solid #E9E4FA", "background": "#fff", "fontSize": "16px", "color": "#1A172C", "outline": "none", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}} />
            {' '}
            <span style={{"position": "absolute", "left": "18px", "top": "50%", "transform": "translateY(-50%)", "color": "#9E9CAD"}}>
              ⌕
            </span>
          </div>
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(240px,1fr))", "gap": "18px", "marginBottom": "48px"}}>
          {(v.helpCats || []).map((h, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "padding": "26px", "boxShadow": "0 16px 34px -30px rgba(71,30,134,.5)", "cursor": "pointer", "transition": "transform .2s"}} className="co-p8d5378">
              <div style={{"fontSize": "17px", "fontWeight": "600", "color": "#1A172C", "marginBottom": "8px"}}>
                {h.title}
              </div>
              <div style={{"fontSize": "14px", "color": "#423F54", "lineHeight": "1.55", "marginBottom": "12px"}}>
                {h.desc}
              </div>
              <div style={{"fontSize": "13px", "fontWeight": "500", "color": "#C49E62"}}>
                {h.count}{" articles →"}
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        <div data-reveal style={{"textAlign": "center", "background": "#FAF9FF", "border": "1px solid #F1EEFD", "borderRadius": "22px", "padding": "40px 24px"}}>
          <div style={{"fontSize": "20px", "fontWeight": "600", "color": "#1A172C", "marginBottom": "8px"}}>
            Still need help?
          </div>
          <p style={{"fontSize": "15px", "color": "#423F54", "margin": "0 0 22px"}}>
            Our support team replies within one business day.
          </p>
          {' '}
          <a style={{"display": "inline-flex", "padding": "14px 26px", "borderRadius": "10px", "fontWeight": "600", "color": "#fff", "background": "#1A172C", "cursor": "pointer", "transition": ".2s"}} className="co-pf8b4a8">
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}
