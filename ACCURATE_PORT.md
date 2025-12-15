# Gorillas Game - Accurate Port Documentation

## Major Changes to Match Original QBASIC Behavior

### 1. Physics Accuracy

**Original Formula:**

- `x# = StartXPos + (InitXVel# * t#) + (.5 * (Wind / 5) * t# ^ 2)`
- `y# = StartYPos + ((-1 * (InitYVel# * t#)) + (.5 * Gravity * t# ^ 2)) * (ScrHeight / 350)`

**Changes:**

- Time step changed from 0.016 to 0.1 (matching original `t# += .1`)
- Wind divided by 5 in physics formula (not applied directly to velocity)
- Gravity scaled by screen height ratio (350)
- Position calculated from initial values each frame, not accumulated

### 2. Projectile Starting Position

**Original:**

- `StartXPos = StartX` (or `+ Scl(25)` for player 2)
- `StartYPos = StartY - adjust - 3` where `adjust = Scl(4)`

**Changes:**

- Banana starts offset from gorilla position
- Player 2 starts 25 pixels to the right
- Y position offset by 7 pixels down from gorilla

### 3. Wind Generation

**Original:**

- `Wind = FNRan(10) - 5` (range: -4 to 5)
- 1 in 3 chance to add ±(1-10) more wind

**Changes:**

- Exact replication of original wind algorithm
- Can produce stronger winds occasionally

### 4. Gorilla Placement

**Original:**

- `IF i = 1 THEN BNum = FNRan(2) + 1`
- `ELSE BNum = LastBuilding - FNRan(2)`

**Changes:**

- Player 1 on 2nd or 3rd building from left
- Player 2 on 2nd or 3rd building from right
- XAdj = 14 pixels for proper centering

### 5. Collision Detection

**Original:**

- Uses offset checking: `LookX = Scl(8 * (2 - PlayerNum))`
- Direction-based scanning: `Direction = Scl(4)` or `Scl(-4)`
- Checks multiple points with LookY offsets

**Changes:**

- Offset collision detection prevents immediate self-collision
- Checks 2 points per frame with proper offsets
- Only checks opponent gorilla, never self

### 6. Special Cases

**Velocity < 2:**

- Original causes immediate self-hit
- Now properly implemented

**Banana Rotation:**

- `rot = (t# * 10) MOD 4`
- 4 rotation states (0-3) based on time

### 7. Game Loop Timing

**Original:**

- `Rest .02` between updates (20ms delay)

**Changes:**

- Animation loop throttled to ~50fps
- Matches original timing for consistent gameplay

### 8. Bounds Checking

**Original:**

- `y# > 0 AND (x# > 3 AND x# < (ScrWidth - Scl(10)))`
- `y# >= ScrHeight - 7` for bottom

**Changes:**

- Exact boundary conditions replicated
- 3-pixel left margin, 10-pixel right margin
- 7-pixel bottom margin

## Result

The TypeScript port now plays identically to the original QBASIC Gorillas with the same physics, collision detection, and game rules!
