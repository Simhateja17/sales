// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';

export default function Stories({ v }) {
  return (
    <>
      <div style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        {' '}
        <div style={{"fontSize": "13px", "fontWeight": "600", "letterSpacing": ".08em", "textTransform": "uppercase", "color": "#C49E62", "marginBottom": "14px"}}>
          Customer Stories
        </div>
        <h1 data-reveal style={{"fontFamily": "'Fraunces',serif", "fontSize": "clamp(32px,4.4vw,52px)", "letterSpacing": "-.02em", "fontWeight": "400", "margin": "0 0 44px", "color": "#1A172C", "maxWidth": "760px", "lineHeight": "1.08"}}>
          Teams growing faster with CircleOn
        </h1>
        {/* Metrics and quotes stay hidden until they are real: the export
            shipped invented customers and unproven figures. */}
        {v.metrics && v.metrics.length ? (
        <>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(240px,1fr))", "gap": "18px", "marginBottom": "48px"}}>
          {(v.metrics || []).map((m, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "16px", "padding": "28px", "textAlign": "center"}}>
              <div style={{"fontFamily": "'Fraunces',serif", "fontSize": "38px", "fontWeight": "400", "color": "#1A172C", "letterSpacing": "-.01em"}}>
                {m.value}
              </div>
              <div style={{"fontSize": "14.5px", "color": "#423F54", "fontWeight": "600", "marginTop": "6px"}}>
                {m.label}
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        </>
        ) : null}
        {v.stories && v.stories.length ? (
        <>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(300px,1fr))", "gap": "20px"}}>
          {(v.stories || []).map((st, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "22px", "padding": "30px", "boxShadow": "0 20px 44px -30px rgba(71,30,134,.4)"}}>
              <div style={{"fontSize": "17px", "lineHeight": "1.6", "color": "#1A172C", "fontWeight": "600", "marginBottom": "22px"}}>
                "{st.quote}"
              </div>
              <div style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
                <div style={{"width": "44px", "height": "44px", "borderRadius": "50%", "background": "linear-gradient(150deg,#7447C8,#C49E62)", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "#fff", "fontWeight": "600"}}>
                  {st.initials}
                </div>
                <div>
                  <div style={{"fontSize": "15px", "fontWeight": "600", "color": "#1A172C"}}>
                    {st.name}
                  </div>
                  <div style={{"fontSize": "13px", "color": "#716F82", "fontWeight": "600"}}>
                    {st.role}
                  </div>
                </div>
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        </>
        ) : null}
        {!(v.stories && v.stories.length) ? (
        <p data-reveal style={{"fontSize": "16.5px", "lineHeight": "1.6", "color": "#423F54", "margin": "0", "maxWidth": "640px"}}>
          Customer stories are on the way.
        </p>
        ) : null}
      </div>
    </>
  );
}
