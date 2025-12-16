import { Game } from "./game";
import { Renderer } from "./renderer";
import { EXPLOSION, DEBUG } from "./constants";

export class GameController {
  private game: Game;
  private renderer: Renderer;
  private animationId: number | null = null;
  private explosionFrame: number = 0;
  private explosionPos: { x: number; y: number } | null = null;
  private sunMood: "happy" | "shocked" = "happy";
  private isDancing: boolean = false;
  private danceFrame: number = 0;
  private throwingArm: 1 | 2 | null = null; // Which arm is being animated for throw

  // UI elements
  private infoElement: HTMLElement;
  private scoreElement: HTMLElement;
  private angleInput: HTMLInputElement;
  private velocityInput: HTMLInputElement;
  private fireButton: HTMLButtonElement;
  private newGameButton: HTMLButtonElement;

  constructor(canvas: HTMLCanvasElement) {
    this.game = new Game();
    this.renderer = new Renderer(canvas);

    // Get UI elements
    this.infoElement = document.getElementById("info")!;
    this.scoreElement = document.getElementById("score")!;
    this.angleInput = document.getElementById("angleInput") as HTMLInputElement;
    this.velocityInput = document.getElementById(
      "velocityInput"
    ) as HTMLInputElement;
    this.fireButton = document.getElementById(
      "fireButton"
    ) as HTMLButtonElement;
    this.newGameButton = document.getElementById(
      "newGameButton"
    ) as HTMLButtonElement;

    this.setupEventListeners();
    this.updateUI();
    this.render();
  }

