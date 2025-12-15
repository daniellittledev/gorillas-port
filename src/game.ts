import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  PHYSICS,
  GORILLA,
} from "./constants";
import type { Building, Gorilla, GameState, Projectile } from "./types";

export class Game {
  private state: GameState;

  constructor() {
    this.state = this.initGame();
  }

  private initGame(): GameState {
    const buildings = this.generateBuildings();
    const { gorilla1, gorilla2 } = this.placeGorillas(buildings);

    return {
      buildings,
      gorilla1,
      gorilla2,
      currentPlayer: 1,
      scores: [0, 0],
      wind: this.generateWind(),
      projectile: null,
      gameOver: false,
      winner: null,
    };
  }

  private generateBuildings(): Building[] {
    const buildings: Building[] = [];
    let x = 2;

    // Set the sloping trend of the city scape
    const slope = Math.floor(Math.random() * 6) + 1;
    let newHt: number;

    switch (slope) {
      case 1:
        newHt = 15;
        break; // Upward slope
      case 2:
        newHt = 130;
        break; // Downward slope
      case 3:
      case 4:
      case 5:
        newHt = 15;
        break; // "V" slope - most common
      case 6:
        newHt = 130;
        break; // Inverted "V" slope
      default:
        newHt = 15;
    }

    const htInc = 10;
    const defBWidth = 37;
    const randomHeight = 120;
    const bottomLine = 335;
    const maxHeight = 60; // Approximate max height limit

    while (x < GAME_WIDTH) {
      // Adjust height based on slope
      switch (slope) {
        case 1:
          newHt = newHt + htInc;
          break;
        case 2:
          newHt = newHt - htInc;
          break;
        case 3:
        case 4:
        case 5:
          if (x > GAME_WIDTH / 2) {
            newHt = newHt - 2 * htInc;
          } else {
            newHt = newHt + 2 * htInc;
          }
          break;
        case 6:
          if (x > GAME_WIDTH / 2) {
            newHt = newHt + 2 * htInc;
          } else {
            newHt = newHt - 2 * htInc;
          }
          break;
      }

      // Set width of building
      let bWidth = Math.floor(Math.random() * defBWidth) + defBWidth;
      if (x + bWidth > GAME_WIDTH) {
        bWidth = GAME_WIDTH - x - 2;
      }

      // Set height of building
      let bHeight = Math.floor(Math.random() * randomHeight) + newHt;
      if (bHeight < htInc) {
        bHeight = htInc;
      }

      // Check if building is too high
      if (bottomLine - bHeight <= maxHeight + GORILLA.height) {
        bHeight = maxHeight + GORILLA.height - 5;
      }

      const buildingY = bottomLine - bHeight;

      // Randomly select building color (original uses FNRan(3) + 4 which gives colors 5, 6, 7)
      // Colors in EGA: 4=red, 5=magenta, 6=brown, 7=white
      const colors = ["#AA0000", "#AA00AA", "#AA5500", "#AAAAAA"];
      const buildingColor = colors[Math.floor(Math.random() * colors.length)];

      // Generate windows once
      const windows: { x: number; y: number; lit: boolean }[] = [];
      const wDifh = 15; // vertical spacing
      const wDifV = 10; // horizontal spacing

      let c = x + 3;
      while (c < x + bWidth - 3) {
        for (let i = bHeight - 3; i >= 7; i -= wDifh) {
          const lit = Math.floor(Math.random() * 4) !== 0; // 75% lit
          const wx = c;
          const wy = bottomLine - i;
          windows.push({ x: wx, y: wy, lit });
        }
        c += wDifV;
      }

      buildings.push({
        x,
        y: buildingY,
        width: bWidth,
        height: bHeight,
        color: buildingColor,
        windows,
        explosions: [], // No damage initially
      });

      x += bWidth + 2;
    }

    return buildings;
  }

  private placeGorillas(buildings: Building[]): {
    gorilla1: Gorilla;
    gorilla2: Gorilla;
  } {
    // Original: Place gorillas on second or third building from edge
    // FOR i = 1 TO 2
    //   IF i = 1 THEN BNum = FNRan(2) + 1 ELSE BNum = LastBuilding - FNRan(2)
    const numBuildings = buildings.length;

    // Player 1: 2nd or 3rd building from left (index 1 or 2)
    const building1Index = Math.floor(Math.random() * 2) + 1;

    // Player 2: 2nd or 3rd building from right
    const building2Index =
      numBuildings - 1 - (Math.floor(Math.random() * 2) + 1);

    const building1 = buildings[Math.min(building1Index, numBuildings - 1)];
    const building2 = buildings[Math.max(0, building2Index)];

    // YAdj = 30 for EGA mode (original BASIC code)
    // XAdj = 14 for EGA mode
    // GorillaX(i) = BCoor(BNum).XCoor + BWidth / 2 - XAdj
    // GorillaY(i) = BCoor(BNum).YCoor - YAdj
    const xAdj = 14;
    const yAdj = 30;

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
  }

