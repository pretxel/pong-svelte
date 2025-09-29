import { GAME_CONFIG } from './gameConfig.js';

/**
 * Physics engine for Pong game
 * Handles ball movement, collisions, and physics calculations
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate ball reflection when hitting a paddle
 * @param {number} hitPosition - Position where ball hit paddle (0-1, where 0.5 is center)
 * @param {boolean} isLeftPaddle - Whether the ball hit the left paddle
 * @param {number} currentVX - Current ball X velocity
 * @param {number} currentVY - Current ball Y velocity
 * @returns {object} New velocity vector {vx, vy}
 */
export function calculateReflection(hitPosition, isLeftPaddle, currentVX, currentVY) {
  // Convert hit position to offset from center (-1 to 1)
  const offCenter = (hitPosition - 0.5) * 2;
  
  // Calculate reflection angle based on hit position
  const angle = offCenter * GAME_CONFIG.MAX_REFLECTION_ANGLE;
  
  // Increase ball speed slightly, but cap at maximum
  const currentSpeed = Math.hypot(currentVX, currentVY);
  const newSpeed = Math.min(currentSpeed * GAME_CONFIG.BALL_SPEED_INCREASE, GAME_CONFIG.BALL_SPEED_MAX);
  
  // Calculate new velocity
  const direction = isLeftPaddle ? 1 : -1;
  let vx = Math.cos(angle) * newSpeed * direction;
  let vy = Math.sin(angle) * newSpeed;
  
  // Prevent completely horizontal trajectory
  if (Math.abs(vy) < GAME_CONFIG.MIN_BALL_SPEED_Y) {
    vy = Math.sign(vy || 1) * GAME_CONFIG.MIN_BALL_SPEED_Y;
  }
  
  return { vx, vy };
}

/**
 * Check collision between ball and paddle
 * @param {object} ball - Ball state {x, y, vx, vy}
 * @param {object} paddle - Paddle state {y, height}
 * @param {boolean} isLeftPaddle - Whether this is the left paddle
 * @param {number} canvasWidth - Canvas width for positioning calculations
 * @returns {object|null} Collision result or null if no collision
 */
export function checkPaddleCollision(ball, paddle, isLeftPaddle, canvasWidth) {
  const paddleX = isLeftPaddle ? 
    GAME_CONFIG.PADDLE_MARGIN : 
    canvasWidth - GAME_CONFIG.PADDLE_MARGIN - GAME_CONFIG.PADDLE_WIDTH;
  
  const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
  
  // Check if ball is in paddle X range
  const ballInXRange = isLeftPaddle ?
    (ball.x - ballRadius <= paddleX + GAME_CONFIG.PADDLE_WIDTH && ball.x > paddleX) :
    (ball.x + ballRadius >= paddleX && ball.x < paddleX + GAME_CONFIG.PADDLE_WIDTH);
  
  // Check if ball is in paddle Y range
  const ballInYRange = ball.y >= paddle.y && ball.y <= paddle.y + paddle.height;
  
  // Check if ball is moving toward paddle
  const movingTowardPaddle = isLeftPaddle ? ball.vx < 0 : ball.vx > 0;
  
  if (ballInXRange && ballInYRange && movingTowardPaddle) {
    // Calculate hit position (0 = top, 1 = bottom)
    const hitPosition = (ball.y - paddle.y) / paddle.height;
    
    // Calculate new ball position to prevent sticking
    const newX = isLeftPaddle ?
      paddleX + GAME_CONFIG.PADDLE_WIDTH + ballRadius + 0.5 :
      paddleX - ballRadius - 0.5;
    
    return {
      hitPosition,
      newX,
      isLeftPaddle
    };
  }
  
  return null;
}

/**
 * Check collision with top/bottom walls
 * @param {object} ball - Ball state {x, y, vx, vy}
 * @param {number} canvasHeight - Canvas height
 * @returns {object|null} Collision result or null if no collision
 */
export function checkWallCollision(ball, canvasHeight) {
  const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
  
  // Top wall collision
  if (ball.y - ballRadius <= 0 && ball.vy < 0) {
    return {
      newY: ballRadius,
      newVY: -ball.vy
    };
  }
  
  // Bottom wall collision
  if (ball.y + ballRadius >= canvasHeight && ball.vy > 0) {
    return {
      newY: canvasHeight - ballRadius,
      newVY: -ball.vy
    };
  }
  
  return null;
}

/**
 * Check if ball has gone off screen (scoring)
 * @param {object} ball - Ball state {x, y, vx, vy}
 * @param {number} canvasWidth - Canvas width
 * @returns {string|null} 'left' or 'right' if ball went off that side, null otherwise
 */
export function checkScoring(ball, canvasWidth) {
  const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
  
  if (ball.x < -ballRadius) {
    return 'right'; // Right player scored
  }
  
  if (ball.x > canvasWidth + ballRadius) {
    return 'left'; // Left player scored
  }
  
  return null;
}

/**
 * Update ball position based on current velocity
 * @param {object} ball - Current ball state
 * @returns {object} New ball position
 */
export function updateBallPosition(ball) {
  return {
    x: ball.x + ball.vx,
    y: ball.y + ball.vy,
    vx: ball.vx,
    vy: ball.vy
  };
}

/**
 * Update paddle position with movement input
 * @param {object} paddle - Current paddle state
 * @param {number} movement - Movement delta (-1 for up, 1 for down, 0 for no movement)
 * @param {number} speed - Movement speed
 * @param {number} canvasHeight - Canvas height for bounds checking
 * @returns {object} New paddle state
 */
export function updatePaddlePosition(paddle, movement, speed, canvasHeight) {
  const newY = paddle.y + (movement * speed);
  
  return {
    ...paddle,
    y: clamp(newY, 0, canvasHeight - paddle.height)
  };
}
