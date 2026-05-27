import { useCallback, useState } from 'react';
import type { CategoryId, Resource, View } from './types';
import { Background } from './components/background/Background';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { DetailPanel } from './components/DetailPanel';
import { GridView } from './views/GridView';
import { UniverseView } from './views/UniverseView';

export default function App() {
  const [view, setView] = useState<View>('universe');
  const [selected, setSelected] = useState<Resource | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');

  const handleSelect = useCallback((resource: Resource) => {
    setSelected(resource);
  }, []);

  return (
    <div className="min-h-screen">
      <Background />
      <NavBar view={view} onViewChange={setView} />
      <Hero
        view={view}
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main
        className="px-6 md:px-12 max-w-[1500px] mx-auto"
        style={{ minHeight: '60vh' }}
      >
        {view === 'universe' ? (
          <UniverseView onSelect={handleSelect} />
        ) : (
          <GridView
            query={query}
            activeCategory={activeCategory}
            onSelect={handleSelect}
          />
        )}
      </main>

      {selected && (
        <DetailPanel
          resource={selected}
          onClose={() => setSelected(null)}
          onNavigate={setSelected}
        />
      )}
    </div>
  );
}
