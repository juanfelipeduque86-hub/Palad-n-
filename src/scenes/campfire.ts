/**
 * Campfire zone: an existing pixel-art asset, integrated as-is.
 * Files are detected at build time, so a missing asset never causes a failed request.
 */
const files = import.meta.glob<string>('../assets/scenes/campfire/*.{png,gif}', { eager: true, query: '?url', import: 'default' });

const find = (name: string): string | null => {
  const key = Object.keys(files).find((k) => k.endsWith(`/${name}`));
  return key ? (files[key] ?? null) : null;
};

/** Static base frame (required for the zone to appear). */
export const CAMPFIRE_BASE = find('campfire_scene_base.png');
/** Original GIF (optional). If present, its fire region replaces the generated flames. */
export const CAMPFIRE_GIF = find('campfire_scene.gif');

/** Size of one art pixel in image pixels (2 = the PNG was exported at 2×). */
export const ART_SCALE = 2;

/**
 * Region that gets animated, as fractions of the image (0–1) from the top-left corner.
 * Open the app with `?firebox` to see it outlined.
 */
export const FIRE = { x: 0.38, y: 0.24, w: 0.22, h: 0.58 };

/** The flames inside the image: bottom-centre point, width and height, as fractions of the image. */
export const FLAME = { x: 0.492, y: 0.775, w: 0.075, h: 0.3 };
