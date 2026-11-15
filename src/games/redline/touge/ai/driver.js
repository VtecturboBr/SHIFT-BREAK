import { clamp } from '../core/math.js';
import { ROAD_EDGE } from '../world/track.js';

export function driveAI(car, other, track, hazards, time, autopilot = false) {
  const curve = track.curvature(car.s);
  let bend = Math.abs(curve);
  for (let d = 10; d <= Math.max(45, car.speed * 2); d += 10)
    bend = Math.max(bend, Math.abs(track.curvature(car.s + d)));
  const cruising =
    car.id === 'rival' &&
    !autopilot &&
    Math.abs(curve) < 0.002 &&
    !car.drift.active;
  const gap = other.s - car.s;
  if (cruising && gap <= 5 && gap > -70 && !car.yieldSide)
    car.yieldSide =
      car.lane < -0.3 ? -1 : car.lane > 0.3 ? 1 : other.lane >= 0 ? -1 : 1;
  if (!cruising || gap > 12 || gap < -90) car.yieldSide = 0;
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
  let lane = cruising ? -1.55 * Math.cos((time * Math.PI) / 12) : -0.55;
  if (gap > 0 && gap < 24) {
    lane = other.lane;
  }
  if (car.passSide) lane = car.passSide * passingLane;
  if (car.yieldSide) lane = car.yieldSide * 1.85;
  if (car.recovering) lane = gap < 18 ? car.lane : -0.65;
  for (const h of hazards) {
    if (h.s > car.s && h.s - car.s < Math.max(35, car.speed * 1.5))
      lane = h.lane > 0 ? -passingLane : passingLane;
  }
  lane = clamp(
    lane +
      (cruising ? 0 : Math.sin(time * 0.8 + (car.id === 'player' ? 0 : 4))) *
        (autopilot ? 0.15 : 0.08),
    -passingLane,
    passingLane,
  );
  let desired = Math.min(
    autopilot ? 50 : car.boost > 0 ? 100 : 88,
    Math.sqrt(
      (autopilot ? 7 : car.drift.active ? 36 : 26) / Math.max(0.002, bend),
    ),
  );
  if (gap > 30 && bend < 0.006) desired += 2;
  if (car.catchupPower > 0)
    desired = Math.min(
      88 + car.catchupPower * 44,
      Math.sqrt(
        ((car.drift.active ? 36 : 26) + car.catchupPower * 6) /
          Math.max(0.002, bend),
      ),
    );
  const tandem = car.drift.active && other.drift.active && gap > 0 && gap < 14;
  if (car.recovering && !tandem)
    desired = Math.min(desired, Math.max(0, other.speed + (gap - 24) * 0.75));
  const recoveryBrake =
    car.recovering &&
    !tandem &&
    car.speed > Math.sqrt(other.speed ** 2 + 36 * Math.max(0, gap - 18));
  if (gap > 0 && gap < 11 && Math.abs(car.lane - other.lane) < 2.1) {
    desired = Math.min(desired, other.speed + Math.max(0, gap - 6) * 0.6);
  }
  const emergency =
    !tandem && gap > 0 && gap < 5.5 && Math.abs(car.lane - other.lane) < 2.1;
  const compensation =
    -curve *
    car.speed *
    car.speed *
    (car.sync.has('stability') || car.sync.has('focus') ? 0.11 : 0.19);
  // Hold the lane alongside the player rather than sweeping into an overtake.
  const lateralTarget =
    cruising && Math.abs(gap) < 5 && Math.abs(car.lane - other.lane) > 1.2
      ? 0
      : cruising
        ? clamp(
            (lane - car.lane) * 1.8,
            car.yieldSide ? -1 : -0.4,
            car.yieldSide ? 1 : 0.4,
          )
        : (lane - car.lane) * 1.8;
  const section = track.section(car.s);
  const handbrake =
    !autopilot &&
    !emergency &&
    !(car.recovering && gap < 24 && !tandem) &&
    car.speed > 16 &&
    Math.abs(curve) > (car.drift.active ? 0.004 : 0.008) &&
    Math.abs(car.lane) < ROAD_EDGE - 0.5 &&
    section.end - car.s > car.speed * 0.12 &&
    (car.drift.active
      ? car.drift.validTime < 3.2
      : car.sync.canReward('drift') &&
        car.drift.lastCorner !== section.id &&
        car.speed > 18);
  const direction = car.drift.active ? car.drift.direction : -Math.sign(curve);
  const driftSteer =
    direction +
    ((car.lane + Math.sign(curve) * 0.35) * 1.1 +
      compensation * 0.07 -
      -Math.sin(car.slip) * car.speed * 0.08 -
      car.lane * 1.5 -
      car.lateral * 0.3) /
      1.8;
  return {
    throttle: !emergency && car.speed < desired ? 1 : 0,
    brake: recoveryBrake
      ? 1
      : emergency && car.speed > other.speed
        ? 0.8
        : car.speed > desired + 3
          ? 0.35
          : 0,
    steer: handbrake
      ? clamp(driftSteer, -1, 1)
      : clamp((lateralTarget - car.lateral * 0.25 + compensation) / 7.6, -1, 1),
    handbrake,
  };
}
