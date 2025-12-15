# Gorillas Game - TypeScript Port

A modern web port of the classic QBASIC Gorillas game using Vite, Canvas, HTML, and TypeScript.

## Features

- 🦍 Classic Gorillas gameplay with physics-based banana projectiles
- 🌆 Randomly generated city skylines
- 🌞 Animated sun that reacts to hits
- 💨 Wind effects on banana trajectory
- 💥 Explosion effects
- 🎮 Two-player turn-based gameplay
- 📊 Score tracking

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## How to Play

1. Players take turns throwing explosive bananas at each other
2. Enter the **angle** (1-179 degrees) and **velocity** (1-200) for your throw
3. Click **FIRE!** to launch the banana
4. The banana follows a parabolic trajectory affected by wind and gravity
5. Hit your opponent to score a point!
6. First to score wins the round

## Controls

- **Angle Input**: Set the throwing angle (1-179)
  - Lower angles = flatter trajectory
  - Higher angles = higher arc
- **Velocity Input**: Set the throwing power (1-200)
  - Higher velocity = farther throw
- **Fire Button**: Launch the banana
- **New Game Button**: Reset the game with a new city

## Game Mechanics

- **Wind**: Random wind affects banana trajectory
- **Gravity**: Realistic physics simulation
- **Buildings**: Randomly generated skyline provides obstacles
- **Sun**: Gets shocked when hit!
- **Explosions**: Visual feedback for impacts

## Original Game

Based on the classic QBASIC Gorillas game (Version 2.2, enhanced by Daniel Beardsmore)
Original: (c)1990 Microsoft Corp and/or IBM Corp

## Technologies

- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **HTML5 Canvas**: 2D graphics rendering
- **CSS3**: Modern styling

## Project Structure

```
gorillas-port/
├── src/
│   ├── main.ts           # Entry point
│   ├── controller.ts     # Game controller and UI logic
│   ├── game.ts           # Game state and logic
│   ├── renderer.ts       # Canvas rendering
│   ├── constants.ts      # Game constants
│   ├── types.ts          # TypeScript interfaces
│   └── style.css         # Additional styles
├── index.html            # Main HTML file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── gorillas.bas          # Original QBASIC source
```

## License

This is a fan-made port for educational purposes. Original game copyright belongs to Microsoft Corp and/or IBM Corp.
