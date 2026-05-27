import type { CategoryId, Scope } from '../types';
import { categories } from '../data/categories';

export function CategoryBadge({ category }: { category: CategoryId }) {
  const c = categories[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${c.text} ${c.bg} ${c.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      {c.label}
    </span>
  );
}

export function ScopeBadge({ scope }: { scope: Scope }) {
  const isCluster = scope === 'cluster';
  const classes = isCluster
    ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'
    : 'text-slate-300 bg-slate-500/10 border-slate-500/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${classes}`}
    >
      {isCluster ? '🌐 Cluster' : '📂 Namespace'}
    </span>
  );
}
