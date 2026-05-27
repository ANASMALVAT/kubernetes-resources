import type { CategoryId, Resource } from '../types';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { ResourceCard } from '../components/ResourceCard';

interface Props {
  query: string;
  activeCategory: CategoryId | 'all';
  onSelect: (resource: Resource) => void;
}

const NAMESPACE_GROUPS: Array<{
  category: CategoryId;
  label: string;
  description: string;
  icon: string;
}> = [
  { category: 'workload', label: 'Workloads', description: 'Controllers that run containers', icon: '🚀' },
  { category: 'network', label: 'Networking', description: 'How traffic reaches your Pods', icon: '🌐' },
  { category: 'config', label: 'Config & Secrets', description: 'Configuration injected into Pods', icon: '📋' },
  { category: 'storage', label: 'Storage', description: 'Persistent storage requests', icon: '💾' },
  { category: 'identity', label: 'Identity (RBAC)', description: 'Who can do what', icon: '👤' },
];

export function GridView({ query, activeCategory, onSelect }: Props) {
  const filtered = filterResources(resources, query, activeCategory);
  const clusterScoped = filtered.filter((r) => r.scope === 'cluster');
  const namespaceScoped = filtered.filter((r) => r.scope === 'namespace');

  return (
    <div className="px-6 md:px-12 pb-16 max-w-[1500px] mx-auto animate-fade-in">
      {clusterScoped.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            icon="🌐"
            title="Cluster-scoped"
            subtitle="Shared infrastructure — created once, used by all namespaces"
            color="text-indigo-300"
          />
          <Grid resources={clusterScoped} onSelect={onSelect} />
        </section>
      )}

      {namespaceScoped.length > 0 && (
        <section>
          <SectionHeader
            icon="📂"
            title="Namespace-scoped"
            subtitle="Per-app resources — live inside a namespace"
            color="text-purple-300"
          />
          {NAMESPACE_GROUPS.map((group) => {
            const items = namespaceScoped.filter((r) => r.category === group.category);
            if (items.length === 0) return null;
            const c = categories[group.category];

            return (
              <div key={group.category} className="mb-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${c.text}`}>
                    <span>{group.icon}</span>
                    {group.label}
                  </h3>
                  <span className="text-xs text-slate-500">{group.description}</span>
                </div>
                <Grid resources={items} onSelect={onSelect} />
              </div>
            );
          })}
        </section>
      )}

      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function Grid({ resources, onSelect }: { resources: Resource[]; onSelect: (r: Resource) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <span>{icon}</span>
          <span className={color}>{title}</span>
        </h2>
        <span className="text-sm text-slate-500">{subtitle}</span>
      </div>
      <div className="mt-2 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 opacity-50">🔍</div>
      <p className="text-slate-400">No resources match your search.</p>
    </div>
  );
}

function filterResources(
  list: Resource[],
  query: string,
  activeCategory: CategoryId | 'all'
): Resource[] {
  const needle = query.trim().toLowerCase();
  return list.filter((r) => {
    const matchesQuery =
      !needle ||
      r.name.toLowerCase().includes(needle) ||
      r.oneliner.toLowerCase().includes(needle);
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesQuery && matchesCategory;
  });
}
