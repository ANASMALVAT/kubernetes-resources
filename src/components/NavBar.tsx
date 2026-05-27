import type { View } from '../types';

interface Props {
  view: View;
  onViewChange: (view: View) => void;
}

export function NavBar({ view, onViewChange }: Props) {
  return (
    <nav className="sticky top-0 z-40 nav-blur border-b border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-2">
          <Tab
            active={view === 'universe'}
            onClick={() => onViewChange('universe')}
            icon="🌌"
            label="3D Universe"
          />
          <Tab
            active={view === 'grid'}
            onClick={() => onViewChange('grid')}
            icon="🗂️"
            label="Grid View"
          />
        </div>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">⎈</span>
      <div>
        <div className="text-base font-semibold text-white tracking-tight">
          K8s Resources Map
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">
          Interactive Reference
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'text-white bg-gradient-to-br from-purple-600/40 to-pink-600/20 border border-purple-400/40 shadow-lg shadow-purple-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className="flex items-center gap-2">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    </button>
  );
}
