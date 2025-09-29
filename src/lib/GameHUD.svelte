<script>
  import { gameState } from './gameStore.js';
  
  // Props for customization
  export let showMobileInstructions = true;
  export let customControls = null;
</script>

<style>
  .hud {
    margin-top: 12px;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: #cbd5e1;
    text-align: center;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .control-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .kbd {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 2px 8px;
    font-weight: 600;
    font-size: 0.9em;
  }
  
  .separator {
    color: #6b7280;
    margin: 0 4px;
  }
  
  .mobile-hint {
    opacity: 0.8;
    margin-top: 6px;
    font-size: 0.9em;
  }
  
  .score-display {
    margin-bottom: 8px;
    font-size: 1.1em;
    font-weight: 600;
  }
  
  .game-status {
    margin-top: 8px;
    font-style: italic;
    opacity: 0.9;
  }
  
  .status-paused {
    color: #fbbf24;
  }
  
  .status-over {
    color: #ef4444;
  }
  
  @media (max-width: 640px) {
    .controls {
      font-size: 0.9em;
    }
    
    .kbd {
      padding: 1px 6px;
      font-size: 0.8em;
    }
  }
</style>

<div class="hud">
  <!-- Score Display -->
  <div class="score-display">
    Player {$gameState.scoreLeft} - {$gameState.scoreRight} AI
  </div>
  
  <!-- Custom controls or default controls -->
  {#if customControls}
    {@html customControls}
  {:else}
    <div class="controls">
      <div class="control-group">
        <span>Move:</span>
        <span class="kbd">↑</span>
        <span>/</span>
        <span class="kbd">↓</span>
        <span>or</span>
        <span class="kbd">W</span>
        <span>/</span>
        <span class="kbd">S</span>
      </div>
      
      <span class="separator">•</span>
      
      <div class="control-group">
        <span>Pause:</span>
        <span class="kbd">Space</span>
      </div>
      
      <span class="separator">•</span>
      
      <div class="control-group">
        <span>Restart:</span>
        <span class="kbd">R</span>
      </div>
    </div>
  {/if}
  
  <!-- Mobile instructions -->
  {#if showMobileInstructions}
    <div class="mobile-hint">
      On mobile, drag the left side to move your paddle.
    </div>
  {/if}
  
  <!-- Game status -->
  {#if $gameState.paused && !$gameState.over}
    <div class="game-status status-paused">
      Game Paused
    </div>
  {:else if $gameState.over}
    <div class="game-status status-over">
      Game Over - {$gameState.scoreLeft > $gameState.scoreRight ? 'You Win!' : 'AI Wins!'}
    </div>
  {/if}
</div>
