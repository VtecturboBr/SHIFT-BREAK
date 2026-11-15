import { CAR_HALF_LENGTH as L } from '../world/track.js';

// The collision hull excludes the flexible mirrors.
const W = 0.99;

export function carsOverlap(lateral, longitudinal, a, b) {
  const axes = [a, a + Math.PI / 2, b, b + Math.PI / 2];
  return axes.every((axis) => {
    const radius = (angle) =>
      L * Math.abs(Math.cos(angle - axis)) +
      W * Math.abs(Math.sin(angle - axis));
    return (
      Math.abs(lateral * Math.sin(axis) + longitudinal * Math.cos(axis)) <
      radius(a) + radius(b)
    );
  });
}
