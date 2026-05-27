import { useEffect } from 'react';
import type { Resource, ResourceLink } from '../types';
import { categories } from '../data/categories';
import { findResourceByName } from '../data/resources';
import { CategoryBadge, ScopeBadge } from './Badges';
import { YamlBlock } from './YamlBlock';

interface Props {
  resource: Resource;
  onClose: () => void;
  onNavigate: (resource: Resource) => void;
}

export function DetailPanel({ resource, onClose, onNavigate }: Props) {
  // Escape to close + lock body scroll while the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const c = categories[resource.category];

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full md:w-[680px] glass border-l border-white/10 overflow-y-auto animate-slide-in"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.98))',
        }}
      >
        <Header resource={resource} hex={c.hex} onClose={onClose} />

        <div className="px-6 py-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={resource.category} />
            <ScopeBadge scope={resource.scope} />
          </div>

          <Section title="What it is">
            <p className="text-slate-300 leading-relaxed">{resource.description}</p>
          </Section>

          {resource.keyFields.length > 0 && (
            <Section title="Key fields">
              <div className="space-y-2">
                {resource.keyFields.map((f) => (
                  <div
                    key={f.name}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/20 transition"
                  >
                    <code className={`text-sm font-mono ${c.text}`}>{f.name}</code>
                    <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resource.references.length > 0 && (
            <Section
              title="References (outgoing)"
              icon={<span className="text-emerald-400">→</span>}
            >
              <LinkList
                links={resource.references}
                tone="emerald"
                onNavigate={onNavigate}
              />
            </Section>
          )}

          {resource.referencedBy.length > 0 && (
            <Section
              title="Referenced by (incoming)"
              icon={<span className="text-amber-400">←</span>}
            >
              <LinkList
                links={resource.referencedBy}
                tone="amber"
                onNavigate={onNavigate}
              />
            </Section>
          )}

          {resource.example && (
            <Section title="Example YAML">
              <YamlBlock source={resource.example} />
            </Section>
          )}

          {resource.tip && (
            <aside className="bg-gradient-to-br from-purple-500/15 to-pink-500/5 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="text-xs uppercase tracking-wider text-purple-300 font-bold mb-1">
                    Pro tip / Interview note
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{resource.tip}</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </aside>
    </div>
  );
}

function Header({
  resource,
  hex,
  onClose,
}: {
  resource: Resource;
  hex: string;
  onClose: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 nav-blur border-b border-white/10 px-6 py-4 flex items-center justify-between"
      style={{ background: 'rgba(2, 6, 23, 0.7)' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="text-5xl animate-float inline-block">{resource.icon}</span>
          <div
            className="absolute -inset-2 rounded-full blur-2xl opacity-50"
            style={{ background: hex }}
          />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">{resource.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{resource.oneliner}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function LinkList({
  links,
  tone,
  onNavigate,
}: {
  links: ResourceLink[];
  tone: 'emerald' | 'amber';
  onNavigate: (resource: Resource) => void;
}) {
  const styles =
    tone === 'emerald'
      ? {
          arrow: 'text-emerald-400',
          bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          name: 'text-emerald-200',
          glyph: '→',
        }
      : {
          arrow: 'text-amber-400',
          bg: 'bg-amber-500/5 hover:bg-amber-500/10',
          border: 'border-amber-500/20 hover:border-amber-500/40',
          name: 'text-amber-200',
          glyph: '←',
        };

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const target = findResourceByName(link.name);
        return (
          <button
            key={`${link.name}-${link.via}`}
            type="button"
            onClick={() => target && onNavigate(target)}
            disabled={!target}
            className={`w-full text-left ${styles.bg} ${styles.border} border rounded-lg p-3 flex items-start gap-3 transition disabled:opacity-60 disabled:cursor-default`}
          >
            <span className={`${styles.arrow} mt-0.5`}>{styles.glyph}</span>
            <div className="flex-1">
              <div className={`font-semibold ${styles.name} text-sm flex items-center gap-2`}>
                {target?.icon} {link.name}
                {target && <span className="text-xs text-slate-500">(click to view)</span>}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                <code>{link.via}</code>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
