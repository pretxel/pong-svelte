import { writable, derived } from 'svelte/store';
import { GAME_CONFIG } from './gameConfig.js';

/**
 * Game state store - centralized state management for the Pong game
 */

// Canvas and display properties
export const canvas = writable({
  width: GAME_CONFIG.DEFAULT_WIDTH,
  height: GAME_CONFIG.DEFAULT_HEIGHT,
  dpr: 1
});

// Calculate initial paddle values
const initialPaddleHeight = Math.max(
  GAME_CONFIG.MIN_PADDLE_HEIGHT, 
  GAME_CONFIG.DEFAULT_HEIGHT * GAME_CONFIG.PADDLE_HEIGHT_RATIO
);
const initialPaddleY = (GAME_CONFIG.DEFAULT_HEIGHT - initialPaddleHeight) / 2;

// Paddle positions and properties
export const paddles = writable({
  left: {
    y: initialPaddleY,
    height: initialPaddleHeight
  },
  right: {
    y: initialPaddleY,
    height: initialPaddleHeight
  }
});

// Ball state (center of canvas)
export const ball = writable({
  x: GAME_CONFIG.DEFAULT_WIDTH / 2,
  y: GAME_CONFIG.DEFAULT_HEIGHT / 2,
  vx: GAME_CONFIG.BALL_SPEED_START,
  vy: GAME_CONFIG.BALL_SPEED_START * 0.5
});

// Game state
export const gameState = writable({
  paused: false,
  over: false,
  scoreLeft: 0,
  scoreRight: 0
});

// Input state
export const inputState = writable({
  keys: new Set(),
  touchActive: false
});

// Derived stores for convenience
export const isGameRunning = derived(
  gameState,
  ($gameState) => !$gameState.paused && !$gameState.over
);

export const winner = derived(
  gameState,
  ($gameState) => {
    if (!$gameState.over) return null;
    return $gameState.scoreLeft > $gameState.scoreRight ? 'player' : 'ai';
  }
);

export const canvasAspectRatio = derived(
  canvas,
  ($canvas) => $canvas.height / $canvas.width
);

/**
 * Game state actions
 */
export const gameActions = {
  // Reset ball position and velocity
  resetBall(toLeft = Math.random() < 0.5) {
    canvas.update($canvas => {
      const angle = (Math.random() * GAME_CONFIG.ANGLE_VARIATION - GAME_CONFIG.ANGLE_VARIATION/2) + 
                   (toLeft ? Math.PI : 0);
      const speed = GAME_CONFIG.BALL_SPEED_START;
      
      ball.set({
        x: $canvas.width / 2,
        y: $canvas.height / 2,
        vx: Math.cos(angle) * speed * (toLeft ? -1 : 1),
        vy: Math.sin(angle) * speed
      });

      // Avoid extreme verticality
      ball.update($ball => {
        if (Math.abs($ball.vy) < GAME_CONFIG.MIN_BALL_SPEED_Y_INITIAL) {
          $ball.vy = Math.sign($ball.vy || 1) * GAME_CONFIG.MIN_BALL_SPEED_Y_INITIAL;
        }
        return $ball;
      });

      return $canvas;
    });
  },

  // Reset paddle positions
  resetPositions() {
    canvas.update($canvas => {
      const paddleHeight = Math.max(
        GAME_CONFIG.MIN_PADDLE_HEIGHT, 
        $canvas.height * GAME_CONFIG.PADDLE_HEIGHT_RATIO
      );
      const centerY = ($canvas.height - paddleHeight) / 2;

      paddles.set({
        left: { y: centerY, height: paddleHeight },
        right: { y: centerY, height: paddleHeight }
      });

      return $canvas;
    });
  },

  // Reset entire match
  resetMatch() {
    gameState.update($state => ({
      ...$state,
      paused: false,
      over: false,
      scoreLeft: 0,
      scoreRight: 0
    }));
    
    this.resetPositions();
    this.resetBall(Math.random() < 0.5);
  },

  // Toggle pause state
  togglePause() {
    gameState.update($state => {
      if ($state.over) return $state;
      return { ...$state, paused: !$state.paused };
    });
  },

  // Score a point
  scorePoint(side) {
    gameState.update($state => {
      const newState = { ...$state };
      if (side === 'left') {
        newState.scoreLeft += 1;
      } else {
        newState.scoreRight += 1;
      }

      // Check for game over
      if (newState.scoreLeft >= GAME_CONFIG.WIN_SCORE || 
          newState.scoreRight >= GAME_CONFIG.WIN_SCORE) {
        newState.over = true;
        newState.paused = true;
      }

      return newState;
    });

    // Reset for next round
    this.resetPositions();
    this.resetBall(side === 'right'); // Ball goes to opposite side
  },

  // Update canvas dimensions
  updateCanvas(width, height, dpr = 1) {
    canvas.set({ width, height, dpr });
    this.resetPositions();
  },

  // Update paddle position
  updatePaddlePosition(side, y) {
    paddles.update($paddles => {
      canvas.update($canvas => {
        const maxY = $canvas.height - $paddles[side].height;
        $paddles[side].y = Math.max(0, Math.min(maxY, y));
        return $canvas;
      });
      return $paddles;
    });
  },

  // Update ball position
  updateBallPosition(x, y, vx, vy) {
    ball.set({ x, y, vx, vy });
  }
};
