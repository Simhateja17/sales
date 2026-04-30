const logos = [
  { glyph: 'N', name: 'Northwind' },
  { glyph: 'L', name: 'Lumière' },
  { glyph: 'A', name: 'Atelier' },
  { glyph: 'P', name: 'Parallax' },
  { glyph: 'M', name: 'Morrow' },
  { glyph: 'V', name: 'Verdant' },
];

export default function Trusted() {
  return (
    <section className="trusted">
      <div className="container">
        <div className="trusted-label">Trusted by revenue teams at</div>
        <div className="logos">
          {logos.map(l => (
            <span key={l.name} className="logo-mark">
              <span className="glyph">{l.glyph}</span>{l.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
