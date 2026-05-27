/**
 * Static background. One subtle radial gradient over a solid dark canvas —
 * no animations, no mousemove listeners, no per-frame work.
 */
export function Background() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.10), transparent 60%), #060616',
      }}
    />
  );
}
