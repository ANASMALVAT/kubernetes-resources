import type { CategoryId, View } from '../types';
import { categoryList } from '../data/categories';
import { resources } from '../data/resources';
import { FilterChip } from './FilterChip';
import { Stat } from './Stat';

interface Props {
  view: View;
  query: string;
  onQueryChange: (q: string) => void;
  activeCategory: CategoryId | 'all';
  onCategoryChange: (c: CategoryId | 'all') => void;
}

const clusterCount = resources.filter((r) => r.scope === 'cluster').length;
const namespaceCount = resources.filter((r) => r.scope === 'namespace').length;

export function Hero({
  view,
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
}: Props) {
  if (view === 'universe') {
    return (
      <header className="px-6 md:px-12 pt-6 pb-2 max-w-[1500px] mx-auto">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            The Kubernetes Universe
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className="px-6 md:px-12 pt-10 pb-6 max-w-[1500px] mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            All Resources
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Click any card to drill in · {resources.length} resources
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Cluster" value={clusterCount} color="text-indigo-300" glow="#a78bfa" />
          <Stat label="Namespace" value={namespaceCount} color="text-purple-300" glow="#c084fc" />
          <Stat label="Total" value={resources.length} color="text-white" glow="#ffffff" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search resources (e.g. ingress, pod, secret)..."
            className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={activeCategory === 'all'}
            onClick={() => onCategoryChange('all')}
          />
          {categoryList.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              active={activeCategory === c.id}
              glowColor={c.glow}
              onClick={() => onCategoryChange(c.id)}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
