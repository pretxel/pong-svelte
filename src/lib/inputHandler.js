import { isKeyForAction } from './gameConfig.js';

/**
 * Input handling module for keyboard and touch controls
 * Provides centralized input management for the game
 */

/**
 * Create an input handler that manages keyboard and touch input
 * @param {function} onKeyAction - Callback for key actions (action, pressed)
 * @param {function} onTouchMove - Callback for touch movement (y)
 * @returns {object} Input handler with attach/detach methods
 */
export function createInputHandler(onKeyAction, onTouchMove) {
  const activeKeys = new Set();
  let touchActive = false;

  /**
   * Handle key down events
   */
  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Prevent default for game keys
    if (isKeyForAction(key, 'pause') || isKeyForAction(key, 'restart')) {
      event.preventDefault();
    }
    
    // Handle action keys (pause, restart)
    if (isKeyForAction(key, 'pause')) {
      onKeyAction?.('pause', true);
      return;
    }
    
    if (isKeyForAction(key, 'restart')) {
      onKeyAction?.('restart', true);
      return;
    }
    
    // Handle movement keys
    if (isKeyForAction(key, 'up') || isKeyForAction(key, 'down')) {
      if (!activeKeys.has(key)) {
        activeKeys.add(key);
        updateMovementState();
      }
    }
  }

  /**
   * Handle key up events
   */
  function handleKeyUp(event) {
    const key = event.key.toLowerCase();
    
    if (activeKeys.has(key)) {
      activeKeys.delete(key);
      updateMovementState();
    }
  }

  /**
   * Update movement state based on active keys
   */
  function updateMovementState() {
    let movement = 0;
    
    // Check for up movement
    const upPressed = Array.from(activeKeys).some(key => isKeyForAction(key, 'up'));
    if (upPressed) movement -= 1;
    
    // Check for down movement
    const downPressed = Array.from(activeKeys).some(key => isKeyForAction(key, 'down'));
    if (downPressed) movement += 1;
    
    onKeyAction?.('move', movement);
  }

  /**
   * Handle pointer down events (touch/mouse)
   */
  function handlePointerDown(event) {
    const x = event.offsetX;
    const canvasWidth = event.target.offsetWidth;
    
    // Only activate touch on left half of screen
    if (x <= canvasWidth * 0.5) {
      touchActive = true;
      
      // Also trigger pause on touch if game supports it
      if (event.type === 'touchstart' && event.touches?.length === 1) {
        onKeyAction?.('pause', true);
      }
    }
  }

  /**
   * Handle pointer move events
   */
  function handlePointerMove(event) {
    if (!touchActive) return;
    
    const y = event.offsetY;
    onTouchMove?.(y);
  }

  /**
   * Handle pointer up/leave events
   */
  function handlePointerUp() {
    touchActive = false;
  }

  /**
   * Attach event listeners to the window and canvas
   */
  function attach(canvas) {
    // Keyboard events on window
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    
    // Pointer events on canvas
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
    }
  }

  /**
   * Detach all event listeners
   */
  function detach(canvas) {
    // Remove keyboard events
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    
    // Remove pointer events
    if (canvas) {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    }
    
    // Clear state
    activeKeys.clear();
    touchActive = false;
  }

  /**
   * Get current input state
   */
  function getState() {
    return {
      activeKeys: new Set(activeKeys),
      touchActive,
      isMovingUp: Array.from(activeKeys).some(key => isKeyForAction(key, 'up')),
      isMovingDown: Array.from(activeKeys).some(key => isKeyForAction(key, 'down'))
    };
  }

  return {
    attach,
    detach,
    getState,
    // Expose for testing
    _handleKeyDown: handleKeyDown,
    _handleKeyUp: handleKeyUp,
    _handlePointerDown: handlePointerDown,
    _handlePointerMove: handlePointerMove,
    _handlePointerUp: handlePointerUp
  };
}

/**
 * Simple movement calculator that can be used independently
 * @param {Set} activeKeys - Set of currently pressed keys
 * @returns {number} Movement value (-1 for up, 0 for none, 1 for down)
 */
export function calculateMovement(activeKeys) {
  let movement = 0;
  
  const upPressed = Array.from(activeKeys).some(key => isKeyForAction(key, 'up'));
  if (upPressed) movement -= 1;
  
  const downPressed = Array.from(activeKeys).some(key => isKeyForAction(key, 'down'));
  if (downPressed) movement += 1;
  
  return movement;
}
