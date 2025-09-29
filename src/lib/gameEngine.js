import { get } from 'svelte/store';
import { canvas, paddles, ball, gameState, gameActions } from './gameStore.js';
import { GAME_CONFIG } from './gameConfig.js';
import { 
  updateBallPosition, 
  checkPaddleCollision, 
  checkWallCollision, 
  checkScoring,
  calculateReflection,
  updatePaddlePosition
} from './physics.js';
import { createAI } from './ai.js';
import { createInputHandler } from './inputHandler.js';

/**
 * Main game engine that orchestrates all game systems
 */
export function createGameEngine() {
  let animationFrame = null;
  let inputHandler = null;
  let ai = createAI('normal');
  let playerMovement = 0;
  let renderFunction = null;
  let canvasContext = null;
  
  /**
   * Main game loop
   */
  function gameLoop() {
    const currentGameState = get(gameState);
    
    // Skip physics update if paused
    if (!currentGameState.paused && !currentGameState.over) {
      updatePhysics();
    }
    
    // Render the frame
    if (renderFunction) {
      try {
        renderFunction();
      } catch (error) {
        console.error('Render function error:', error);
        // Fall back to direct rendering
        renderDirectly();
      }
    } else if (canvasContext) {
      renderDirectly();
    }
    
    // Continue the loop
    animationFrame = requestAnimationFrame(gameLoop);
  }
  
  /**
   * Update game physics
   */
  function updatePhysics() {
    const currentCanvas = get(canvas);
    const currentPaddles = get(paddles);
    const currentBall = get(ball);
    
    // Update player paddle
    if (playerMovement !== 0) {
      const newLeftPaddle = updatePaddlePosition(
        currentPaddles.left,
        playerMovement,
        GAME_CONFIG.PADDLE_SPEED,
        currentCanvas.height
      );
      
      paddles.update(p => ({ ...p, left: newLeftPaddle }));
    }
    
    // Update AI paddle
    const newRightY = ai.update(currentBall, currentPaddles.right, currentCanvas.width, currentCanvas.height);
    paddles.update(p => ({ 
      ...p, 
      right: { ...p.right, y: newRightY }
    }));
    
    // Update ball position
    let newBall = updateBallPosition(currentBall);
    
    // Check wall collisions
    const wallCollision = checkWallCollision(newBall, currentCanvas.height);
    if (wallCollision) {
      newBall.y = wallCollision.newY;
      newBall.vy = wallCollision.newVY;
    }
    
    // Check paddle collisions
    const updatedPaddles = get(paddles);
    
    // Left paddle collision
    const leftCollision = checkPaddleCollision(
      newBall, 
      updatedPaddles.left, 
      true, 
      currentCanvas.width
    );
    
    if (leftCollision) {
      const reflection = calculateReflection(
        leftCollision.hitPosition,
        leftCollision.isLeftPaddle,
        newBall.vx,
        newBall.vy
      );
      newBall.vx = reflection.vx;
      newBall.vy = reflection.vy;
      newBall.x = leftCollision.newX;
    }
    
    // Right paddle collision
    const rightCollision = checkPaddleCollision(
      newBall, 
      updatedPaddles.right, 
      false, 
      currentCanvas.width
    );
    
    if (rightCollision) {
      const reflection = calculateReflection(
        rightCollision.hitPosition,
        rightCollision.isLeftPaddle,
        newBall.vx,
        newBall.vy
      );
      newBall.vx = reflection.vx;
      newBall.vy = reflection.vy;
      newBall.x = rightCollision.newX;
    }
    
    // Check scoring
    const scoring = checkScoring(newBall, currentCanvas.width);
    if (scoring) {
      gameActions.scorePoint(scoring);
      return; // Don't update ball position, it will be reset
    }
    
    // Update ball state
    ball.set(newBall);
  }
  
  /**
   * Direct rendering fallback when no render function is provided
   */
  function renderDirectly() {
    if (!canvasContext) return;
    
    const currentCanvas = get(canvas);
    const currentPaddles = get(paddles);
    const currentBall = get(ball);
    const currentGameState = get(gameState);
    
    // Clear background
    canvasContext.fillStyle = GAME_CONFIG.COLORS.background;
    canvasContext.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
    
    // Draw net
    canvasContext.save();
    canvasContext.globalAlpha = GAME_CONFIG.NET_OPACITY;
    canvasContext.fillStyle = GAME_CONFIG.COLORS.net;
    for (let y = 0; y < currentCanvas.height; y += GAME_CONFIG.NET_SEGMENT_HEIGHT * 2) {
      canvasContext.fillRect(currentCanvas.width / 2 - 1, y, 2, GAME_CONFIG.NET_SEGMENT_HEIGHT);
    }
    canvasContext.restore();
    
    // Draw paddles
    canvasContext.fillStyle = GAME_CONFIG.COLORS.paddle;
    canvasContext.fillRect(GAME_CONFIG.PADDLE_MARGIN, currentPaddles.left.y, GAME_CONFIG.PADDLE_WIDTH, currentPaddles.left.height);
    canvasContext.fillRect(currentCanvas.width - GAME_CONFIG.PADDLE_MARGIN - GAME_CONFIG.PADDLE_WIDTH, currentPaddles.right.y, GAME_CONFIG.PADDLE_WIDTH, currentPaddles.right.height);
    
    // Draw ball
    canvasContext.fillStyle = GAME_CONFIG.COLORS.ball;
    const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
    canvasContext.fillRect(currentBall.x - ballRadius, currentBall.y - ballRadius, GAME_CONFIG.BALL_SIZE, GAME_CONFIG.BALL_SIZE);
    
    // Draw score
    canvasContext.font = GAME_CONFIG.FONTS.score;
    canvasContext.textAlign = 'center';
    canvasContext.textBaseline = 'top';
    canvasContext.fillStyle = GAME_CONFIG.COLORS.score;
    canvasContext.fillText(`${currentGameState.scoreLeft}`, currentCanvas.width * 0.25, 18);
    canvasContext.fillText(`${currentGameState.scoreRight}`, currentCanvas.width * 0.75, 18);
    
    // Draw pause/game over messages
    if (currentGameState.paused && !currentGameState.over) {
      canvasContext.font = GAME_CONFIG.FONTS.pause;
      canvasContext.fillStyle = GAME_CONFIG.COLORS.pauseText;
      canvasContext.textAlign = 'center';
      canvasContext.textBaseline = 'middle';
      canvasContext.fillText('Paused — Space to continue', currentCanvas.width / 2, currentCanvas.height / 2);
    }
    
    if (currentGameState.over) {
      canvasContext.font = GAME_CONFIG.FONTS.gameOver;
      canvasContext.fillStyle = GAME_CONFIG.COLORS.winText;
      canvasContext.textAlign = 'center';
      canvasContext.textBaseline = 'middle';
      const winner = currentGameState.scoreLeft > currentGameState.scoreRight ? 'You Win!' : 'AI Wins';
      canvasContext.fillText(`${winner} — press R to restart`, currentCanvas.width / 2, currentCanvas.height / 2);
    }
  }
  
  /**
   * Handle input actions
   */
  function handleKeyAction(action, value) {
    switch (action) {
      case 'pause':
        if (value) gameActions.togglePause();
        break;
      case 'restart':
        if (value) gameActions.resetMatch();
        break;
      case 'move':
        playerMovement = value;
        break;
    }
  }
  
  /**
   * Handle touch movement
   */
  function handleTouchMove(y) {
    const currentPaddles = get(paddles);
    const paddleY = y - currentPaddles.left.height / 2;
    gameActions.updatePaddlePosition('left', paddleY);
  }
  
  /**
   * Start the game engine
   */
  function start(canvasElement, canvasRenderFunction) {
    console.log('Starting game engine:', {
      canvasElement: !!canvasElement,
      renderFunction: !!canvasRenderFunction,
      renderFunctionType: typeof canvasRenderFunction
    });
    
    // Store render function and get canvas context as fallback
    renderFunction = canvasRenderFunction;
    if (canvasElement) {
      canvasContext = canvasElement.getContext('2d');
      canvasElement.dataset.gameRunning = 'true';
    }
    
    // Initialize input handling
    inputHandler = createInputHandler(handleKeyAction, handleTouchMove);
    inputHandler.attach(canvasElement);
    
    // Initialize game state
    gameActions.resetMatch();
    
    // Start game loop
    if (!animationFrame) {
      console.log('Starting game loop...');
      gameLoop();
    }
  }
  
  /**
   * Stop the game engine
   */
  function stop(canvasElement) {
    // Stop game loop
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    // Mark canvas as not having an active game loop
    if (canvasElement) {
      canvasElement.dataset.gameRunning = 'false';
    }
    
    // Cleanup input handling
    if (inputHandler) {
      inputHandler.detach(canvasElement);
      inputHandler = null;
    }
  }
  
  /**
   * Change AI difficulty
   */
  function setAIDifficulty(difficulty) {
    ai = createAI(difficulty);
  }
  
  /**
   * Get current AI difficulty
   */
  function getAIDifficulty() {
    return ai.difficulty;
  }
  
  return {
    start,
    stop,
    setAIDifficulty,
    getAIDifficulty,
    // Expose for debugging
    _getCurrentState: () => ({
      canvas: get(canvas),
      paddles: get(paddles),
      ball: get(ball),
      gameState: get(gameState)
    })
  };
}
