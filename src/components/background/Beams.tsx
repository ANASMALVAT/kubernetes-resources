const BEAM_POSITIONS = [
  { left: '10%', delay: '0s' },
  { left: '30%', delay: '2s' },
  { left: '55%', delay: '4s' },
  { left: '78%', delay: '1s' },
  { left: '92%', delay: '3s' },
];

export function Beams() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BEAM_POSITIONS.map((b, i) => (
        <span
          key={i}
          className="absolute w-[2px] h-screen -top-1/2"
          style={{
            left: b.left,
            background:
              'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.4), transparent)',
            animation: `beamFall 8s linear infinite`,
            animationDelay: b.delay,
            filter: 'blur(1px)',
          }}
        />
      ))}
      <style>{`
        @keyframes beamFall {
          0%   { transform: translateY(0);    opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(200vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
