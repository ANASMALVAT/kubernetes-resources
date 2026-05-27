import * as THREE from 'three';

const STAR_COUNT = 2500;
const FIELD_SIZE = 200;

export function createStars(): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * FIELD_SIZE;
    positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE;
    positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_SIZE;

    // Stars get a slight blue/purple tint to fit the scene's palette.
    const color = new THREE.Color().setHSL(
      Math.random() * 0.2 + 0.55,
      0.8,
      0.7 + Math.random() * 0.3
    );
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}
