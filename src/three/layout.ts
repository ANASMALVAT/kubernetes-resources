import * as THREE from 'three';
import type { Resource } from '../types';
import { tiers } from '../data/tiers';
import { findResourceById } from '../data/resources';

export type PositionMap = Record<string, THREE.Vector3>;

/**
 * Compute a fixed 3D position for every resource based on its tier.
 * Singletons sit on the central Y axis; multi-resource tiers are spread
 * evenly around a horizontal ring at that tier's Y level.
 */
export function computeTierPositions(): PositionMap {
  const positions: PositionMap = {};

  for (const tier of tiers) {
    const items = tier.resourceIds
      .map(findResourceById)
      .filter((r): r is Resource => Boolean(r));

    if (items.length === 0) continue;

    if (items.length === 1 || tier.radius === 0) {
      positions[items[0].id] = new THREE.Vector3(0, tier.y, 0);
      continue;
    }

    items.forEach((resource, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      positions[resource.id] = new THREE.Vector3(
        Math.cos(angle) * tier.radius,
        tier.y,
        Math.sin(angle) * tier.radius
      );
    });
  }

  return positions;
}
