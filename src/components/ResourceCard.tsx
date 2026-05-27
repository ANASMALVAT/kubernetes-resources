import type { Resource } from '../types';
import { categories } from '../data/categories';

interface Props {
  resource: Resource;
  onSelect: (resource: Resource) => void;
}

export function ResourceCard({ resource, onSelect }: Props) {
  const c = categories[resource.category];

  return (
    <button
      type="button"
      onClick={() => onSelect(resource)}
      style={{ ['--glow' as string]: c.hex }}
      className="magic-card group text-left p-5 w-full"
    >
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <div className="text-4xl animate-float">{resource.icon}</div>
            <div
              className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition"
              style={{ background: c.hex }}
            />
          </div>
          <svg
            className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white mb-1">{resource.name}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {resource.oneliner}
        </p>
      </div>
    </button>
  );
}