  private generateWind(): number {
    // Original: Wind = FNRan(10) - 5
    // FNRan(10) returns 1-10, so Wind ranges from -4 to 5
    let wind = Math.floor(Math.random() * 10) + 1 - 5;

    // Original: IF FNRan(3) = 1 THEN add more wind (1 in 3 chance)
    if (Math.floor(Math.random() * 3) + 1 === 1) {
      if (wind > 0) {
        wind = wind + Math.floor(Math.random() * 10) + 1;
      } else {
        wind = wind - (Math.floor(Math.random() * 10) + 1);
      }
    }

    return wind;
  }

  getState(): GameState {
    return this.state;
  }

  fire(angle: number, velocity: number): void {
    if (this.state.projectile || this.state.gameOver) return;

    const shooter =
      this.state.currentPlayer === 1
        ? this.state.gorilla1
        : this.state.gorilla2;
    const angleRad = (angle * Math.PI) / 180;

    // Flip angle for player 2 (shooting left)
    const actualAngle =
      this.state.currentPlayer === 2 ? Math.PI - angleRad : angleRad;

    // Calculate initial velocities
    const initVx = Math.cos(actualAngle) * velocity;
    const initVy = Math.sin(actualAngle) * velocity;

    // Original: adjust = Scl(4), StartYPos = StartY - adjust - 3
    const adjust = GORILLA.scl(4);

    // Original: StartXPos = StartX
    // IF PlayerNum = 2 THEN StartXPos = StartXPos + Scl(25)
    // This positions the banana at the gorilla's throwing arm
    let startX = shooter.x;
    if (this.state.currentPlayer === 2) {
      startX = startX + GORILLA.scl(25);
    } else {
      // Player 1 needs slight adjustment to throw from center/right arm
      startX = startX + GORILLA.scl(5);
    }
    const startY = shooter.y - adjust - 3;

    // Special case: velocity < 2 causes immediate self-hit
    // The banana doesn't even move - player hits themselves immediately
    if (velocity < 2) {
      // The shooter immediately explodes
      this.state.winner = this.state.currentPlayer === 1 ? 2 : 1;
      this.state.scores[this.state.winner - 1]++;
      this.state.gameOver = true;
      // Don't create a projectile at all
      this.state.projectile = null;
      return;
    }

    this.state.projectile = {
      x: startX,
      y: startY,
      vx: initVx,
      vy: -initVy,
      angle: actualAngle,
      startX,
      startY,
      initVx,
      initVy,
      time: 0,
      rotation: 0,
    };
  }

  update(): {
    hit: boolean;
    target: number | "building" | "sun" | null;
    hitX?: number;
    hitY?: number;
  } {
    if (!this.state.projectile || this.state.gameOver) {
      return { hit: false, target: null };
    }

    const p = this.state.projectile;

    // Original physics formula:
    // x# = StartXPos + (InitXVel# * t#) + (.5 * (Wind / 5) * t# ^ 2)
    // y# = StartYPos + ((-1 * (InitYVel# * t#)) + (.5 * Gravity * t# ^ 2)) * (ScrHeight / 350)

    const t = p.time;
    p.x =
      p.startX +
      p.initVx * t +
      0.5 * (this.state.wind / PHYSICS.windDivisor) * t * t;
    p.y =
      p.startY +
      (-1 * (p.initVy * t) + 0.5 * GRAVITY * t * t) * PHYSICS.gravityScale;

    // Update rotation: smooth rotation in 5-degree increments
    // Rotate at ~100 degrees per second for smooth animation
    p.rotation = (t * 100) % 360;

    // Increment time
    p.time += PHYSICS.timeStep;

    // Check for hits
    const hitResult = this.checkCollisions(p);

    if (hitResult.hit) {
      // Store hit position BEFORE nulling projectile
      hitResult.hitX = p.x;
      hitResult.hitY = p.y;

      this.state.projectile = null;

      if (hitResult.target === 1 || hitResult.target === 2) {
        // In original BASIC: the player that was HIT loses, other player wins
        // If you hit yourself, you lose and opponent wins
        const hitPlayer = hitResult.target;
        this.state.winner = hitPlayer === 1 ? 2 : 1; // Winner is the one NOT hit
        this.state.scores[this.state.winner - 1]++;
        this.state.gameOver = true;
      } else {
        // Switch players if miss
        this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
      }
    }

    return hitResult;
  }

