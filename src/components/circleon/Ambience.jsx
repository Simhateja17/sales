// Ported from the CircleOn design export. Structure and styling are a
// faithful copy; see components/circleon/CircleOn.jsx for the state behind `v`.
export default function Ambience() {
  return (
    <>
      <div className="co-theme-ambience" aria-hidden="true" style={{"position": "fixed", "inset": "0", "pointerEvents": "none", "zIndex": "0", "background": "radial-gradient(60% 50% at 80% 0%, oklch(0.82 0.12 295 / 0.35), transparent 60%),radial-gradient(50% 40% at 10% 30%, oklch(0.88 0.08 320 / 0.28), transparent 65%),radial-gradient(40% 30% at 50% 100%, oklch(0.85 0.06 85 / 0.20), transparent 70%)"}} />
      <div className="co-theme-grain" aria-hidden="true" style={{"position": "fixed", "inset": "0", "pointerEvents": "none", "zIndex": "1", "opacity": ".35", "mixBlendMode": "multiply", "backgroundImage": "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNDAnIGhlaWdodD0nMjQwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC45JyBudW1PY3RhdmVzPScyJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPScwIDAgMCAwIDAuMyAgMCAwIDAgMCAwLjI1ICAwIDAgMCAwIDAuNCAgMCAwIDAgMC4wNiAwJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI24pJy8+PC9zdmc+')"}} />
    </>
  );
}
