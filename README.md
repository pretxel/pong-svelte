# 🏓 Pong Game - Built with Svelte

A classic Pong game implementation using Svelte 5 and HTML5 Canvas, featuring smooth gameplay, AI opponent, and responsive design.

## 🎮 Game Features

- **Classic Pong Gameplay**: Traditional paddle-based ball bouncing action
- **AI Opponent**: Intelligent computer player that tracks the ball
- **Responsive Design**: Adapts to different screen sizes while maintaining aspect ratio
- **Touch Controls**: Mobile-friendly controls for on-the-go gaming
- **Smooth Animation**: 60fps gameplay with requestAnimationFrame
- **Score Tracking**: First to 11 points wins
- **Pause/Resume**: Space bar to pause and resume gameplay
- **Game Reset**: R key to restart the match

## 🎯 How to Play

### Desktop Controls
- **Move Paddle**: Use ↑/↓ arrow keys or W/S keys
- **Pause/Resume**: Press Space bar
- **Restart Game**: Press R key

### Mobile Controls
- **Move Paddle**: Drag on the left side of the screen to control your paddle
- **Pause/Resume**: Tap the screen
- **Restart**: Use the R key on virtual keyboard

### Game Rules
- First player to reach 11 points wins
- Ball speed increases slightly with each paddle hit
- Ball angle changes based on where it hits the paddle
- Missing the ball gives your opponent a point

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pong-svelte
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
pnpm build
# or
npm run build
```

## 🛠️ Technical Implementation

### Technology Stack
- **Svelte 5**: Modern reactive framework with the new component API
- **Vite**: Fast build tool and development server
- **HTML5 Canvas**: For smooth 2D graphics rendering
- **Modern JavaScript**: ES6+ features and modules

### Key Technical Features

#### Canvas Rendering
- High DPI display support with device pixel ratio scaling
- Efficient drawing with optimized render loop
- Smooth animations at 60fps using `requestAnimationFrame`

#### Game Physics
- Realistic ball bouncing with angle variation based on paddle hit position
- Collision detection for paddles and boundaries
- Progressive ball speed increase for increasing difficulty

#### Responsive Design
- Canvas automatically resizes to fit container
- Maintains 16:10 aspect ratio across devices
- Touch-friendly controls for mobile devices

#### State Management
- Clean separation of game state and rendering
- Reactive updates using Svelte's reactivity system
- Proper cleanup of event listeners and animation frames

### Code Structure

```
src/
├── App.svelte          # Main game component with canvas and game logic
├── main.js            # Application entry point (Svelte 5 mount API)
├── app.css           # Global styles
└── assets/           # Static assets
```

### Key Game Variables

```javascript
// Canvas dimensions
const width = 800;
const height = 500;

// Paddle settings
const PADDLE_W = 12;
const PADDLE_H_RATIO = 0.18;
const PADDLE_SPEED = 7;
const AI_SPEED = 5.5;

// Ball settings
const BALL_SIZE = 10;
const BALL_SPEED_START = 5.2;
const BALL_SPEED_MAX = 13.0;

// Game settings
const WIN_SCORE = 11;
```

## 🎨 Customization

### Styling
The game uses a modern dark theme with Nordic-inspired colors:
- Background: Dark blue-gray (`#0c0f13`)
- Paddles/Ball: Light gray (`#e5e9f0`)
- Net: Medium gray (`#2e3440`)
- UI Text: Light blue-gray (`#cbd5e1`)

### Gameplay Tweaks
You can easily modify game parameters in `App.svelte`:
- Adjust paddle speed by changing `PADDLE_SPEED` and `AI_SPEED`
- Modify ball physics with `BALL_SPEED_START` and `BALL_SPEED_MAX`
- Change winning score by updating `WIN_SCORE`
- Customize paddle size with `PADDLE_W` and `PADDLE_H_RATIO`

## 🔧 Development Notes

### Svelte 5 Migration
This project uses Svelte 5's new component instantiation API:
```javascript
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')
});
```

### Performance Considerations
- Uses `requestAnimationFrame` for smooth 60fps gameplay
- Efficient collision detection with minimal computational overhead
- Canvas rendering optimized for consistent frame rates
- Event listeners properly cleaned up to prevent memory leaks

### Browser Compatibility
- Modern browsers with Canvas API support
- Touch events for mobile devices
- Keyboard event handling for desktop controls
- Responsive design for various screen sizes

## 📱 Mobile Experience

The game is fully optimized for mobile devices:
- Touch controls for paddle movement
- Responsive canvas sizing
- Optimized performance for mobile browsers
- Portrait and landscape orientation support

## 🤝 Contributing

Feel free to contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Enjoy playing Pong! 🏓**