/**
 * Pure validation functions
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates angle input (1-179 degrees)
 */
export const validateAngle = (angle: number): ValidationResult => {
  if (angle < 1 || angle > 179) {
    return {
      valid: false,
      error: "Angle must be between 1 and 179 degrees",
    };
  }
  return { valid: true };
};

/**
 * Validates velocity input (1-200)
 */
export const validateVelocity = (velocity: number): ValidationResult => {
  if (velocity < 1 || velocity > 200) {
    return {
      valid: false,
      error: "Velocity must be between 1 and 200",
    };
  }
  return { valid: true };
};

/**
 * Validates both angle and velocity
 */
export const validateThrowInputs = (
  angle: number,
  velocity: number
): ValidationResult => {
  const angleResult = validateAngle(angle);
  if (!angleResult.valid) return angleResult;

  const velocityResult = validateVelocity(velocity);
  if (!velocityResult.valid) return velocityResult;

  return { valid: true };
};
