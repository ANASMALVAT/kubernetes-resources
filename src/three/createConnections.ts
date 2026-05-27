import * as THREE from 'three';
import type { Resource } from '../types';
import { findResourceByName } from '../data/resources';
import type { PositionMap } from './layout';

export interface SceneConnection {
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
  pair: [string, string];
}

interface CreateOptions {
  resources: Resource[];
  positions: PositionMap;
}

const BASE_COLOR = 0xa78bfa;
const HIGHLIGHT_COLOR = 0xfbbf24;

/**
 * Draw a curved line between every pair (A, B) where A.references contains
 * B. Connections are deduped so a single line represents the relationship
 * regardless of which side declares it.
 */
export function createConnections({
  resources,
  positions,
}: CreateOptions): { group: THREE.Group; connections: SceneConnection[] } {
  const group = new THREE.Group();
  group.name = 'connections';
  const connections: SceneConnection[] = [];
  const seen = new Set<string>();

  for (const resource of resources) {
    for (const ref of resource.references) {
      const target = findResourceByName(ref.name);
      if (!target) continue;

      const key = [resource.id, target.id].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);

      const from = positions[resource.id];
      const to = positions[target.id];
      if (!from || !to) continue;

      const connection = buildCurve(from, to);
      group.add(connection.line);
      connections.push({ ...connection, pair: [resource.id, target.id] });
    }
  }

  return { group, connections };
}

function buildCurve(from: THREE.Vector3, to: THREE.Vector3) {
  // Pull the midpoint toward the central axis so connection arcs sag
  // gently inward — visually distinguishes tier-to-tier flow from clutter.
  const midpoint = from.clone().lerp(to, 0.5).multiplyScalar(0.6);
  const curve = new THREE.QuadraticBezierCurve3(from, midpoint, to);

  const segments = 32;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    points.push(curve.getPoint(i / segments));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: BASE_COLOR,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
  });
  const line = new THREE.Line(geometry, material);

  return { line, material };
}

export function highlightConnections(
  connections: SceneConnection[],
  focusId: string | null
) {
  for (const c of connections) {
    if (focusId && c.pair.includes(focusId)) {
      c.material.color.setHex(HIGHLIGHT_COLOR);
      c.material.opacity = 0.7;
    } else {
      c.material.color.setHex(BASE_COLOR);
      c.material.opacity = 0.06;
    }
  }
}

export function resetConnections(connections: SceneConnection[]) {
  for (const c of connections) {
    c.material.color.setHex(BASE_COLOR);
    c.material.opacity = 0.18;
  }
}

export { BASE_COLOR as BASE_CONNECTION_COLOR };
