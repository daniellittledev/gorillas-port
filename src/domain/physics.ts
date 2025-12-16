/**
 * Pure physics calculation functions
 */

import type { Projectile, Gorilla } from "../types";
import { GRAVITY, PHYSICS, GORILLA } from "../constants";

/**
 * Calculates the throwing hand position for a gorilla
 */
export const calculateThrowPosition = (
  gorilla: Gorilla
): { x: number; y: number } => {
  const scl = GORILLA.scl;
  const y = gorilla.y - scl(4) - 3;

  // Player 1 throws from left hand, Player 2 from right hand
  const xOffset = gorilla.player === 1 ? -scl(8) : scl(8);

  return {
    x: gorilla.x + xOffset,
    y,
  };
};

/**
 * Converts angle input to actual throw angle based on player
 */
export const calculateActualAngle = (
  angleDegrees: number,
  player: 1 | 2
): number => {
  const angleRad = (angleDegrees * Math.PI) / 180;
  // Player 2 shoots left, so flip the angle
  return player === 2 ? Math.PI - angleRad : angleRad;
};

/**
 * Calculates initial velocity components
 */
export const calculateInitialVelocity = (
  angle: number,
  velocity: number
): { vx: number; vy: number } => {
  return {
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity,
  };
};

/**
 * Creates a projectile from throw parameters
 */
export const createProjectile = (
  gorilla: Gorilla,
  angleDegrees: number,
  velocity: number
): Projectile => {
  const position = calculateThrowPosition(gorilla);
  const actualAngle = calculateActualAngle(
    angleDegrees,
    gorilla.player as 1 | 2
  );
  const { vx, vy } = calculateInitialVelocity(actualAngle, velocity);

  return {
    x: position.x,
    y: position.y,
    vx,
    vy: -vy,
    angle: actualAngle,
    startX: position.x,
    startY: position.y,
    initVx: vx,
    initVy: vy,
    time: 0,
    rotation: 0,
  };
};

/**
 * Calculates projectile position at a given time
 * Using the original BASIC physics formula
 */
export const calculateProjectilePosition = (
  projectile: Projectile,
  wind: number,
  deltaTime: number
): { x: number; y: number; rotation: number } => {
  const t = projectile.time + deltaTime;

  // Original physics formula:
  // x = StartXPos + (InitXVel * t) + (.5 * (Wind / 5) * t^2)
  // y = StartYPos + ((-1 * (InitYVel * t)) + (.5 * Gravity * t^2)) * (ScrHeight / 350)
  const x =
    projectile.startX +
    projectile.initVx * t +
    0.5 * (wind / PHYSICS.windDivisor) * t * t;

  const y =
    projectile.startY +
    (-1 * (projectile.initVy * t) + 0.5 * GRAVITY * t * t) *
      PHYSICS.gravityScale;

  // Smooth rotation at ~100 degrees per second
  const rotation = (t * 100) % 360;

  return { x, y, rotation };
};

/**
 * Updates a projectile with new position
 */
export const updateProjectile = (
  projectile: Projectile,
  wind: number,
  timeScale: number = 1
): Projectile => {
  const deltaTime = PHYSICS.timeStep * timeScale;
  const { x, y, rotation } = calculateProjectilePosition(
    projectile,
    wind,
    deltaTime
  );

  return {
    ...projectile,
    x,
    y,
    rotation,
    time: projectile.time + deltaTime,
  };
};

/**
 * Calculates current vertical velocity
 */
export const calculateCurrentVelocity = (
  projectile: Projectile
): { vx: number; vy: number } => {
  const vx = projectile.initVx + projectile.time * PHYSICS.windDivisor;
  const vy =
    -projectile.initVy + GRAVITY * projectile.time * PHYSICS.gravityScale;

  return { vx, vy };
};

/**
 * Checks if projectile is moving downward
 */
export const isProjectileDescending = (projectile: Projectile): boolean => {
  const { vy } = calculateCurrentVelocity(projectile);
  return vy > 0;
};

/**
 * Generates a random wind value
 */
export const generateWind = (): number => {
  // Original: Wind = FNRan(10) - 5, ranges from -4 to 5
  let wind = randomInt(1, 10) - 5;

  // 1 in 3 chance to add more wind
  if (randomInt(1, 3) === 1) {
    const extraWind = randomInt(1, 10);
    wind = wind > 0 ? wind + extraWind : wind - extraWind;
  }

  return wind;
};

// Helper function for wind generation
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
