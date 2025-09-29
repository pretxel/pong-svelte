<script>
  import { onMount } from 'svelte';
  
  export let onCanvasReady = null;
  
  let canvasElement;
  let ctx;
  
  function simpleRender() {
    if (!ctx) return;
    
    console.log('Simple render called');
    
    // Red background
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 800, 500);
    
    // Green rectangle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(100, 100, 200, 200);
    
    // White text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.fillText('CANVAS WORKING!', 250, 250);
    
    console.log('Simple render complete');
  }
  
  export function renderFrame() {
    simpleRender();
  }
  
  onMount(() => {
    console.log('SimpleCanvas mounting');
    
    if (!canvasElement) {
      console.error('Canvas element not found');
      return;
    }
    
    ctx = canvasElement.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get 2D context');
      return;
    }
    
    console.log('Canvas context acquired, rendering...');
    
    // Initial render
    simpleRender();
    
    // Notify parent
    if (onCanvasReady && typeof onCanvasReady === 'function') {
      console.log('Notifying parent');
      try {
        onCanvasReady(canvasElement);
      } catch (error) {
        console.error('Error in onCanvasReady:', error);
      }
    } else {
      console.log('No onCanvasReady callback provided');
    }
  });
</script>

<style>
  canvas {
    border: 3px solid lime;
    background: #000;
    display: block;
  }
</style>

<canvas
  bind:this={canvasElement}
  width="800"
  height="500"
></canvas>
