import * as THREE from 'three';
import { tiers } from '../data/tiers';
import { createLabelSprite } from './createLabelSprite';

export interface TierFloorMeshes {
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  disk: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  label: THREE.Sprite;
}

const BASE_RING_OPACITY = 0.18;
const BASE_DISK_OPACITY = 0.025;
const ACTIVE_RING_OPACITY = 0.55;
const ACTIVE_DISK_OPACITY = 0.1;

/**
 * Subtle floor disks at each tier's Y level plus a sprite label on the
 * left side. The returned meshes are keyed by tier id so the scene can
 * highlight whichever tier is currently focused.
 */
export function createTierFloors(): {
  group: THREE.Group;
  tierMeshes: Map<number, TierFloorMeshes>;
} {
  const group = new THREE.Group();
  group.name = 'tier-floors';
  const tierMeshes = new Map<number, TierFloorMeshes>();

  for (const tier of tiers) {
    const ringRadius = Math.max(tier.radius + 1.5, 3);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(ringRadius - 0.06, ringRadius, 96),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: BASE_RING_OPACITY,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = tier.y - 0.6;
    group.add(ring);

    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(ringRadius - 0.06, 96),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: BASE_DISK_OPACITY,
        side: THREE.DoubleSide,
      })
    );
    disk.rotation.x = -Math.PI / 2;
    disk.position.y = tier.y - 0.6;
    group.add(disk);

    const label = createLabelSprite(`Tier ${tier.id} · ${tier.label}`, {
      background: 'rgba(15, 23, 42, 0.85)',
      borderColor: 'rgba(139, 92, 246, 0.45)',
      textColor: '#c4b5fd',
      fontSize: 28,
      scale: 0.013,
    });
    label.position.set(-(ringRadius + 3.5), tier.y, 0);
    group.add(label);

    tierMeshes.set(tier.id, { ring, disk, label });
  }

  return { group, tierMeshes };
}

export function highlightTierFloor(
  tierMeshes: Map<number, TierFloorMeshes>,
  activeTierId: number | null
) {
  tierMeshes.forEach((meshes, id) => {
    const isActive = id === activeTierId;
    meshes.ring.material.opacity = isActive ? ACTIVE_RING_OPACITY : BASE_RING_OPACITY;
    meshes.disk.material.opacity = isActive ? ACTIVE_DISK_OPACITY : BASE_DISK_OPACITY;
  });
}
