import { useSpotlight } from '../../hooks/useSpotlight';

export function Spotlight() {
  const ref = useSpotlight<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(139, 92, 246, 0.10), transparent 40%)',
        transition: 'background 0.1s',
      }}
    />
  );
}
