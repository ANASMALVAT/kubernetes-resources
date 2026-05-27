# K8s Resources Map

An interactive map of the 24 built-in Kubernetes resources covered in the
`04-built-in-resource-types` lesson. Two views over the same data:

- **3D Universe** — every resource is a node arranged into 7 vertical tiers
  that mirror the path of an external request reaching a Pod. Drag to rotate,
  scroll to zoom, hover a node to highlight its relationships, click to drill in.
- **Grid** — the same resources as cards, grouped by scope and category, with
  search and category filters.

Clicking a resource opens a side panel with: what it is, key fields, what it
references, what references it, an example YAML, and a one-line interview tip.
References inside the panel are clickable — they navigate to the linked
resource.

## Stack

- React 18 + TypeScript
- Vite for dev server / build
- Tailwind CSS for styling
- Three.js (r160) for the 3D scene — `OrbitControls`, raycaster, canvas-texture sprites

No state library, no router, no UI framework — kept intentionally small so
each file is short enough to read in one sitting.

## Running locally

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build       # type-check + production build into dist/
npm run preview     # serve the production build
npm run typecheck   # tsc --noEmit
```

## Project structure

```
src/
├── App.tsx                       — composition root, owns view + selection state
├── main.tsx                      — React entry
├── index.css                     — Tailwind layers + a handful of custom utilities
├── types.ts                      — shared TypeScript interfaces
│
├── data/
│   ├── categories.ts             — colour + Tailwind class metadata per category
│   ├── tiers.ts                  — 7 tiers used to lay out the 3D scene
│   └── resources.ts              — all 24 resources, fully typed
│
├── components/
│   ├── background/               — aurora / spotlight / beams / grid pattern
│   ├── NavBar.tsx
│   ├── Hero.tsx                  — title, search, filter chips
│   ├── ResourceCard.tsx          — magic card for the grid view
│   ├── DetailPanel.tsx           — slide-in side panel
│   ├── Badges.tsx                — category + scope badges
│   ├── FilterChip.tsx
│   ├── Stat.tsx
│   └── YamlBlock.tsx             — tiny YAML highlighter for code samples
│
├── hooks/
│   ├── useSpotlight.ts           — mouse-tracking CSS variable hook
│   └── useMagicCards.ts          — sets per-card mouse position for the radial spotlight
│
├── views/
│   ├── GridView.tsx              — the card grid
│   └── UniverseView.tsx          — wraps the Three.js scene + overlays (legend, tier guide)
│
└── three/
    ├── createScene.ts            — orchestrates renderer, controls, animation loop
    ├── createNodes.ts            — one icosahedron per resource + glow + label
    ├── createConnections.ts      — bezier-curved lines between linked resources
    ├── createTierFloors.ts       — translucent disks + sprite labels per tier
    ├── createStars.ts            — point cloud background
    ├── createCore.ts             — decorative wireframe core at the origin
    ├── createLabelSprite.ts      — canvas-text-to-Sprite helper
    └── layout.ts                 — turns tier definitions into 3D positions
```

## How the 3D layout is computed

Every resource belongs to exactly one tier (defined in `src/data/tiers.ts`).
Each tier has:

- a `y` coordinate — its height in the scene,
- a `radius` — the ring on which its resources are placed.

`src/three/layout.ts` walks the tier list and assigns each resource a
`THREE.Vector3` — singletons (Service, Pod) sit on the central Y axis; the
others spread evenly around their tier's ring. That position map is then
consumed by `createNodes` and `createConnections`.

If you change a resource's category or want to move it to a different tier,
edit only `src/data/tiers.ts` and `src/data/resources.ts` — nothing in the
Three.js code needs to know about specific resources.

## The 7 tiers

| Tier | Label                    | What lives there                                                                  |
| ---- | ------------------------ | --------------------------------------------------------------------------------- |
| 1    | Classes & Org            | Namespace, IngressClass, GatewayClass, StorageClass                               |
| 2    | External Entry           | Ingress, Gateway, HTTPRoute                                                       |
| 3    | Service Layer            | Service                                                                           |
| 4    | Workload Controllers     | Deployment, StatefulSet, DaemonSet, ReplicaSet, Job, CronJob                      |
| 5    | Pod                      | Pod                                                                               |
| 6    | Pod Dependencies         | ConfigMap, Secret, ServiceAccount, PVC                                            |
| 7    | Backing Infrastructure   | PV, Role, RoleBinding, ClusterRole, ClusterRoleBinding                            |

Read top-to-bottom: classes pick controllers → external entry points route
to Services → Services front Pods → controllers create those Pods → Pods
consume config, identity and storage → storage and RBAC are backed by
cluster-level primitives.

## Notes / things worth reading first

- `src/three/createScene.ts` is the largest file. Start there if you're
  curious how the scene is wired — every other `three/*` file is a small
  factory it composes.
- `src/data/resources.ts` is long but flat — it's just data.
- Most components are short (under 80 LOC). `DetailPanel.tsx` and `Hero.tsx`
  are the longest UI pieces.

## License

Personal study project — do whatever you want with it.
