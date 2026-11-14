import { clamp } from '../core/math.js';
import { ROAD_EDGE } from '../world/track.js';

export function driveAI(car, other, track, hazards, time, autopilot = false) {
  const curve = track.curvature(car.s);
  let bend = Math.abs(curve);
  for (let d = 10; d <= Math.max(45, car.speed * 2); d += 10)
    bend = Math.max(bend, Math.abs(track.curvature(car.s + d)));
  const gap = other.s - car.s;
  const passingLane = ROAD_EDGE - 0.35;
  if (gap < -8 || gap > 24 || Math.abs(curve) > 0.011) car.passSide = 0;
  if (
    !car.passSide &&
    gap > 0 &&
    gap < 14 &&
    car.speed > other.speed + 0.6 &&
    Math.abs(curve) < 0.008
  ) {
    car.passSide = other.lane > 0 ? -1 : 1;
  }
  let lane = -0.55;
  if (gap > 0 && gap < 24) {
    lane = other.lane;
  }
  if (car.passSide) lane = car.passSide * passingLane;
  for (const h of hazards) {
    if (h.s > car.s && h.s - car.s < Math.max(35, car.speed * 1.5))
      lane = h.lane > 0 ? -passingLane : passingLane;
  }
  lane = clamp(
    lane +
      Math.sin(time * 0.8 + (car.id === 'player' ? 0 : 4)) *
        (autopilot ? 0.15 : 0.08),
    -passingLane,
    passingLane,
  );
  let desired = Math.min(
    autopilot ? 40 : 45,
    Math.sqrt((autopilot ? 7 : 8.5) / Math.max(0.003, bend)),
  );
  if (gap > 30 && bend < 0.006) desired += 2;
  if (gap > 0 && gap < 11 && Math.abs(car.lane - other.lane) < 2.1) {
    desired = Math.min(desired, other.speed + Math.max(0, gap - 6) * 0.6);
  }
  const emergency =
    gap > 0 && gap < 5.5 && Math.abs(car.lane - other.lane) < 2.1;
  const compensation =
    -curve *
    car.speed *
    car.speed *
    (car.sync.has('stability') || car.sync.has('focus') ? 0.11 : 0.19);
  return {
    throttle: !emergency && car.speed < desired ? 1 : 0,
    brake:
      emergency && car.speed > other.speed
        ? 0.8
        : car.speed > desired + 3
          ? 0.35
          : 0,
    steer: clamp(
      ((lane - car.lane) * 1.8 - car.lateral * 0.25 + compensation) / 7.6,
      -1,
      1,
    ),
    handbrake: false,
  };
}
