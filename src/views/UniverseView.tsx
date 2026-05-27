import { useEffect, useRef, useState } from 'react';
import type { Resource } from '../types';
import { categoryList } from '../data/categories';
import { tiers } from '../data/tiers';
import { createScene, type SceneHandle } from '../three/createScene';

interface Props {
  onSelect: (resource: Resource) => void;
}

const TIER_COUNT = tiers.length;

export function UniverseView({ onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [hovered, setHovered] = useState<Resource | null>(null);
  const [activeTier, setActiveTier] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = createScene(container);
    scene.setHoverListener(setHovered);
    scene.setClickListener(onSelect);
    scene.setActiveTierListener(setActiveTier);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [onSelect]);

  function focusTier(tierId: number) {
    sceneRef.current?.focusTier(tierId);
  }

  function focusAll() {
    sceneRef.current?.focusAll();
  }

  function stepTier(delta: 1 | -1) {
    if (activeTier === null) {
      focusTier(delta === 1 ? 1 : TIER_COUNT);
      return;
    }
    const next = activeTier + delta;
    if (next >= 1 && next <= TIER_COUNT) focusTier(next);
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.4), rgba(2, 6, 23, 0.85))',
        }}
      />

      <HoverTooltip resource={hovered} />

      <LevelNavigator
        activeTier={activeTier}
        onSelectTier={focusTier}
        onStep={stepTier}
        onAll={focusAll}
      />

      <Legend open={legendOpen} onToggle={() => setLegendOpen((v) => !v)} />

      <TierDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        activeTier={activeTier}
        onSelectTier={focusTier}
      />
    </div>
  );
}

function HoverTooltip({ resource }: { resource: Resource | null }) {
  if (!resource) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-3 max-w-md pointer-events-none">
      <div className="font-semibold flex items-center gap-2">
        <span className="text-xl">{resource.icon}</span>
        <span className="text-white">{resource.name}</span>
      </div>
      <div className="text-xs text-slate-400 mt-1">{resource.oneliner}</div>
      <div className="text-xs text-purple-300 mt-2">click to drill in →</div>
    </div>
  );
}

interface LevelNavigatorProps {
  activeTier: number | null;
  onSelectTier: (tierId: number) => void;
  onStep: (delta: 1 | -1) => void;
  onAll: () => void;
}

function LevelNavigator({
  activeTier,
  onSelectTier,
  onStep,
  onAll,
}: LevelNavigatorProps) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
      <NavArrowButton
        onClick={() => onStep(-1)}
        disabled={activeTier === 1}
        direction="up"
      />

      <div className="glass rounded-2xl p-1.5 flex flex-col gap-1">
        {tiers.map((tier) => {
          const active = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              title={`Tier ${tier.id} · ${tier.label}`}
              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                active
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              T{tier.id}
            </button>
          );
        })}
      </div>

      <NavArrowButton
        onClick={() => onStep(1)}
        disabled={activeTier === TIER_COUNT}
        direction="down"
      />

      <button
        type="button"
        onClick={onAll}
        className={`glass mt-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
          activeTier === null
            ? 'text-purple-200 bg-purple-500/25 border border-purple-400/40'
            : 'text-slate-400 hover:text-white border border-transparent hover:border-white/10'
        }`}
      >
        All
      </button>
    </div>
  );
}

function NavArrowButton({
  onClick,
  disabled,
  direction,
}: {
  onClick: () => void;
  disabled: boolean;
  direction: 'up' | 'down';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'up' ? 'Previous tier' : 'Next tier'}
      className="glass w-10 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d={direction === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    </button>
  );
}

interface TierDrawerProps {
  open: boolean;
  onToggle: () => void;
  activeTier: number | null;
  onSelectTier: (tierId: number) => void;
}

/**
 * Slide-in drawer anchored to the right edge. Collapsed it is a 40px tab —
 * just the toggle handle — so the canvas stays unobstructed until the user
 * opens it.
 */
function TierDrawer({ open, onToggle, activeTier, onSelectTier }: TierDrawerProps) {
  return (
    <aside
      className="absolute right-0 top-4 bottom-4 glass rounded-l-2xl overflow-hidden transition-all duration-300 z-10"
      style={{ width: open ? '320px' : '40px' }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? 'Hide tier guide' : 'Show tier guide'}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-24 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d={open ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
          />
        </svg>
      </button>

      {open && (
        <div className="pl-12 pr-4 py-4 h-full overflow-y-auto">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
            Tiers (top → bottom)
          </h3>
          <ol className="space-y-1.5">
            {tiers.map((tier) => {
              const active = activeTier === tier.id;
              return (
                <li key={tier.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTier(tier.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition border ${
                      active
                        ? 'bg-purple-500/20 border-purple-400/40'
                        : 'border-transparent hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-purple-300 font-mono text-xs">
                        T{tier.id}
                      </span>
                      <span className="text-white font-semibold text-sm">
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {tier.description}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </aside>
  );
}

function Legend({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div
      className={`absolute top-4 right-12 glass rounded-2xl transition-all duration-300 z-10 ${
        open ? 'p-4 w-56' : 'p-2 w-auto'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        {open && (
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Legend
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
          aria-label={open ? 'Collapse legend' : 'Expand legend'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <>
          <div className="space-y-1.5">
            {categoryList.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: `0 0 12px ${c.hex}`,
                  }}
                />
                <span className="text-slate-300">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-500 space-y-1">
            <div>Drag · rotate</div>
            <div>Scroll · zoom</div>
            <div>Click a node · open</div>
          </div>
        </>
      )}
    </div>
  );
}
