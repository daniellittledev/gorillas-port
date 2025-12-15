# Graphics Accuracy Update

## Changes Made to Match Original QBASIC Gorillas

### Gorilla Rendering

- **Original**: Uses precise LINE and CIRCLE commands with Scl() scaling
- **Updated**: Replicated exact drawing commands from original BASIC code
  - Head: Two filled rectangles matching original dimensions
  - Eyes/brow: Line across the face
  - Nose: Two pairs of pixels (EGA mode)
  - Neck: Single line
  - Body: Two rectangles for torso
  - Legs: Multiple arc segments for curved appearance
  - Chest: Two arc decorations
  - Arms: Multiple arc segments, position changes based on throw

### Sun Rendering

- **Original**: Central circle with 8 rays in different angles, smile/shocked face
- **Updated**: Exact replication with all 8 rays:
  - Horizontal and vertical rays (longest)
  - 45-degree diagonal rays
  - Additional angled rays at various positions
  - Proper face with arc smile or O-mouth when shocked
  - Small circular eyes

### Building Generation

- **Original**: Complex slope algorithm with 6 patterns (upward, downward, V, inverted-V)
- **Updated**: Exact algorithm implementation:
  - DefBWidth = 37 pixels
  - Height increment = 10
  - Random height variance = 120
  - Bottom line at y=335
  - Proper building spacing with 2-pixel gaps
  - Random building colors (matching EGA palette)

### Window Placement

- **Original**: Column-based placement starting at x+3
- **Updated**: Exact window algorithm:
  - Window width: 3 pixels
  - Window height: 6 pixels
  - Horizontal spacing: 10 pixels
  - Vertical spacing: 15 pixels
  - Random lit/dark windows (25% dark)

### Explosion Effects

- **Original**: Multi-layered colored circles with specific radii ratios
- **Updated**: 4-layer explosion:
  - Layer 1: Red at full radius
  - Layer 2: Green at 90% radius
  - Layer 3: Cyan at 60% radius
  - Layer 4: Light blue at 45% radius
  - Grey smoke outer circle
  - Elliptical shapes for depth

### Collision Detection

- **Updated**: Accurate bounding boxes
  - Gorilla: x±15, y-1 to y+28
  - Sun: 12-pixel radius at proper position
  - Buildings: exact dimensions

## Result

The game now renders identically to the original QBASIC version with pixel-perfect accuracy!
