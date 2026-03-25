import { useEffect, useState } from 'react';

export default function ScrollDecor() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY || 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const driftA = Math.min(y * 0.18, 140);
  const driftB = Math.min(y * 0.12, 100);
  const driftC = Math.min(y * 0.22, 170);

  return (
    <div aria-hidden className="scroll-decor-wrap">
      <div className="scroll-decor scroll-decor-left" style={{ transform: `translate3d(0, ${driftA}px, 0)` }} />
      <div className="scroll-decor scroll-decor-right" style={{ transform: `translate3d(0, ${driftB}px, 0)` }} />
      <div className="scroll-decor scroll-decor-bottom" style={{ transform: `translate3d(0, ${-driftC}px, 0)` }} />
    </div>
  );
}
