import { useEffect, useRef } from 'react';

/**
 * Attach a CSS variable–driven radial gradient that follows the mouse on
 * the returned element. Cheap because it does not trigger React re-renders.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handle = (e: MouseEvent) => {
      el.style.setProperty('--mx', `${e.clientX}px`);
      el.style.setProperty('--my', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', handle);
    return () => document.removeEventListener('mousemove', handle);
  }, []);

  return ref;
}
