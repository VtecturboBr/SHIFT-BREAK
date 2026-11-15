export const DEFAULT_MIX = {
  motors: 0.75,
  effects: 0.7,
  ambient: 0.55,
  muted: false,
};
export function readMix(storage) {
  try {
    const saved = JSON.parse(storage.getItem('redline.audio.v1') || '{}');
    const mix = { ...DEFAULT_MIX };
    for (const key of ['motors', 'effects', 'ambient'])
      if (typeof saved[key] === 'number' && Number.isFinite(saved[key]))
        mix[key] = Math.max(0, Math.min(1, saved[key]));
    mix.muted = saved.muted === true;
    return mix;
  } catch {
    return { ...DEFAULT_MIX };
  }
}
export function environmentAt(track, distance) {
  const section = track.section(distance);
  if (section.type === 'tunnel')
    return { name: 'tunnel', wet: 0.34, wind: 0.15 };
  if (section.sector === 'gallery')
    return { name: 'gallery', wet: 0.2, wind: 0.4 };
  if (section.sector === 'spillway')
    return { name: 'spillway', wet: 0.12, wind: 0.65 };
  if (section.sector === 'dam') return { name: 'dam', wet: 0.02, wind: 1.5 };
  return { name: 'open', wet: 0.015, wind: 1 };
}
export function rivalSpatial(camera, forward, position) {
  const dx = position.x - camera.x,
    dz = position.z - camera.z;
  const distance = Math.hypot(dx, position.y - camera.y, dz);
  const length = Math.hypot(forward.x, forward.z) || 1;
  const pan =
    (dx * -forward.z + dz * forward.x) /
    (Math.max(1, Math.hypot(dx, dz)) * length);
  return {
    pan: Math.max(-1, Math.min(1, pan)),
    gain: Math.max(0, 1 - distance / 100) ** 2,
  };
}