  private checkCollisions(p: Projectile): {
    hit: boolean;
    target: number | "building" | "sun" | null;
    hitX?: number;
    hitY?: number;
  } {
    // Original: IF OnScreen AND y# > 0 AND (x# > 3 AND x# < (ScrWidth - Scl(10)))
    const scl10 = GORILLA.scl(10);

    // Check if hit bottom - this causes explosion
    if (p.y >= GAME_HEIGHT - 7) {
      return { hit: true, target: "building" };
    }

    // If y <= 0, banana is above screen - don't check collisions, let it continue
    // Original: collision check only happens when y# > 0
    if (p.y <= 0) {
      return { hit: false, target: null };
    }

    // If banana goes off sides, just end turn without explosion
    // Original: sets OnScreen = FALSE when off sides, no explosion
    if (p.x <= 3 || p.x >= GAME_WIDTH - scl10) {
      return { hit: true, target: null }; // Hit but no target = just end turn
    }

    // Check sun hit
    const sunX = GAME_WIDTH / 2;
    const sunY = GORILLA.scl(25);
    const sunRadius = GORILLA.scl(12);
    const distToSun = Math.sqrt((p.x - sunX) ** 2 + (p.y - sunY) ** 2);
    if (distToSun < sunRadius) {
      return { hit: true, target: "sun" };
    }

    // Original collision detection uses offset checking:
    // LookX = Scl(8 * (2 - PlayerNum)) - starts at 8 for player 1, 0 for player 2
    // Direction = Scl(4) or Scl(-4)
    // Checks multiple points: (x + LookX, y + LookY) where LookY = 0 and Scl(6)

    const direction =
      this.state.currentPlayer === 1 ? GORILLA.scl(-4) : GORILLA.scl(4);
    let lookX = GORILLA.scl(8 * (2 - this.state.currentPlayer));

    // Check collision points (simplified version of the loop)
    for (let i = 0; i < 2; i++) {
      const lookY = i * GORILLA.scl(6);
      const checkX = p.x + lookX;
      const checkY = p.y + lookY;

      // Check gorilla hits - only check opponent
      const opponent =
        this.state.currentPlayer === 1
          ? this.state.gorilla2
          : this.state.gorilla1;
      if (
        checkX >= opponent.x - GORILLA.scl(15) &&
        checkX <= opponent.x + GORILLA.scl(14) &&
        checkY >= opponent.y - GORILLA.scl(1) &&
        checkY <= opponent.y + GORILLA.scl(28)
      ) {
        return { hit: true, target: opponent.player };
      }

      // Check building hits - only when banana is falling (going down)
      // This allows banana to pass through on the way up
      const currentVy = -p.initVy + GRAVITY * p.time * PHYSICS.gravityScale;
      const isGoingDown = currentVy > 0;

      if (isGoingDown) {
        for (const building of this.state.buildings) {
          if (
            checkX >= building.x &&
            checkX <= building.x + building.width &&
            checkY >= building.y &&
            checkY <= building.y + building.height
          ) {
            // Check if collision point is inside any explosion hole (destroyed area)
            let isInDestroyedArea = false;
            for (const explosion of building.explosions) {
              const dx = checkX - explosion.x;
              const dy = checkY - explosion.y;
              const distanceToExplosion = Math.sqrt(dx * dx + dy * dy);
              if (distanceToExplosion <= explosion.radius) {
                isInDestroyedArea = true;
                break;
              }
            }

            // Only register hit if not in a destroyed area
            if (!isInDestroyedArea) {
              return { hit: true, target: "building" };
            }
          }
        }
      }

      lookX += direction;
      if (lookX !== GORILLA.scl(4)) break; // LOOP UNTIL Impact OR LookX <> Scl(4)
    }

    return { hit: false, target: null };
  }

  // Clear building pixels in explosion area (original uses CIRCLE with BACKATTR)
  // Returns the player number if a gorilla was killed by the explosion, null otherwise
  clearExplosionArea(x: number, y: number, radius: number): number | null {
    // Add explosion damage to buildings and remove windows within blast radius
    this.state.buildings.forEach((building) => {
      // Check if explosion affects this building
      const buildingRight = building.x + building.width;
      const buildingBottom = building.y + building.height;

      // If explosion circle intersects building rectangle
      if (
        x + radius >= building.x &&
        x - radius <= buildingRight &&
        y + radius >= building.y &&
        y - radius <= buildingBottom
      ) {
        // Add this explosion hole to the building
        building.explosions.push({ x, y, radius });
      }

      // Remove windows that are within explosion radius
      building.windows = building.windows.filter((window) => {
        const dx = window.x - x;
        const dy = window.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > radius;
      });
    });

    // Check if explosion hits either gorilla (matching original CIRCLE with BACKATTR behavior)
    // Original: CIRCLE (x#, y#), c#, BACKATTR erases everything including gorillas
    const gorillas = [
      { ...this.state.gorilla1, player: 1 },
      { ...this.state.gorilla2, player: 2 },
    ];

    for (const gorilla of gorillas) {
      // Check if gorilla center is within explosion radius
      const dx = gorilla.x - x;
      const dy = gorilla.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If gorilla is within explosion, they're hit
      // Use a generous check since gorilla sprite is ~30x28 pixels
      if (distance <= radius + GORILLA.width / 2) {
        // The gorilla that was HIT loses, the OTHER gorilla wins
        const hitPlayer = gorilla.player;
        const winningPlayer = hitPlayer === 1 ? 2 : 1;

        // Only update game state if not already gameOver
        if (!this.state.gameOver) {
          this.state.winner = winningPlayer;
          this.state.gameOver = true;
          this.state.scores[winningPlayer - 1]++;
          return hitPlayer;
        }
      }
    }

    return null;
  }

  newRound(): void {
    const scores = this.state.scores;
    this.state = this.initGame();
    this.state.scores = scores;
  }

  reset(): void {
    this.state = this.initGame();
  }
}
