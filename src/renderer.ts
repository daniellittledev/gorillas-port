import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COLORS,
  BUILDING,
  GORILLA,
} from "./constants";
import type { Building, Gorilla } from "./types";
import {
  formatWindText,
  calculateExplosionScale,
  shouldDrawExplosionSmoke,
  type SunMood,
} from "./presentation/renderUtils";

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Failed to get canvas context");

    // Disable anti-aliasing for sharp pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  drawBuildings(buildings: Building[]): void {
    buildings.forEach((building) => {
      // Draw building outline (black border)
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        building.x - 1,
        building.y - 1,
        building.width + 2,
        building.height + 2
      );

      // Draw building filled
      this.ctx.fillStyle = building.color;
      this.ctx.fillRect(
        building.x,
        building.y,
        building.width,
        building.height
      );

      // Draw windows from stored data
      const wWidth = BUILDING.windowWidth;
      const wHeight = BUILDING.windowHeight;

      building.windows.forEach((window) => {
        this.ctx.fillStyle = window.lit ? COLORS.window : "#555555";
        this.ctx.fillRect(window.x, window.y, wWidth, wHeight);
      });

      // Draw explosion damage (blast holes) - render as background color circles
      building.explosions.forEach((explosion) => {
        this.ctx.fillStyle = COLORS.background;
        this.ctx.beginPath();
        this.ctx.arc(
          explosion.x,
          explosion.y,
          explosion.radius,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      });
    });
  }

  drawGorilla(gorilla: Gorilla, armAngle: number = 0): void {
    const { x, y } = gorilla;
    const scl = GORILLA.scl;

    // Determine arm position: 1 = right up, 2 = left up, 3 = both down
    let arms = 3; // default both down
    if (armAngle !== 0) {
      // Use armAngle to determine which arm:
      // Math.PI/4 (45°) = right arm up (arms=1)
      // Math.PI*3/4 (135°) = left arm up (arms=2)
      // For throwing, player 1 uses right arm, player 2 uses left arm
      if (armAngle === Math.PI / 4) {
        arms = 1; // right arm up
      } else if (armAngle === (Math.PI * 3) / 4) {
        arms = 2; // left arm up
      } else {
        // Fallback to player-based for other angles
        arms = gorilla.player === 1 ? 1 : 2;
      }
    }

    // Draw head
    this.ctx.fillStyle = COLORS.gorilla;
    // LINE (x - Scl(4), y)-(x + Scl(2.9), y + Scl(6))
    this.ctx.fillRect(x - scl(4), y, scl(4) + scl(2.9), scl(6));
    // LINE (x - Scl(5), y + Scl(2))-(x + Scl(4), y + Scl(4))
    this.ctx.fillRect(x - scl(5), y + scl(2), scl(5) + scl(4), scl(2));

    // Draw eyes/brow line
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(3), y + scl(2));
    this.ctx.lineTo(x + scl(2), y + scl(2));
    this.ctx.stroke();

    // Draw nose (EGA mode - we're always in EGA equivalent)
    // Original: PSET (x + i, y + 4), 0 for i = -2 to -1
    // Original: PSET (x + i + 3, y + 4), 0 for i = -2 to -1
    this.ctx.fillStyle = "#000000";
    // Left nostril
    this.ctx.fillRect(x - 2, y + 4, 1, 1);
    this.ctx.fillRect(x - 1, y + 4, 1, 1);
    // Right nostril
    this.ctx.fillRect(x + 1, y + 4, 1, 1);
    this.ctx.fillRect(x + 2, y + 4, 1, 1);

    // Neck - draw as a line
    this.ctx.strokeStyle = COLORS.gorilla;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(3), y + scl(7));
    this.ctx.lineTo(x + scl(2), y + scl(7));
    this.ctx.stroke();

    // Body - draw as filled rectangles matching original
    this.ctx.fillStyle = COLORS.gorilla;
    // Upper body: LINE (x - Scl(8), y + Scl(8))-(x + Scl(6.9), y + Scl(14)), OBJECTCOLOR, BF
    this.ctx.fillRect(
      x - scl(8),
      y + scl(8),
      scl(8) + scl(6.9),
      scl(14) - scl(8)
    );
    // Lower body: LINE (x - Scl(6), y + Scl(15))-(x + Scl(4.9), y + Scl(20)), OBJECTCOLOR, BF
    this.ctx.fillRect(
      x - scl(6),
      y + scl(14),
      scl(6) + scl(4.9),
      scl(20) - scl(14)
    );

    // Legs - using arc to draw curved legs
    this.ctx.strokeStyle = COLORS.gorilla;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      // Right leg
      this.ctx.beginPath();
      this.ctx.arc(
        x + scl(i),
        y + scl(25),
        scl(10),
        (3 * Math.PI) / 4,
        (9 * Math.PI) / 8
      );
      this.ctx.stroke();
      // Left leg
      this.ctx.beginPath();
      this.ctx.arc(
        x + scl(-6) + scl(i - 0.1),
        y + scl(25),
        scl(10),
        (15 * Math.PI) / 8,
        Math.PI / 4
      );
      this.ctx.stroke();
    }

    // Chest circles
    this.ctx.strokeStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.arc(x - scl(4.9), y + scl(10), scl(4.9), 0, Math.PI / 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(x + scl(4.9), y + scl(10), scl(4.9), Math.PI / 2, Math.PI);
    this.ctx.stroke();

    // Arms - using arc to draw curved arms
    this.ctx.strokeStyle = COLORS.gorilla;
    this.ctx.lineWidth = 1;
    for (let i = -5; i <= -1; i++) {
      if (arms === 1) {
        // Right arm up
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(i - 0.1),
          y + scl(14),
          scl(9),
          (3 * Math.PI) / 4,
          (5 * Math.PI) / 4
        );
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(4.9) + scl(i),
          y + scl(4),
          scl(9),
          (7 * Math.PI) / 4,
          Math.PI / 4
        );
        this.ctx.stroke();
      } else if (arms === 2) {
        // Left arm up
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(i - 0.1),
          y + scl(4),
          scl(9),
          (3 * Math.PI) / 4,
          (5 * Math.PI) / 4
        );
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(4.9) + scl(i),
          y + scl(14),
          scl(9),
          (7 * Math.PI) / 4,
          Math.PI / 4
        );
        this.ctx.stroke();
      } else {
        // Both arms down
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(i - 0.1),
          y + scl(14),
          scl(9),
          (3 * Math.PI) / 4,
          (5 * Math.PI) / 4
        );
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(
          x + scl(4.9) + scl(i),
          y + scl(14),
          scl(9),
          (7 * Math.PI) / 4,
          Math.PI / 4
        );
        this.ctx.stroke();
      }
    }
  }

  drawSun(mood: SunMood = "happy"): void {
    const x = GAME_WIDTH / 2;
    const y = GORILLA.scl(25);
    const scl = GORILLA.scl;

    // Draw sun body
    this.ctx.fillStyle = COLORS.sun;
    this.ctx.beginPath();
    this.ctx.arc(x, y, scl(12), 0, Math.PI * 2);
    this.ctx.fill();

    // Draw sun rays
    this.ctx.strokeStyle = COLORS.sun;
    this.ctx.lineWidth = 2;

    // Horizontal and vertical rays
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(20), y);
    this.ctx.lineTo(x + scl(20), y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x, y - scl(15));
    this.ctx.lineTo(x, y + scl(15));
    this.ctx.stroke();

    // Diagonal rays (45 degrees)
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(15), y - scl(10));
    this.ctx.lineTo(x + scl(15), y + scl(10));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(15), y + scl(10));
    this.ctx.lineTo(x + scl(15), y - scl(10));
    this.ctx.stroke();

    // Additional diagonal rays
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(8), y - scl(13));
    this.ctx.lineTo(x + scl(8), y + scl(13));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(8), y + scl(13));
    this.ctx.lineTo(x + scl(8), y - scl(13));
    this.ctx.stroke();

    // More diagonal rays
    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(18), y - scl(5));
    this.ctx.lineTo(x + scl(18), y + scl(5));
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x - scl(18), y + scl(5));
    this.ctx.lineTo(x + scl(18), y - scl(5));
    this.ctx.stroke();

    // Face
    this.ctx.fillStyle = "#000000";

    // Mouth
    if (mood === "shocked") {
      // Draw "O" mouth
      this.ctx.beginPath();
      this.ctx.arc(x, y + scl(5), scl(2.9), 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Draw smile - arc centered at sun center, from 210° to 330°
      // In BASIC: CIRCLE (x, y), Scl(8), 0, (210 * pi# / 180), (330 * pi# / 180)
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(
        x,
        y,
        scl(8),
        (30 * Math.PI) / 180,
        (150 * Math.PI) / 180,
        false
      );
      this.ctx.stroke();
    }

    // Eyes
    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.arc(x - 3, y - 2, 1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x + 3, y - 2, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBanana(x: number, y: number, rotation: number = 0): void {
    this.ctx.fillStyle = COLORS.banana;
    this.ctx.save();
    this.ctx.translate(x, y);

    // Smooth rotation in 5-degree increments
    // rotation is in degrees, convert to radians
    const angle = (rotation * Math.PI) / 180;
    this.ctx.rotate(angle);

    // Draw a waxing crescent shape (curved banana)
    this.ctx.beginPath();
    // Outer curve (larger arc)
    this.ctx.arc(0, 0, 4, -Math.PI / 3, Math.PI / 3, false);
    // Inner curve (flatter, thicker) - larger radius and less offset
    this.ctx.arc(2, 0, 5, Math.PI / 3, -Math.PI / 3, true);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  drawExplosion(x: number, y: number, radius: number, frame: number): void {
    // Original animates explosion by drawing concentric circles frame by frame
    // radii(1, 1) = radius, radii(2, 1) = .9 * radius, etc.
    // colors: 4=red, 2=green, 3=cyan, 9=light blue
    const radii = [
      { r1: radius, r2: radius * 0.825, color: "#AA0000" }, // Red
      { r1: radius * 0.9, r2: radius * 0.9 * 0.825, color: "#00AA00" }, // Green
      { r1: radius * 0.6, r2: radius * 0.6 * 0.825, color: "#00AAAA" }, // Cyan
      { r1: radius * 0.45, r2: radius * 0.45 * 0.825, color: "#5555FF" }, // Light blue
    ];

    // Calculate scale using pure function
    const scale = calculateExplosionScale(frame);

    // Draw grey smoke first (outer circle) - only during main explosion
    if (shouldDrawExplosionSmoke(frame, scale)) {
      this.ctx.fillStyle = "#555555";
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius * 1.175 * scale, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw colored explosion layers as ellipses
    for (let i = 0; i < 4; i++) {
      const layer = radii[i];
      const layerScale = scale;

      if (layerScale > 0) {
        this.ctx.fillStyle = layer.color;
        this.ctx.beginPath();
        // Draw ellipse for explosion
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(1, layer.r2 / layer.r1);
        this.ctx.arc(0, 0, layer.r1 * layerScale, 0, Math.PI * 2);
        this.ctx.restore();
        this.ctx.fill();
      }
    }
  }

  drawText(
    text: string,
    x: number,
    y: number,
    size: number = 16,
    color: string = "#FFFFFF"
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px "Courier New", monospace`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, x, y);
  }

  drawWindIndicator(wind: number): void {
    const text = formatWindText(wind);
    // Position below sun to avoid overlap (sun is at y=25, radius=12, rays extend to ~40)
    this.drawText(text, GAME_WIDTH / 2, 55, 14, "#FFFFFF");
  }
}
