/**
 * Pure functions for game state transformations
 */

import type { GameState, Building, Gorilla } from "../types";
import { GORILLA } from "../constants";
import { generateBuildings, selectGorillaBuilding } from "./buildings";
import { generateWind, createProjectile } from "./physics";
import { isPointInCircle, doesCircleIntersectRect } from "../utils/math";

/**
 * Creates initial game state
 */
export const createInitialGameState = (): GameState => {
  const buildings = generateBuildings();
  const { gorilla1, gorilla2 } = placeGorillas(buildings);

  return {
    buildings,
    gorilla1,
    gorilla2,
    currentPlayer: 1,
    scores: [0, 0],
    wind: generateWind(),
    projectile: null,
    gameOver: false,
    winner: null,
  };
};

/**
 * Places gorillas on buildings
 */
export const placeGorillas = (
  buildings: Building[]
): { gorilla1: Gorilla; gorilla2: Gorilla } => {
  const numBuildings = buildings.length;

  const building1Index = selectGorillaBuilding(numBuildings, true);
  const building2Index = selectGorillaBuilding(numBuildings, false);

  const building1 = buildings[building1Index];
  const building2 = buildings[building2Index];

  // Center gorilla on building with proper Y adjustment
  const xAdj = 0.5;
  const yAdj = 35;

  return {
    gorilla1: {
      x: building1.x + building1.width / 2 - xAdj,
      y: building1.y - yAdj,
      player: 1,
    },
    gorilla2: {
      x: building2.x + building2.width / 2 - xAdj,
      y: building2.y - yAdj,
      player: 2,
    },
  };
};

/**
 * Initiates a throw, returning updated game state
 */
export const initiateThrow = (
  state: GameState,
  angleDegrees: number,
  velocity: number
): GameState => {
  // Special case: velocity < 2 causes immediate self-hit
  if (velocity < 2) {
    const winner = state.currentPlayer === 1 ? 2 : 1;
    const newScores: [number, number] = [...state.scores];
    newScores[winner - 1]++;

    return {
      ...state,
      winner,
      scores: newScores,
      gameOver: true,
      projectile: null,
    };
  }

  const shooter = state.currentPlayer === 1 ? state.gorilla1 : state.gorilla2;
  const projectile = createProjectile(shooter, angleDegrees, velocity);

  return {
    ...state,
    projectile,
  };
};

/**
 * Handles projectile hit, returning updated game state
 */
export const handleProjectileHit = (
  state: GameState,
  target: number | "building" | "sun" | null
): GameState => {
  const newState: GameState = {
    ...state,
    projectile: null,
  };

  if (target === 1 || target === 2) {
    // Gorilla was hit - the OTHER player wins
    const winner = target === 1 ? 2 : 1;
    const newScores: [number, number] = [...state.scores];
    newScores[winner - 1]++;

    return {
      ...newState,
      winner,
      scores: newScores,
      gameOver: true,
    };
  } else if (target === "sun" || target === "building" || target === null) {
    // Miss - switch players
    return {
      ...newState,
      currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    };
  }

  return newState;
};

/**
 * Applies explosion damage to buildings
 */
export const applyExplosionDamage = (
  buildings: Building[],
  explosionX: number,
  explosionY: number,
  explosionRadius: number
): Building[] => {
  return buildings.map((building) => {
    // Check if explosion affects this building
    const affectsBuilding = doesCircleIntersectRect(
      explosionX,
      explosionY,
      explosionRadius,
      building.x,
      building.y,
      building.width,
      building.height
    );

    if (!affectsBuilding) {
      return building;
    }

    // Add explosion hole
    const newExplosions = [
      ...building.explosions,
      { x: explosionX, y: explosionY, radius: explosionRadius },
    ];

    // Remove windows within explosion radius
    const newWindows = building.windows.filter((window) => {
      return !isPointInCircle(
        window.x,
        window.y,
        explosionX,
        explosionY,
        explosionRadius
      );
    });

    return {
      ...building,
      explosions: newExplosions,
      windows: newWindows,
    };
  });
};

/**
 * Checks if explosion hits a gorilla and updates game state accordingly
 */
export const handleExplosionGorillaHit = (
  state: GameState,
  explosionX: number,
  explosionY: number,
  explosionRadius: number
): GameState => {
  // Check both gorillas
  const gorillas = [state.gorilla1, state.gorilla2];

  for (const gorilla of gorillas) {
    const distance = Math.sqrt(
      (gorilla.x - explosionX) ** 2 + (gorilla.y - explosionY) ** 2
    );

    if (distance <= explosionRadius + GORILLA.width / 2) {
      // Gorilla was hit by explosion
      const hitPlayer = gorilla.player;
      const winner = hitPlayer === 1 ? 2 : 1;

      if (!state.gameOver) {
        const newScores: [number, number] = [...state.scores];
        newScores[winner - 1]++;

        return {
          ...state,
          winner,
          gameOver: true,
          scores: newScores,
        };
      }
    }
  }

  return state;
};

/**
 * Applies explosion to game state (damage + gorilla hit check)
 */
export const applyExplosion = (
  state: GameState,
  explosionX: number,
  explosionY: number,
  explosionRadius: number
): GameState => {
  // Apply building damage
  const damagedBuildings = applyExplosionDamage(
    state.buildings,
    explosionX,
    explosionY,
    explosionRadius
  );

  const stateWithDamage = {
    ...state,
    buildings: damagedBuildings,
  };

  // Check for gorilla hits
  return handleExplosionGorillaHit(
    stateWithDamage,
    explosionX,
    explosionY,
    explosionRadius
  );
};

/**
 * Starts a new round, preserving scores
 */
export const startNewRound = (state: GameState): GameState => {
  const scores = state.scores;
  const newState = createInitialGameState();

  return {
    ...newState,
    scores,
  };
};

/**
 * Completely resets the game
 */
export const resetGame = (): GameState => {
  return createInitialGameState();
};
