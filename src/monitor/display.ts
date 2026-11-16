export const DESKTOP = { width: 1280, height: 720 };
export const MONITOR_FRAME = { width: 1920, height: 1080 };

export function monitorDistance(
  fov: number,
  aspect: number,
  width: number,
  height: number,
): number {
  const tangent = Math.tan((fov * Math.PI) / 360);
  return Math.max(
    0.8,
    width / (2 * tangent * aspect * 0.94),
    height / (2 * tangent * 0.86),
  );
}
