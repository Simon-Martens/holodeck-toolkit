// ESModule entry point
import './hyperdeck-bg-grid.js';
import { initGridSnap } from './grid-snap.js';

console.log('Hello from main.js!');

// Initialize grid snapping for auto-sized elements
initGridSnap();

// Demo: Add some interactivity
const button = document.getElementById('demo-btn');
if (button) {
  button.addEventListener('click', () => {
    console.log('Button clicked!');
    alert('Hello from Tailwind + esbuild!');
  });
}
