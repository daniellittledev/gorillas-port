/**
 * Pure functions for rendering calculations
 */

import type { Gorilla } from "../types";

/**
 * Determines which arm to raise for throwing animation
 */
export const getThrowingArmAngle = (player: 1 | 2): number => {
  // Player 1 raises left arm (135°), Player 2 raises right arm (45°)
  return player === 1 ? (Math.PI * 3) / 4 : Math.PI / 4;
};

/**
 * Calculates which arm position to show for a dancing gorilla
 */
export const getDanceArmAngle = (danceFrame: number, player: 1 | 2): number => {
  const isLeftArm = danceFrame % 2 === 0;

  if (player === 1) {
    // Player 1 alternates: left arm (135°) then right arm (45°)
    return isLeftArm ? (Math.PI * 3) / 4 : Math.PI / 4;
  } else {
    // Player 2 alternates: right arm (45°) then left arm (135°)
    return isLeftArm ? Math.PI / 4 : (Math.PI * 3) / 4;
  }
};

/**
 * Determines if a gorilla should be hidden
 */
export const shouldHideGorilla = (
  gorillaPlayer: 1 | 2,
  winner: number | null,
  gameOver: boolean
): boolean => {
  if (!gameOver || !winner) return false;
  // Hide the gorilla that lost (opposite of winner)
  return gorillaPlayer !== winner;
};

/**
 * Calculates the arm angle for a gorilla based on game state
 */
export const calculateGorillaArmAngle = (
  gorilla: Gorilla,
  options: {
    isDancing: boolean;
    danceFrame: number;
    isThrowing: boolean;
    isCurrentPlayer: boolean;
    winner: number | null;
  }
): number => {
  const { isDancing, danceFrame, isThrowing, isCurrentPlayer, winner } =
    options;

  // If dancing (won), show dance animation
  if (isDancing && winner === gorilla.player) {
    return getDanceArmAngle(danceFrame, gorilla.player as 1 | 2);
  }

  // If throwing, show throwing arm
  if (isThrowing && isCurrentPlayer) {
    return getThrowingArmAngle(gorilla.player as 1 | 2);
  }

  // If current player (not throwing), show ready pose
  if (isCurrentPlayer) {
    return gorilla.player === 1 ? Math.PI / 4 : (Math.PI * 3) / 4;
  }

  // Otherwise, arms down
  return 0;
};

/**
 * Calculates sun mood based on game events
 */
export type SunMood = "happy" | "shocked";

export const calculateSunMood = (wasHitBySun: boolean): SunMood => {
  return wasHitBySun ? "shocked" : "happy";
};

/**
 * Formats wind display text
 */
export const formatWindText = (wind: number): string => {
  if (wind === 0) return "No Wind";
  const direction = wind > 0 ? "→" : "←";
  return `Wind: ${direction} ${Math.abs(wind).toFixed(1)}`;
};

/**
 * Calculates explosion animation scale based on frame
 */
export const calculateExplosionScale = (frame: number): number => {
  if (frame < 6) {
    // Growing phase
    return frame / 6;
  } else if (frame < 10) {
    // Hold at full size
    return 1;
  } else {
    // Fading/shrinking phase
    return Math.max(0, 1 - (frame - 10) / 5);
  }
};

/**
 * Determines if explosion smoke should be drawn
 */
export const shouldDrawExplosionSmoke = (
  frame: number,
  scale: number
): boolean => {
  return frame < 10 && scale > 0.2;
};
