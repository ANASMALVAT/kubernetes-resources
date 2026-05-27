import * as THREE from 'three';

interface Options {
  background?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  scale?: number;
}

/**
 * Render text into a 2D canvas, wrap it in a Three.js Sprite. Sprites are
 * cheap, always face the camera, and are the simplest way to put text in
 * a 3D scene without an extra font-loading pipeline.
 */
export function createLabelSprite(text: string, options: Options = {}): THREE.Sprite {
  const {
    background = 'rgba(2, 6, 23, 0.92)',
    borderColor = 'rgba(167, 139, 250, 0.5)',
    textColor = '#ffffff',
    fontSize = 36,
    scale = 0.012,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  // First pass: measure how wide the text needs to be.
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  const padX = 24;
  const padY = 12;
  const metrics = ctx.measureText(text);
  canvas.width = Math.ceil(metrics.width + padX * 2);
  canvas.height = fontSize + padY * 2;

  // Re-set the font — resizing the canvas resets its state.
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  drawRoundedRect(ctx, canvas.width, canvas.height, 14, background, borderColor);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 999;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  return sprite;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  radius: number,
  fill: string,
  stroke: string
) {
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(w - radius, 0);
  ctx.quadraticCurveTo(w, 0, w, radius);
  ctx.lineTo(w, h - radius);
  ctx.quadraticCurveTo(w, h, w - radius, h);
  ctx.lineTo(radius, h);
  ctx.quadraticCurveTo(0, h, 0, h - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}
