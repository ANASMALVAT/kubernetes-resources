interface Props {
  label: string;
  value: number | string;
  color: string;
  glow: string;
}

export function Stat({ label, value, color, glow }: Props) {
  return (
    <div
      className="glass px-4 py-3 rounded-xl border border-white/10"
      style={{ boxShadow: `0 0 32px ${glow}1f` }}
    >
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
        {label}
      </div>
    </div>
  );
}
