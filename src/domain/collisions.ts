/**
 * Pure collision detection functions
 */

import type { Projectile, Gorilla, Building } from "../types";
import { GAME_WIDTH, GAME_HEIGHT, GORILLA } from "../constants";
import { isPointInCircle, isPointInRect } from "../utils/math";
import { isProjectileDescending } from "./physics";

export interface CollisionResult {
  hit: boolean;
  target: number | "building" | "sun" | null;
  hitX?: number;
  hitY?: number;
}

/**
 * Checks if projectile is out of bounds
 */
export const isProjectileOutOfBounds = (projectile: Projectile): boolean => {
  const scl10 = GORILLA.scl(10);

  // Off sides
  if (projectile.x <= 3 || projectile.x >= GAME_WIDTH - scl10) {
    return true;
  }

  // Hit bottom
  if (projectile.y >= GAME_HEIGHT - 7) {
    return true;
  }

  return false;
};

/**
 * Checks if projectile hit the bottom
 */
export const didProjectileHitBottom = (projectile: Projectile): boolean => {
  return projectile.y >= GAME_HEIGHT - 7;
};

/**
 * Checks if projectile is off screen sides
 */
export const isProjectileOffSides = (projectile: Projectile): boolean => {
  const scl10 = GORILLA.scl(10);
  return projectile.x <= 3 || projectile.x >= GAME_WIDTH - scl10;
};

/**
 * Checks collision with the sun
 */
export const checkSunCollision = (projectile: Projectile): CollisionResult => {
  const sunX = GAME_WIDTH / 2;
  const sunY = GORILLA.scl(25);
  const sunRadius = GORILLA.scl(12);

  if (isPointInCircle(projectile.x, projectile.y, sunX, sunY, sunRadius)) {
    return {
      hit: true,
      target: "sun",
      hitX: projectile.x,
      hitY: projectile.y,
    };
  }

  return { hit: false, target: null };
};

/**
 * Checks if a point is within a gorilla's bounds
 */
export const isPointInGorilla = (
  x: number,
  y: number,
  gorilla: Gorilla
): boolean => {
  return (
    x >= gorilla.x - GORILLA.scl(15) &&
    x <= gorilla.x + GORILLA.scl(14) &&
    y >= gorilla.y - GORILLA.scl(1) &&
    y <= gorilla.y + GORILLA.scl(28)
  );
};

/**
 * Checks collision with a gorilla
 */
export const checkGorillaCollision = (
  checkX: number,
  checkY: number,
  gorilla: Gorilla
): boolean => {
  return isPointInGorilla(checkX, checkY, gorilla);
};

/**
 * Checks if a point is in a destroyed (explosion) area of a building
 */
export const isPointInDestroyedArea = (
  x: number,
  y: number,
  building: Building
): boolean => {
  for (const explosion of building.explosions) {
    if (isPointInCircle(x, y, explosion.x, explosion.y, explosion.radius)) {
      return true;
    }
  }
  return false;
};

/**
 * Checks collision with buildings
 */
export const checkBuildingCollision = (
  checkX: number,
  checkY: number,
  buildings: Building[]
): boolean => {
  for (const building of buildings) {
    if (
      isPointInRect(
        checkX,
        checkY,
        building.x,
        building.y,
        building.width,
        building.height
      )
    ) {
      // Check if the point is in a destroyed area
      if (!isPointInDestroyedArea(checkX, checkY, building)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Performs comprehensive collision detection for a projectile
 */
export const checkCollisions = (
  projectile: Projectile,
  gorilla1: Gorilla,
  gorilla2: Gorilla,
  buildings: Building[],
  currentPlayer: 1 | 2
): CollisionResult => {
  // Check if projectile is above screen - no collision checking
  if (projectile.y <= 0) {
    return { hit: false, target: null };
  }

  // Check if hit bottom - causes explosion
  if (didProjectileHitBottom(projectile)) {
    return {
      hit: true,
      target: "building",
      hitX: projectile.x,
      hitY: projectile.y,
    };
  }

  // Check if off sides - just end turn, no explosion
  if (isProjectileOffSides(projectile)) {
    return {
      hit: true,
      target: null,
      hitX: projectile.x,
      hitY: projectile.y,
    };
  }

  // Check sun collision
  const sunResult = checkSunCollision(projectile);
  if (sunResult.hit) {
    return sunResult;
  }

  // Check collisions at multiple points (original collision detection logic)
  const direction = currentPlayer === 1 ? GORILLA.scl(-4) : GORILLA.scl(4);
  let lookX = GORILLA.scl(8 * (2 - currentPlayer));

  for (let i = 0; i < 2; i++) {
    const lookY = i * GORILLA.scl(6);
    const checkX = projectile.x + lookX;
    const checkY = projectile.y + lookY;

    // Check opponent gorilla (not self)
    const opponent = currentPlayer === 1 ? gorilla2 : gorilla1;
    if (checkGorillaCollision(checkX, checkY, opponent)) {
      return {
        hit: true,
        target: opponent.player,
        hitX: projectile.x,
        hitY: projectile.y,
      };
    }

    // Check buildings only when descending
    if (isProjectileDescending(projectile)) {
      if (checkBuildingCollision(checkX, checkY, buildings)) {
        return {
          hit: true,
          target: "building",
          hitX: projectile.x,
          hitY: projectile.y,
        };
      }
    }

    lookX += direction;
    if (lookX !== GORILLA.scl(4)) break;
  }

  return { hit: false, target: null };
};

/**
 * Checks if explosion damages a gorilla
 */
export const checkExplosionGorillaHit = (
  explosionX: number,
  explosionY: number,
  explosionRadius: number,
  gorilla: Gorilla
): boolean => {
  // Check if gorilla center is within explosion radius
  // Use a generous check since gorilla sprite is ~30x28 pixels
  return isPointInCircle(
    gorilla.x,
    gorilla.y,
    explosionX,
    explosionY,
    explosionRadius + GORILLA.width / 2
  );
};
