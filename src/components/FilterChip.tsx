interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
  glowColor?: string;
}

export function FilterChip({ label, active, onClick, glowColor }: Props) {
  const style =
    active && glowColor ? { boxShadow: `0 0 24px ${glowColor}` } : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'text-white bg-white/10 border border-white/20'
          : 'text-slate-400 bg-white/[0.02] border border-white/5 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      {label}
    </button>
  );
}
