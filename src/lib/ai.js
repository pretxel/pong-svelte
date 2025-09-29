import { GAME_CONFIG } from './gameConfig.js';

/**
 * AI module for the computer opponent
 * Handles AI decision making and paddle movement
 */

/**
 * Calculate AI paddle movement based on ball position
 * @param {object} ball - Current ball state {x, y, vx, vy}
 * @param {object} paddle - Current AI paddle state {y, height}
 * @param {number} canvasHeight - Canvas height for bounds checking
 * @returns {number} Movement delta for the paddle
 */
export function calculateAIMovement(ball, paddle, canvasHeight) {
  // Calculate target position (center paddle on ball)
  const targetY = ball.y - paddle.height / 2;
  const currentY = paddle.y;
  
  // Calculate distance to target
  const distance = targetY - currentY;
  
  // Only move if distance is significant enough
  if (Math.abs(distance) <= GAME_CONFIG.AI_SPEED) {
    return 0; // Close enough, don't move
  }
  
  // Move toward target at AI speed
  const direction = Math.sign(distance);
  const movement = direction * GAME_CONFIG.AI_SPEED;
  
  // Check bounds to prevent going off screen
  const newY = currentY + movement;
  const maxY = canvasHeight - paddle.height;
  
  if (newY < 0) {
    return -currentY; // Move to top edge
  }
  
  if (newY > maxY) {
    return maxY - currentY; // Move to bottom edge
  }
  
  return movement;
}

/**
 * Advanced AI that considers ball trajectory for prediction
 * @param {object} ball - Current ball state {x, y, vx, vy}
 * @param {object} paddle - Current AI paddle state {y, height}
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} difficulty - AI difficulty (0.5 = easy, 1.0 = normal, 1.5 = hard)
 * @returns {number} Movement delta for the paddle
 */
export function calculatePredictiveAIMovement(ball, paddle, canvasWidth, canvasHeight, difficulty = 1.0) {
  // If ball is moving away from AI, just center the paddle
  if (ball.vx < 0) {
    const centerY = (canvasHeight - paddle.height) / 2;
    const distance = centerY - paddle.y;
    
    if (Math.abs(distance) <= GAME_CONFIG.AI_SPEED) {
      return 0;
    }
    
    return Math.sign(distance) * GAME_CONFIG.AI_SPEED * 0.5; // Slower return to center
  }
  
  // Predict where ball will be when it reaches AI paddle
  const paddleX = canvasWidth - GAME_CONFIG.PADDLE_MARGIN - GAME_CONFIG.PADDLE_WIDTH;
  const timeToReach = (paddleX - ball.x) / ball.vx;
  
  if (timeToReach <= 0) {
    // Ball already passed, use basic AI
    return calculateAIMovement(ball, paddle, canvasHeight);
  }
  
  // Predict ball Y position (accounting for wall bounces)
  let predictedY = ball.y + (ball.vy * timeToReach);
  let predictedVY = ball.vy;
  
  // Simple wall bounce prediction (one bounce maximum for performance)
  const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
  if (predictedY < ballRadius && predictedVY < 0) {
    // Will hit top wall
    const wallHitTime = (ballRadius - ball.y) / ball.vy;
    const wallHitY = ballRadius;
    const remainingTime = timeToReach - wallHitTime;
    predictedY = wallHitY + (-predictedVY * remainingTime);
  } else if (predictedY > canvasHeight - ballRadius && predictedVY > 0) {
    // Will hit bottom wall
    const wallHitTime = (canvasHeight - ballRadius - ball.y) / ball.vy;
    const wallHitY = canvasHeight - ballRadius;
    const remainingTime = timeToReach - wallHitTime;
    predictedY = wallHitY + (-predictedVY * remainingTime);
  }
  
  // Add some imperfection based on difficulty
  const imperfection = (1 - Math.min(difficulty, 1)) * 50; // Up to 50px error for easy AI
  predictedY += (Math.random() - 0.5) * imperfection;
  
  // Calculate target position (center paddle on predicted ball position)
  const targetY = predictedY - paddle.height / 2;
  const distance = targetY - paddle.y;
  
  // Apply difficulty modifier to AI speed
  const aiSpeed = GAME_CONFIG.AI_SPEED * difficulty;
  
  if (Math.abs(distance) <= aiSpeed) {
    return 0;
  }
  
  return Math.sign(distance) * aiSpeed;
}

/**
 * Get AI difficulty settings
 */
export const AI_DIFFICULTIES = {
  easy: {
    name: 'Easy',
    multiplier: 0.6,
    description: 'Slower AI with prediction errors'
  },
  normal: {
    name: 'Normal',
    multiplier: 1.0,
    description: 'Balanced AI opponent'
  },
  hard: {
    name: 'Hard',
    multiplier: 1.3,
    description: 'Fast AI with prediction'
  },
  impossible: {
    name: 'Impossible',
    multiplier: 1.8,
    description: 'Perfect AI - good luck!'
  }
};

/**
 * Create an AI controller with specified difficulty
 * @param {string} difficulty - Difficulty level key
 * @returns {object} AI controller with update method
 */
export function createAI(difficulty = 'normal') {
  const difficultySettings = AI_DIFFICULTIES[difficulty] || AI_DIFFICULTIES.normal;
  
  return {
    difficulty: difficultySettings,
    
    /**
     * Update AI paddle position
     * @param {object} ball - Current ball state
     * @param {object} paddle - Current paddle state
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @returns {number} New paddle Y position
     */
    update(ball, paddle, canvasWidth, canvasHeight) {
      const movement = calculatePredictiveAIMovement(
        ball, 
        paddle, 
        canvasWidth, 
        canvasHeight, 
        difficultySettings.multiplier
      );
      
      return Math.max(0, Math.min(paddle.y + movement, canvasHeight - paddle.height));
    }
  };
}
