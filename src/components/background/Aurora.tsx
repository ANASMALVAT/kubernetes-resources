export function Aurora() {
  return (
    <div
      className="fixed inset-0 -z-20"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 30%, rgba(236, 72, 153, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 50% 90%, rgba(34, 211, 238, 0.18) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 90% 80%, rgba(168, 85, 247, 0.20) 0%, transparent 50%),
          #050519
        `,
        animation: 'auroraShift 22s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes auroraShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50%      { filter: hue-rotate(40deg) brightness(1.15); }
        }
      `}</style>
    </div>
  );
}
