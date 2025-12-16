import { DEBUG } from "./constants";
import type { GameState } from "./types";
import {
  createInitialGameState,
  initiateThrow,
  handleProjectileHit,
  applyExplosion,
  startNewRound,
  resetGame,
} from "./domain/gameState";
import { updateProjectile } from "./domain/physics";
import { checkCollisions } from "./domain/collisions";
import type { CollisionResult } from "./domain/collisions";

/**
 * Game class manages the game loop and coordinates between
 * pure domain functions and the game state.
 *
 * This class is now much simpler than before, delegating most logic
 * to pure functions in the domain layer. It acts primarily as a
 * state container and coordinator.
 */
export class Game {
  private state: GameState;

  constructor() {
    this.state = createInitialGameState();
  }

  /**
   * Returns the current game state (read-only access)
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Returns the arm angle for throwing animation for a given player
   */
  getThrowingArmAngleForPlayer(player: 1 | 2): number {
    // Player 1 raises left arm, Player 2 raises right arm
    return player === 1 ? (Math.PI * 3) / 4 : Math.PI / 4;
  }

  /**
   * Initiates a throw with the given angle and velocity
   * Updates the game state with the projectile or immediate result
   */
  fire(angle: number, velocity: number): void {
    if (this.state.projectile || this.state.gameOver) return;
    this.state = initiateThrow(this.state, angle, velocity);
  }

  /**
   * Updates the projectile position and checks for collisions
   * Returns collision result if any
   */
  update(): CollisionResult {
    if (!this.state.projectile || this.state.gameOver) {
      return { hit: false, target: null };
    }

    // Update projectile position
    this.state = {
      ...this.state,
      projectile: updateProjectile(
        this.state.projectile,
        this.state.wind,
        DEBUG.timeScale
      ),
    };

    // Check for collisions
    const hitResult = checkCollisions(
      this.state.projectile!,
      this.state.gorilla1,
      this.state.gorilla2,
      this.state.buildings,
      this.state.currentPlayer
    );

    if (hitResult.hit) {
      // Handle the hit
      this.state = handleProjectileHit(this.state, hitResult.target);
    }

    return hitResult;
  }

  /**
   * Applies explosion damage to buildings and checks for gorilla hits
   * Returns the player number if a gorilla was killed, null otherwise
   */
  clearExplosionArea(x: number, y: number, radius: number): number | null {
    const oldWinner = this.state.winner;
    this.state = applyExplosion(this.state, x, y, radius);

    // Return the player number if a gorilla was killed by the explosion
    if (this.state.gameOver && this.state.winner && !oldWinner) {
      // A gorilla was just killed
      return this.state.winner === 1 ? 2 : 1; // Return the player who was hit
    }

    return null;
  }

  /**
   * Starts a new round while preserving scores
   */
  newRound(): void {
    this.state = startNewRound(this.state);
  }

  /**
   * Completely resets the game including scores
   */
  reset(): void {
    this.state = resetGame();
  }
}
