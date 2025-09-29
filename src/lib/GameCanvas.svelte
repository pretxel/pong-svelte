<script>
  import { onMount, onDestroy } from 'svelte';
  import { canvas, paddles, ball, gameState, isGameRunning } from './gameStore.js';
  import { GAME_CONFIG } from './gameConfig.js';

  // Props
  export let onCanvasReady = null;

  // Canvas element and context
  let canvasElement;
  let ctx;

  // Re-enable dynamic sizing but use element dimensions
  $: if (ctx && canvasElement) {
    syncCanvasSize();
  }

  /**
   * Update canvas size and pixel ratio
   */
  function updateCanvasSize(canvasData) {
    const { width, height, dpr } = canvasData;
    
    canvasElement.width = Math.floor(width * dpr);
    canvasElement.height = Math.floor(height * dpr);
    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';
    
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Sync canvas store with element dimensions
   */
  function syncCanvasSize() {
    const elementWidth = canvasElement.width;
    const elementHeight = canvasElement.height;
    
    // Update the store to match the canvas element
    canvas.update($canvas => ({
      ...$canvas,
      width: elementWidth,
      height: elementHeight
    }));
  }

  /**
   * Draw the net in the center of the canvas
   */
  function drawNet() {
    ctx.save();
    ctx.globalAlpha = GAME_CONFIG.NET_OPACITY;
    ctx.fillStyle = GAME_CONFIG.COLORS.net;
    
    const segmentHeight = GAME_CONFIG.NET_SEGMENT_HEIGHT;
    for (let y = 0; y < $canvas.height; y += segmentHeight * 2) {
      ctx.fillRect($canvas.width / 2 - 1, y, 2, segmentHeight);
    }
    
    ctx.restore();
  }

  /**
   * Draw both paddles
   */
  function drawPaddles() {
    ctx.fillStyle = GAME_CONFIG.COLORS.paddle;
    
    // Left paddle
    ctx.fillRect(
      GAME_CONFIG.PADDLE_MARGIN,
      $paddles.left.y,
      GAME_CONFIG.PADDLE_WIDTH,
      $paddles.left.height
    );
    
    // Right paddle
    ctx.fillRect(
      $canvas.width - GAME_CONFIG.PADDLE_MARGIN - GAME_CONFIG.PADDLE_WIDTH,
      $paddles.right.y,
      GAME_CONFIG.PADDLE_WIDTH,
      $paddles.right.height
    );
  }

  /**
   * Draw the ball
   */
  function drawBall() {
    ctx.fillStyle = GAME_CONFIG.COLORS.ball;
    const ballRadius = GAME_CONFIG.BALL_SIZE / 2;
    ctx.fillRect(
      $ball.x - ballRadius,
      $ball.y - ballRadius,
      GAME_CONFIG.BALL_SIZE,
      GAME_CONFIG.BALL_SIZE
    );
  }

  /**
   * Draw the score
   */
  function drawScore() {
    ctx.font = GAME_CONFIG.FONTS.score;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = GAME_CONFIG.COLORS.score;
    
    ctx.fillText(`${$gameState.scoreLeft}`, $canvas.width * 0.25, 18);
    ctx.fillText(`${$gameState.scoreRight}`, $canvas.width * 0.75, 18);
  }

  /**
   * Draw pause message
   */
  function drawPauseMessage() {
    if (!$gameState.paused || $gameState.over) return;
    
    ctx.font = GAME_CONFIG.FONTS.pause;
    ctx.fillStyle = GAME_CONFIG.COLORS.pauseText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Paused — Space to continue', $canvas.width / 2, $canvas.height / 2);
  }

  /**
   * Draw game over message
   */
  function drawGameOverMessage() {
    if (!$gameState.over) return;
    
    ctx.font = GAME_CONFIG.FONTS.gameOver;
    ctx.fillStyle = GAME_CONFIG.COLORS.winText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const winner = $gameState.scoreLeft > $gameState.scoreRight ? 'You Win!' : 'AI Wins';
    ctx.fillText(`${winner} — press R to restart`, $canvas.width / 2, $canvas.height / 2);
  }

  /**
   * Main render function
   */
  function render() {
    if (!ctx || !canvasElement) {
      console.log('Render skipped: missing context or element', { ctx: !!ctx, canvasElement: !!canvasElement });
      return;
    }
    
    // Game rendering working properly
    
    // Canvas is working, no test pattern needed
    
    // Clear background
    ctx.fillStyle = GAME_CONFIG.COLORS.background;
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);
    
    // Draw game elements
    drawNet();
    drawPaddles();
    drawBall();
    drawScore();
    drawPauseMessage();
    drawGameOverMessage();
  }

  /**
   * Handle canvas resize
   */
  function handleResize() {
    if (!canvasElement) return;
    
    const rect = canvasElement.parentElement.getBoundingClientRect();
    const width = Math.max(GAME_CONFIG.MIN_WIDTH, Math.floor(rect.width));
    const height = Math.max(GAME_CONFIG.MIN_HEIGHT, Math.floor(rect.height || (rect.width * GAME_CONFIG.ASPECT_RATIO)));
    const dpr = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.MAX_DPR);
    
    canvas.set({ width, height, dpr });
  }

  // Lifecycle
  onMount(() => {
    console.log('GameCanvas mounting...');
    ctx = canvasElement.getContext('2d');
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    console.log('Canvas state:', {
      ctx: !!ctx,
      canvas: $canvas,
      paddles: $paddles,
      ball: $ball,
      gameState: $gameState
    });
    
    // Initial render to show the canvas
    console.log('Calling initial render...');
    render();
    
    // Notify parent that canvas is ready
    if (onCanvasReady) {
      console.log('Notifying parent that canvas is ready');
      try {
        onCanvasReady(canvasElement);
      } catch (error) {
        console.error('Error calling onCanvasReady:', error);
      }
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
  });

  // Export render function for game engine to call
  export function renderFrame() {
    if (ctx && canvasElement) {
      render();
    }
  }
  
  // No reactive rendering - let game engine handle all rendering
</script>

<style>
  canvas {
    display: block;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    background: #0c0f13;
    cursor: pointer;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  }
</style>

<canvas
  bind:this={canvasElement}
  width="800"
  height="500"
></canvas>
