/**
 * Pure functions for building generation
 */

import type { Building } from "../types";
import { randomInt } from "../utils/math";
import { GAME_WIDTH, BUILDING } from "../constants";

export enum SlopeType {
  Upward = 1,
  Downward = 2,
  VShapeV3 = 3,
  VShapeV4 = 4,
  VShapeV5 = 5,
  InvertedV = 6,
}

/**
 * Determines a random slope pattern for the cityscape
 */
export const generateSlopeType = (): SlopeType => {
  return randomInt(1, 6) as SlopeType;
};

/**
 * Calculates initial height based on slope type
 */
export const getInitialHeight = (slope: SlopeType): number => {
  switch (slope) {
    case SlopeType.Upward:
    case SlopeType.VShapeV3:
    case SlopeType.VShapeV4:
    case SlopeType.VShapeV5:
      return 15;
    case SlopeType.Downward:
    case SlopeType.InvertedV:
      return 130;
    default:
      return 15;
  }
};

/**
 * Calculates next height based on current height, slope type, and position
 */
export const calculateNextHeight = (
  currentHeight: number,
  slope: SlopeType,
  currentX: number,
  heightIncrement: number = 10
): number => {
  const midPoint = GAME_WIDTH / 2;

  switch (slope) {
    case SlopeType.Upward:
      return currentHeight + heightIncrement;
    case SlopeType.Downward:
      return currentHeight - heightIncrement;
    case SlopeType.VShapeV3:
    case SlopeType.VShapeV4:
    case SlopeType.VShapeV5:
      return currentX > midPoint
        ? currentHeight - 2 * heightIncrement
        : currentHeight + 2 * heightIncrement;
    case SlopeType.InvertedV:
      return currentX > midPoint
        ? currentHeight + 2 * heightIncrement
        : currentHeight - 2 * heightIncrement;
    default:
      return currentHeight;
  }
};

/**
 * Generates random building width
 */
export const generateBuildingWidth = (
  currentX: number,
  defaultWidth: number = 37
): number => {
  const width = randomInt(defaultWidth, defaultWidth * 2);
  const remainingSpace = GAME_WIDTH - currentX - 2;
  return Math.min(width, remainingSpace);
};

/**
 * Generates random building height with constraints
 */
export const generateBuildingHeight = (
  baseHeight: number,
  randomHeightRange: number = 120,
  minHeight: number = 10,
  maxAllowedHeight: number = 60,
  gorillaHeight: number = 28
): number => {
  let height = randomInt(0, randomHeightRange) + baseHeight;

  // Ensure minimum height
  if (height < minHeight) {
    height = minHeight;
  }

  // Ensure building isn't too tall (leaving room for gorilla)
  const bottomLine = BUILDING.bottomLine;
  if (bottomLine - height <= maxAllowedHeight + gorillaHeight) {
    height = maxAllowedHeight + gorillaHeight - 5;
  }

  return height;
};

/**
 * Selects a random building color
 */
export const generateBuildingColor = (): string => {
  const colors = ["#AA0000", "#AA00AA", "#AA5500", "#AAAAAA"];
  return colors[randomInt(0, colors.length - 1)];
};

/**
 * Generates window positions for a building
 */
export const generateWindows = (
  buildingX: number,
  buildingWidth: number,
  buildingHeight: number,
  bottomLine: number = 335,
  horizontalSpacing: number = 10,
  verticalSpacing: number = 15,
  margin: number = 3
): Array<{ x: number; y: number; lit: boolean }> => {
  const windows: Array<{ x: number; y: number; lit: boolean }> = [];

  let x = buildingX + margin;
  while (x < buildingX + buildingWidth - margin) {
    for (let i = buildingHeight - margin; i >= 7; i -= verticalSpacing) {
      const lit = Math.random() > 0.25; // 75% chance of being lit
      windows.push({
        x,
        y: bottomLine - i,
        lit,
      });
    }
    x += horizontalSpacing;
  }

  return windows;
};

/**
 * Creates a single building with all its properties
 */
export const createBuilding = (
  x: number,
  height: number,
  width: number,
  color: string,
  bottomLine: number = 335
): Building => {
  const windows = generateWindows(x, width, height, bottomLine);

  return {
    x,
    y: bottomLine - height,
    width,
    height,
    color,
    windows,
    explosions: [],
  };
};

/**
 * Generates all buildings for the game
 */
export const generateBuildings = (): Building[] => {
  const buildings: Building[] = [];
  const slope = generateSlopeType();
  let currentHeight = getInitialHeight(slope);
  let currentX = 2;

  const heightIncrement = 10;
  const defaultWidth = 37;
  const randomHeightRange = 120;
  const bottomLine = 335;
  const maxHeight = 60;
  const gorillaHeight = 28;

  while (currentX < GAME_WIDTH) {
    // Update height based on slope
    currentHeight = calculateNextHeight(
      currentHeight,
      slope,
      currentX,
      heightIncrement
    );

    // Generate building dimensions
    const width = generateBuildingWidth(currentX, defaultWidth);
    const height = generateBuildingHeight(
      currentHeight,
      randomHeightRange,
      heightIncrement,
      maxHeight,
      gorillaHeight
    );
    const color = generateBuildingColor();

    // Create and add building
    const building = createBuilding(currentX, height, width, color, bottomLine);
    buildings.push(building);

    currentX += width + 2;
  }

  return buildings;
};

/**
 * Finds a suitable building index for gorilla placement
 */
export const selectGorillaBuilding = (
  totalBuildings: number,
  isLeftGorilla: boolean
): number => {
  if (isLeftGorilla) {
    // Player 1: 2nd or 3rd building from left (index 1 or 2)
    return Math.min(randomInt(1, 2), totalBuildings - 1);
  } else {
    // Player 2: 2nd or 3rd building from right
    return Math.max(0, totalBuildings - 1 - randomInt(1, 2));
  }
};
