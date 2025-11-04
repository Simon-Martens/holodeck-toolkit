// ESModule entry point
console.log('Hello from main.js!');

// Demo: Add some interactivity
const button = document.getElementById('demo-btn');
if (button) {
  button.addEventListener('click', () => {
    console.log('Button clicked!');
    alert('Hello from Tailwind + esbuild!');
  });
}
