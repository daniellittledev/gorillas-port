// Types
export interface Point {
  x: number;
  y: number;
}

export interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  windows: { x: number; y: number; lit: boolean }[];
  explosions: { x: number; y: number; radius: number }[]; // Blast holes in building
}

export interface Gorilla {
  x: number;
  y: number;
  player: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number; // Current horizontal velocity
  vy: number; // Current vertical velocity
  angle: number;
  startX: number; // StartXPos in original
  startY: number; // StartYPos in original
  initVx: number; // InitXVel# in original
  initVy: number; // InitYVel# in original
  time: number; // t# in original
  rotation: number; // 0-3 for banana sprite rotation
}

export interface GameState {
  buildings: Building[];
  gorilla1: Gorilla;
  gorilla2: Gorilla;
  currentPlayer: 1 | 2;
  scores: [number, number];
  wind: number;
  projectile: Projectile | null;
  gameOver: boolean;
  winner: number | null;
}
