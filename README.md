Hello, this is my idea for a free game where you select specific modules to progress through levels at the lowest possible cost. Vibecoding only with Copilot and Claude. The game is in JS, and what you'll see is just the beginning, coming soon in 2D and 3D. The project isn't the simple platformer or puzzle game it looks like now; it's just the beginning 😃

# Readme is outdated / readme jest przeterminowane :)
# Copilot - Game with Pricing System

Interactive game with real-time dynamic pricing system.

## Features

### Controls
- **Keyboard arrows**: ← → ↑ ↓ (or WASD)
- **Mouse**: Click to move the dot to target position

### Control Panel (Left)
- Game development time timer (counts from 2026-01-16 15:00)
- Checkboxes to enable/disable features on the fly:
  - Keyboard Control
  - Mouse Control
  - HD Graphics (grid, light effects)
  - Color Mode (B&W when disabled)
  - Smooth Animations (60 FPS)
  - Sound System
  - Particle Effects (trail behind dot)
- RESTART button to reset position

### Game (Center)
- Black board with grid (when HD Graphics enabled)
- Green dot with glow effect (gray in B&W mode)
- Particle effects during movement
- Display of position and available controls

### Pricing Panel (Right)
- List of all modules with prices
- Active/inactive status (✓/✗)
- Memory usage of each module
- **Summary:**
  - Code modules cost
  - Memory used (KB)
  - Work time (150 PLN/h)
  - Total sum

## Modules and Prices

| Module | Price | Memory | Required |
|--------|-------|--------|----------|
| Keyboard Control | 500 PLN | 2 KB | No |
| Mouse Control | 400 PLN | 1.5 KB | No |
| HD Graphics | 1500 PLN | 8 KB | No |
| Color Mode | 900 PLN | 3 KB | No |
| Smooth Animations | 800 PLN | 3 KB | No |
| Sound System | 600 PLN | 2.5 KB | No |
| Particle Effects | 1200 PLN | 4 KB | No |
| Game Engine (core) | 2000 PLN | 10 KB | **YES** |
| Rendering System | 1000 PLN | 5 KB | **YES** |
| Physics Engine | 700 PLN | 3.5 KB | **YES** |

## How to Run

1. Open `index.html` in a browser
2. Game starts automatically
3. Timer starts counting from 2026-01-16 15:00
4. Toggle features on/off to see price changes in real-time

## Technology

- **HTML5 Canvas** - graphics rendering
- **JavaScript (ES6+)** - game logic
- **CSS3 Grid** - interface layout
- No external dependencies
- Runs without a server (browser only)

## File Structure

```
Copilot/
├── index.html      # Main HTML file with interface
├── index.js        # Game logic and pricing system
└── README.md       # This file
```

## Authors

Copilot Project - Game Pricing System

## License

MIT License
