// Game constants
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 350;
export const GRAVITY = 9.8;

// Colors
export const COLORS = {
  background: "#0000AA",
  building: "#AA0000",
  window: "#FFFF00",
  gorilla: "#AA5500",
  sun: "#FFFF00",
  explosion: "#FFFFFF",
  banana: "#FFFF00",
};

// Building configuration - using original BASIC values for EGA mode
export const BUILDING = {
  minWidth: 37, // DefBWidth in original
  maxWidth: 37, // FNRan(DefBWidth) + DefBWidth = 37 to 74
  minHeight: 15, // NewHt starting values
  maxHeight: 135, // RandomHeight (120) + some base
  windowWidth: 3, // WWidth for EGA
  windowHeight: 6, // WHeight for EGA
  windowSpacing: 10, // WDifh for EGA
  windowSpacingV: 15, // WDifV for EGA
  bottomLine: 335, // BottomLine for EGA
};

// Gorilla configuration - using original BASIC scaling
export const GORILLA = {
  // Scale function for converting coordinates (original uses Scl function)
  scl: (n: number): number => Math.round(n),
  width: 30,
  height: 28,
};

// Sun configuration - using original BASIC values
export const SUN = {
  x: GAME_WIDTH / 2,
  y: 25, // Original: Scl(25)
  radius: 12,
  faceRadius: 8,
};

// Explosion configuration
export const EXPLOSION = {
  radius: 30,
  particles: 20,
};

// Physics - matching original BASIC game
export const PHYSICS = {
  timeStep: 0.1, // Original uses t# += .1
  windMin: -5,
  windMax: 5,
  windDivisor: 5, // Wind is divided by 5 in physics formula
  gravityScale: GAME_HEIGHT / 350, // Original scales gravity by ScrHeight / 350
};
