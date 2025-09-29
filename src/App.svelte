<script>
  import { onMount, onDestroy } from 'svelte';
  import GameCanvas from './lib/GameCanvas.svelte';
  import GameHUD from './lib/GameHUD.svelte';
  import { createGameEngine } from './lib/gameEngine.js';
  import { gameState } from './lib/gameStore.js';
  import { AI_DIFFICULTIES } from './lib/ai.js';

  // Game engine instance
  let gameEngine;
  let canvasElement;
  let canvasComponent;
  let selectedDifficulty = 'normal';

  /**
   * Handle canvas ready event
   */
  function handleCanvasReady(canvas) {
    canvasElement = canvas;
    
    // Initialize game engine
    gameEngine = createGameEngine();
    
    // Wait a tick to ensure component binding is complete
    setTimeout(() => {
      const renderFunction = canvasComponent?.renderFrame;
      if (renderFunction) {
        console.log('Starting game engine with render function');
        gameEngine.start(canvasElement, renderFunction);
      } else {
        console.error('Canvas render function still not available, starting without it');
        gameEngine.start(canvasElement, null);
      }
    }, 0);
  }

  /**
   * Handle difficulty change
   */
  function handleDifficultyChange(event) {
    selectedDifficulty = event.target.value;
    if (gameEngine) {
      gameEngine.setAIDifficulty(selectedDifficulty);
    }
  }

  // Cleanup on component destruction
  onDestroy(() => {
    if (gameEngine && canvasElement) {
      gameEngine.stop(canvasElement);
    }
  });
</script>

<style>
  :global(body) {
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    min-height: 100vh;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }

  .game-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .game-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .game-title {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0 0 10px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .game-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin: 0;
  }

  .game-wrapper {
    width: 100%;
    height: 70vh;
    min-height: 360px;
    max-height: 75vh;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    padding: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .difficulty-selector {
    margin-top: 20px;
    text-align: center;
  }

  .difficulty-label {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    margin-right: 10px;
  }

  .difficulty-select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    padding: 8px 12px;
    font-size: 0.9rem;
    cursor: pointer;
    backdrop-filter: blur(5px);
  }

  .difficulty-select:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  .difficulty-select option {
    background: #1e3a8a;
    color: white;
  }

  .game-info {
    margin-top: 30px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    line-height: 1.5;
  }


  @media (max-width: 768px) {
    .game-container {
      padding: 10px;
    }

    .game-title {
      font-size: 2rem;
    }

    .game-wrapper {
      height: 60vh;
      min-height: 300px;
      padding: 15px;
    }

  }
</style>

<div class="game-container">
  <!-- Game Header -->
  <header class="game-header">
    <h1 class="game-title">🏓 Pong</h1>
    <p class="game-subtitle">Classic arcade game built with Svelte</p>
  </header>

  <!-- Main Game Area -->
  <main class="game-wrapper">
    <GameCanvas bind:this={canvasComponent} onCanvasReady={handleCanvasReady} />
  </main>

  <!-- Game Controls HUD -->
  <GameHUD />

  <!-- Difficulty Selector -->
  <div class="difficulty-selector">
    <label class="difficulty-label" for="difficulty">AI Difficulty:</label>
    <select 
      id="difficulty"
      class="difficulty-select" 
      bind:value={selectedDifficulty}
      on:change={handleDifficultyChange}
    >
      {#each Object.entries(AI_DIFFICULTIES) as [key, difficulty]}
        <option value={key}>{difficulty.name} - {difficulty.description}</option>
      {/each}
    </select>
</div>

  <!-- Game Info -->
  <div class="game-info">
    <p>First to 11 points wins! The ball gets faster with each hit.</p>
    
    <!-- <ul class="feature-list">
      <li class="feature-item">🎮 Responsive Controls</li>
      <li class="feature-item">🤖 Smart AI</li>
      <li class="feature-item">📱 Touch Support</li>
      <li class="feature-item">⚡ 60fps Gameplay</li>
      <li class="feature-item">🎨 Modern Design</li>
    </ul> -->

    <p>
      {#if $gameState.over}
        Game finished! {$gameState.scoreLeft > $gameState.scoreRight ? 'You won!' : 'AI won!'} 
        Press R to play again.
      {:else if $gameState.paused}
        Game paused. Press Space to continue.
      {:else}
        Good luck and have fun! 🚀
      {/if}
    </p>
  </div>
</div>