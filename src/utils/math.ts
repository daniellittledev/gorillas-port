/**
 * Pure mathematical utility functions
 */

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generates a random integer between min (inclusive) and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Calculates Euclidean distance between two points
 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * Checks if a point is within a circle
 */
export const isPointInCircle = (
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean => {
  return distance(px, py, cx, cy) <= radius;
};

/**
 * Checks if a point is within a rectangle
 */
export const isPointInRect = (
  px: number,
  py: number,
  rx: number,
  ry: number,
  width: number,
  height: number
): boolean => {
  return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
};

/**
 * Checks if two rectangles overlap
 */
export const doRectsOverlap = (
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean => {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
};

/**
 * Checks if a circle intersects with a rectangle
 */
export const doesCircleIntersectRect = (
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  width: number,
  height: number
): boolean => {
  const closestX = clamp(cx, rx, rx + width);
  const closestY = clamp(cy, ry, ry + height);
  return distance(cx, cy, closestX, closestY) <= radius;
};
