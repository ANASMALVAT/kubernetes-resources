export function GridPattern() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }}
    />
  );
}
