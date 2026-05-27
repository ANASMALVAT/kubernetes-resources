import * as THREE from 'three';
import type { Resource } from '../types';
import { categories } from '../data/categories';
import { createLabelSprite } from './createLabelSprite';
import type { PositionMap } from './layout';

export interface SceneNode {
  resource: Resource;
  mesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshStandardMaterial>;
  glow: THREE.Mesh;
  label: THREE.Sprite;
  baseY: number;
}

interface CreateOptions {
  resources: Resource[];
  positions: PositionMap;
}

/**
 * Build one node per resource: an icosahedron with an additive glow shell
 * plus a text sprite floating above. Returns the nodes so the view can
 * animate, raycast, and clean up.
 */
export function createNodes({ resources, positions }: CreateOptions): {
  group: THREE.Group;
  nodes: SceneNode[];
} {
  const group = new THREE.Group();
  group.name = 'nodes';
  const nodes: SceneNode[] = [];

  for (const resource of resources) {
    const position = positions[resource.id];
    if (!position) continue;

    const category = categories[resource.category];

    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshStandardMaterial({
        color: category.threeColor,
        emissive: category.threeColor,
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.35,
        flatShading: true,
      })
    );
    mesh.position.copy(position);
    mesh.userData = { resource };
    group.add(mesh);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshBasicMaterial({
        color: category.threeColor,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      })
    );
    mesh.add(glow);

    const label = createLabelSprite(`${resource.icon}  ${resource.name}`);
    label.position.set(position.x, position.y + 1.45, position.z);
    group.add(label);

    nodes.push({ resource, mesh, glow, label, baseY: position.y });
  }

  return { group, nodes };
}
