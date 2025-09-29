/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  // Canvas dimensions
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 500,
  MIN_WIDTH: 480,
  MIN_HEIGHT: 320,
  ASPECT_RATIO: 0.625, // height/width ratio (16:10)
  MAX_DPR: 2,

  // Paddle settings
  PADDLE_WIDTH: 12,
  PADDLE_HEIGHT_RATIO: 0.18, // height relative to canvas
  PADDLE_SPEED: 7,
  PADDLE_MARGIN: 20,
  MIN_PADDLE_HEIGHT: 60,

  // Ball settings
  BALL_SIZE: 10,
  BALL_SPEED_START: 5.2,
  BALL_SPEED_MAX: 13.0,
  BALL_SPEED_INCREASE: 1.06,
  MIN_BALL_SPEED_Y: 0.9,
  MIN_BALL_SPEED_Y_INITIAL: 1.2,

  // AI settings
  AI_SPEED: 5.5,

  // Game rules
  WIN_SCORE: 11,

  // Physics
  MAX_REFLECTION_ANGLE: Math.PI * 0.35, // ~20 degrees
  ANGLE_VARIATION: 0.6, // random angle variation on ball reset

  // Visual settings
  NET_SEGMENT_HEIGHT: 14,
  NET_OPACITY: 0.6,

  // Colors (using CSS color names for easier theming)
  COLORS: {
    background: '#0c0f13',
    net: '#2e3440',
    paddle: '#e5e9f0',
    ball: '#e5e9f0',
    score: '#e5e9f0',
    pauseText: '#d8dee9',
    winText: '#a3be8c'
  },

  // Font settings
  FONTS: {
    score: 'bold 42px system-ui, -apple-system, Segoe UI, Roboto',
    pause: 'bold 22px system-ui, -apple-system, Segoe UI, Roboto',
    gameOver: 'bold 26px system-ui, -apple-system, Segoe UI, Roboto'
  },

  // Input keys
  KEYS: {
    up: ['arrowup', 'w'],
    down: ['arrowdown', 's'],
    pause: [' ', 'spacebar'],
    restart: ['r']
  }
};

/**
 * Get all valid keys for a specific action
 */
export function getKeysForAction(action) {
  return GAME_CONFIG.KEYS[action] || [];
}

/**
 * Check if a key corresponds to a specific action
 */
export function isKeyForAction(key, action) {
  return getKeysForAction(action).includes(key.toLowerCase());
}
