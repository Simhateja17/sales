// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
import { Fragment } from 'react';
import { cssToObj } from '../cssToObj';

export default function Blog({ v }) {
  return (
    <>
      <div style={{"maxWidth": "1100px", "margin": "0 auto", "padding": "clamp(48px,6vw,92px) 24px clamp(64px,8vw,100px)"}}>
        <a onClick={v.gotoHome} style={{"fontSize": "13.5px", "fontWeight": "600", "color": "#1A172C", "cursor": "pointer", "marginBottom": "30px", "display": "inline-block", "borderBottom": "1px solid #1A172C", "paddingBottom": "2px"}}>
          ← Back to home
        </a>
        {' '}
        <div data-reveal style={{"textAlign": "center", "maxWidth": "640px", "margin": "0 auto 40px"}}>
          <div style={{"fontSize": "13px", "fontWeight": "600", "letterSpacing": ".08em", "textTransform": "uppercase", "color": "#C49E62", "marginBottom": "14px"}}>
            Our Blog
          </div>
          <h1 style={{"fontFamily": "'Fraunces',serif", "fontSize": "clamp(32px,4.4vw,52px)", "letterSpacing": "-.02em", "fontWeight": "400", "margin": "0 0 16px", "color": "#1A172C", "lineHeight": "1.12"}}>
            Insights and inspiration, explore our blog
          </h1>
          <p style={{"fontSize": "16.5px", "lineHeight": "1.6", "color": "#423F54", "margin": "0 0 32px"}}>
            Ideas on AI, sales, and automation to help small teams sell without hiring.
          </p>
          <div style={{"maxWidth": "440px", "margin": "0 auto", "position": "relative"}}>
            <input placeholder="Search for blogs…" style={{"width": "100%", "padding": "15px 20px 15px 46px", "borderRadius": "12px", "border": "1px solid #E9E4FA", "background": "#fff", "fontSize": "15px", "color": "#1A172C", "outline": "none", "boxShadow": "0 1px 2px rgba(21,14,42,.04)"}} />
            {' '}
            <span style={{"position": "absolute", "left": "17px", "top": "50%", "transform": "translateY(-50%)", "color": "#9E9CAD"}}>
              ⌕
            </span>
          </div>
        </div>
        <div data-reveal style={{"display": "flex", "flexWrap": "wrap", "justifyContent": "center", "gap": "10px", "marginBottom": "44px"}}>
          {(v.categories || []).map((c, $index) => (
            <Fragment key={$index}>
            <span style={cssToObj(c.chipStyle)}>
              {c.label}
            </span>
            </Fragment>
          ))}
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(280px,1fr))", "gap": "22px", "marginBottom": "clamp(64px,8vw,96px)"}}>
          {(v.posts || []).map((p, $index) => (
            <Fragment key={$index}>
            <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "overflow": "hidden", "boxShadow": "0 16px 34px -30px rgba(71,30,134,.5)", "cursor": "pointer", "transition": "transform .2s"}} className="co-p8d5378">
              <div style={cssToObj(`height:150px;background:${p.thumbGrad ?? ""}`)} />
              <div style={{"padding": "24px"}}>
                <div style={{"fontSize": "17px", "fontWeight": "600", "color": "#1A172C", "lineHeight": "1.35", "marginBottom": "8px"}}>
                  {p.title}
                </div>
                <div style={{"fontSize": "14px", "color": "#716F82", "lineHeight": "1.55", "marginBottom": "18px"}}>
                  {p.excerpt}
                </div>
                <div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "borderTop": "1px solid #F4F2FB", "paddingTop": "14px"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
                    <span style={cssToObj(`width:26px;height:26px;border-radius:50%;background:${p.avatarGrad ?? ""};color:#fff;font-size:10.5px;font-weight:600;display:flex;align-items:center;justify-content:center`)}>
                      {p.author.initials}
                    </span>
                    {' '}
                    <span style={{"fontSize": "13.5px", "fontWeight": "500", "color": "#1A172C"}}>
                      {p.author.name}
                    </span>
                  </div>
                  {' '}
                  <span style={{"fontSize": "12.5px", "color": "#716F82"}}>
                    {p.read}
                  </span>
                </div>
              </div>
            </div>
            </Fragment>
          ))}
        </div>
        {/* Held back until there are real posts. The export shipped
            invented articles bylined to invented authors, with no article
            pages behind them, so `featured` is null and this block is
            skipped rather than rendering an empty card. */}
        {v.featured ? (
        <>
        <div data-reveal style={{"textAlign": "center", "maxWidth": "560px", "margin": "0 auto 40px"}}>
          <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginBottom": "16px"}}>
            <span style={{"fontSize": "12.5px", "fontWeight": "500", "letterSpacing": ".16em", "textTransform": "uppercase", "color": "#C49E62"}}>
              Featured Blogs
            </span>
          </div>
          <h2 style={{"fontFamily": "'Fraunces',serif", "fontSize": "clamp(24px,3vw,34px)", "letterSpacing": "-.01em", "fontWeight": "400", "margin": "0 0 14px", "color": "#1A172C"}}>
            Dive into our top blogs
          </h2>
          <p style={{"fontSize": "16px", "color": "#423F54", "lineHeight": "1.6", "margin": "0"}}>
            Our most-read pieces on selling smarter with AI.
          </p>
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "1.1fr 1fr", "gap": "22px"}}>
          <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "20px", "overflow": "hidden", "boxShadow": "0 24px 50px -34px rgba(71,30,134,.5)", "cursor": "pointer", "display": "flex", "flexDirection": "column"}}>
            <div style={{"padding": "26px 26px 0"}}>
              <div style={{"fontSize": "12px", "fontWeight": "600", "color": "#C49E62", "textTransform": "uppercase", "letterSpacing": ".06em", "marginBottom": "10px"}}>
                {v.featured.cat}{" · "}{v.featured.read}
              </div>
              <h3 style={{"fontFamily": "'Fraunces',serif", "fontSize": "22px", "fontWeight": "400", "letterSpacing": "-.01em", "margin": "0 0 10px", "color": "#1A172C"}}>
                {v.featured.title}
              </h3>
              <p style={{"fontSize": "14.5px", "lineHeight": "1.6", "color": "#423F54", "margin": "0 0 20px"}}>
                {v.featured.excerpt}
              </p>
            </div>
            <div style={{"height": "220px", "background": "linear-gradient(135deg,#471E86,#7447C8)", "margin": "0 26px 26px", "borderRadius": "14px"}} />
            <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "padding": "0 26px 26px"}}>
              <span style={{"width": "26px", "height": "26px", "borderRadius": "50%", "background": "linear-gradient(155deg,#945FF9,#7447C8)", "color": "#fff", "fontSize": "10.5px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>
                {v.featured.author.initials}
              </span>
              {' '}
              <span style={{"fontSize": "13.5px", "fontWeight": "500", "color": "#1A172C"}}>
                {v.featured.author.name}
              </span>
            </div>
          </div>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "18px"}}>
            {(v.sidePosts || []).map((p, $index) => (
              <Fragment key={$index}>
              <div data-reveal style={{"background": "#fff", "border": "1px solid #D8D5E2", "borderRadius": "16px", "padding": "16px", "display": "flex", "alignItems": "center", "gap": "16px", "cursor": "pointer", "boxShadow": "0 12px 26px -22px rgba(71,30,134,.4)"}}>
                <div style={cssToObj(`width:76px;height:60px;border-radius:10px;background:${p.thumbGrad ?? ""};flex-shrink:0`)} />
                <div style={{"flex": "1", "minWidth": "0"}}>
                  <div style={{"fontSize": "11.5px", "fontWeight": "600", "color": "#C49E62", "textTransform": "uppercase", "letterSpacing": ".05em", "marginBottom": "5px"}}>
                    {p.cat}{" · "}{p.read}
                  </div>
                  <div style={{"fontSize": "14.5px", "fontWeight": "600", "color": "#1A172C", "lineHeight": "1.3"}}>
                    {p.title}
                  </div>
                </div>
                {' '}
                <span style={{"fontSize": "16px", "color": "#C49E62", "flexShrink": "0"}}>
                  →
                </span>
              </div>
              </Fragment>
            ))}
            <div data-reveal style={{"background": "linear-gradient(150deg,#F1EEFD,#F8EED5)", "borderRadius": "16px", "padding": "18px", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "minHeight": "140px", "cursor": "pointer", "boxShadow": "0 12px 26px -22px rgba(71,30,134,.4)"}}>
              <div style={{"fontSize": "11.5px", "fontWeight": "600", "color": "#815B1F", "textTransform": "uppercase", "letterSpacing": ".05em", "marginBottom": "5px"}}>
                {v.lastSidePost.cat}{" · "}{v.lastSidePost.read}
              </div>
              <div style={{"fontSize": "15px", "fontWeight": "600", "color": "#1A172C", "lineHeight": "1.3"}}>
                {v.lastSidePost.title}
              </div>
            </div>
          </div>
        </div>
        </>
        ) : null}
      </div>
    </>
  );
}
