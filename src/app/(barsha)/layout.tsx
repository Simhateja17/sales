import './barsha.css';

export default function BarshaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="barsha-root">{children}</div>
  );
}
