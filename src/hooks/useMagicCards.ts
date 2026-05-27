import { useEffect } from 'react';

/**
 * On every mouse move, set --mx / --my CSS variables on each .magic-card
 * relative to that card so its inner radial spotlight can follow the cursor.
 * Done at document level (one listener) instead of per-card React state to
 * avoid re-renders.
 */
export function useMagicCards() {
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>('.magic-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
      });
    };

    document.addEventListener('mousemove', handle);
    return () => document.removeEventListener('mousemove', handle);
  }, []);
}