  private setupEventListeners(): void {
    this.fireButton.addEventListener("click", () => this.handleFire());
    this.newGameButton.addEventListener("click", () => this.handleNewGame());

    // Allow Enter key to fire
    const fireOnEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        this.handleFire();
      }
    };
    this.angleInput.addEventListener("keypress", fireOnEnter);
    this.velocityInput.addEventListener("keypress", fireOnEnter);
  }

  private handleFire(): void {
    const state = this.game.getState();
    if (state.projectile || state.gameOver) return;

    const angle = parseInt(this.angleInput.value);
    const velocity = parseInt(this.velocityInput.value);

    if (angle < 1 || angle > 179 || velocity < 1 || velocity > 200) {
      this.infoElement.textContent =
        "Invalid input! Angle: 1-179, Velocity: 1-200";
      return;
    }

    // Store current player before firing
    const currentPlayer = state.currentPlayer;

    // Animate throw - store which player is throwing for render method
    this.throwingArm = currentPlayer;
    this.fireButton.disabled = true;
    this.render();

    // Wait for throw animation (scaled by debug time scale), then fire
    setTimeout(() => {
      this.throwingArm = null;
      this.render();

      this.game.fire(angle, velocity);

      // Check if velocity < 2 caused immediate self-kill
      const newState = this.game.getState();
      if (newState.gameOver && !newState.projectile) {
        // Self-kill: trigger explosion at gorilla position
        const hitGorilla =
          currentPlayer === 1 ? newState.gorilla1 : newState.gorilla2;
        this.explosionPos = { x: hitGorilla.x, y: hitGorilla.y };
        this.explosionFrame = 0;
        this.animateExplosion();
      } else {
        this.startGameLoop();
      }
    }, 100 / DEBUG.timeScale); // Scale animation delay by time scale
  }

  private handleNewGame(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.game.reset();
    this.explosionFrame = 0;
    this.explosionPos = null;
    this.sunMood = "happy";
    this.fireButton.disabled = false;
    this.updateUI();
    this.render();
  }

  private startGameLoop(): void {
    if (this.animationId) return;

    // Original uses Rest .02 between updates (20ms)
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const elapsed = now - lastTime;

      // Only update at ~50fps to match original Rest .02 timing
      if (elapsed >= 20) {
        lastTime = now;

        const hitResult = this.game.update();

        if (hitResult.hit) {
          const state = this.game.getState();

          // Cancel animation loop for all hits
          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }

          // Sun hits don't cause explosions in the original - banana just passes through
          if (hitResult.target === "sun") {
            this.sunMood = "shocked";
            this.render(); // Show shocked sun immediately
            // Wait before continuing with next player's turn
            setTimeout(() => {
              this.sunMood = "happy";
              this.fireButton.disabled = false;
              this.updateUI(); // This will show the new currentPlayer
              this.render();
            }, 1000); // Wait 1 second before continuing
            return;
          }

          // If target is null (went off screen), just switch turns without explosion
          if (hitResult.target === null) {
            this.fireButton.disabled = false;
            this.updateUI(); // This will show the new currentPlayer
            this.render();
            return;
          }

          // Use hit position from result (set before projectile was nulled)
          if (hitResult.hitX !== undefined && hitResult.hitY !== undefined) {
            this.explosionPos = { x: hitResult.hitX, y: hitResult.hitY };
          } else if (hitResult.target === 1) {
            this.explosionPos = { x: state.gorilla1.x, y: state.gorilla1.y };
          } else if (hitResult.target === 2) {
            this.explosionPos = { x: state.gorilla2.x, y: state.gorilla2.y };
          }

          this.explosionFrame = 0;
          this.animateExplosion();
          return;
        }

        this.render();
      }

      this.animationId = requestAnimationFrame(loop);
    };

    loop();
  }

  private animateExplosion(): void {
    if (!this.explosionPos) return;

    // Clear building area at explosion location (matching original BASIC behavior)
    // This may also kill a gorilla if they're within the blast radius
    this.game.clearExplosionArea(
      this.explosionPos.x,
      this.explosionPos.y,
      EXPLOSION.radius
    );

    const explode = () => {
      this.explosionFrame++;
      this.render();

      if (this.explosionFrame < 15) {
        requestAnimationFrame(explode);
      } else {
        this.explosionFrame = 0;
        this.explosionPos = null;

        const state = this.game.getState();

        // Cancel the main animation loop since explosion is done
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }

        if (state.gameOver && state.winner) {
          // Start victory dance
          this.victoryDance();
        } else {
          this.fireButton.disabled = false;
          this.updateUI();
        }
      }
    };

    explode();
  }

  private victoryDance(): void {
    // Original: FOR i# = 1 TO 4 - alternates between left and right arm raised
    this.isDancing = true;
    this.danceFrame = 0;

    // Update UI to show winner immediately
    this.updateUI();

    const dance = () => {
      // danceFrame % 2 determines arm position: 0 = left arm, 1 = right arm
      this.render(); // Will use danceFrame to determine arm position

      this.danceFrame++;

      // 4 iterations * 2 positions = 8 frames total
      if (this.danceFrame < 8) {
        setTimeout(() => dance(), 200); // 200ms delay like original Rest .2
      } else {
        this.isDancing = false;
        this.danceFrame = 0;

        // After dance, wait then start new round
        setTimeout(() => {
          this.game.newRound();
          this.sunMood = "happy";
          this.updateUI();
          this.render();
          this.fireButton.disabled = false;
        }, 500);
      }
    };

    dance();
  }

  private updateUI(): void {
    const state = this.game.getState();
    const playerName =
      state.currentPlayer === 1 ? "Player 1 (Left)" : "Player 2 (Right)";

    if (state.gameOver && state.winner) {
      this.infoElement.textContent = `Player ${state.winner} wins this round!`;
    } else {
      this.infoElement.textContent = `${playerName}'s turn`;
    }

    this.scoreElement.textContent = `Score - Player 1: ${state.scores[0]} | Player 2: ${state.scores[1]}`;
  }

  private render(): void {
    const state = this.game.getState();

    this.renderer.clear();
    this.renderer.drawBuildings(state.buildings);
    this.renderer.drawSun(this.sunMood);
    this.renderer.drawWindIndicator(state.wind);

    // Draw gorillas
    const armAngle =
      state.currentPlayer === 1 ? Math.PI / 4 : (Math.PI * 3) / 4;
    // Hide the gorilla that was HIT (the loser), not the winner
    // If player 1 won, hide player 2 (and vice versa)
    if (!state.gameOver || state.winner !== 2) {
      const isPlayer1Dancing = this.isDancing && state.winner === 1;
      // Check if player 1 is throwing
      const isPlayer1Throwing =
        this.throwingArm !== null && state.currentPlayer === 1;
      const throwArmAngle = isPlayer1Throwing
        ? this.game.getThrowingArmAngleForPlayer(1)
        : 0;
      const danceArmAngle = isPlayer1Dancing
        ? this.danceFrame % 2 === 0
          ? (Math.PI * 3) / 4
          : Math.PI / 4 // alternate arms
        : isPlayer1Throwing
        ? throwArmAngle
        : state.currentPlayer === 1
        ? armAngle
        : 0;
      this.renderer.drawGorilla(state.gorilla1, danceArmAngle);
    }
    if (!state.gameOver || state.winner !== 1) {
      const isPlayer2Dancing = this.isDancing && state.winner === 2;
      // Check if player 2 is throwing
      const isPlayer2Throwing =
        this.throwingArm !== null && state.currentPlayer === 2;
      const throwArmAngle = isPlayer2Throwing
        ? this.game.getThrowingArmAngleForPlayer(2)
        : 0;
      const danceArmAngle = isPlayer2Dancing
        ? this.danceFrame % 2 === 0
          ? Math.PI / 4
          : (Math.PI * 3) / 4 // alternate arms
        : isPlayer2Throwing
        ? throwArmAngle
        : state.currentPlayer === 2
        ? armAngle
        : 0;
      this.renderer.drawGorilla(state.gorilla2, danceArmAngle);
    }

    // Draw projectile with rotation
    if (state.projectile) {
      this.renderer.drawBanana(
        state.projectile.x,
        state.projectile.y,
        state.projectile.rotation
      );
    }

    // Draw explosion
    if (this.explosionPos && this.explosionFrame > 0) {
      this.renderer.drawExplosion(
        this.explosionPos.x,
        this.explosionPos.y,
        EXPLOSION.radius,
        this.explosionFrame
      );
    }
  }

  start(): void {
    this.render();
  }
}
