import { BarshaBody } from './BarshaBody';
import './barsha.css';

export default function BarshaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BarshaBody />
      <div className="barsha-root">{children}</div>
    </>
  );
}
