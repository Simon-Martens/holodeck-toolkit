class HyperdeckBgGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.animationTimers = [];
  }

  connectedCallback() {
    this.measure();
    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    // Clean up timers
    this.animationTimers.forEach(timer => clearTimeout(timer));
    this.animationTimers = [];
  }

  measure() {
    // Fixed grid dimensions: 0.5rem width, 1rem height
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.cellWidth = rootFontSize * 0.5;  // 0.5rem = spacing-2 in Tailwind
    this.cellHeight = rootFontSize * 1;   // 1rem = spacing-4 in Tailwind

    // Create a larger pattern with multiple lines of varying thickness
    this.patternWidth = this.cellWidth * 8;
    this.patternHeight = this.cellHeight * 8;

    // Expose grid dimensions as CSS custom properties
    document.documentElement.style.setProperty('--grid-cell-width', `${this.cellWidth}px`);
    document.documentElement.style.setProperty('--grid-cell-height', `${this.cellHeight}px`);
  }

  startAnimation() {
    // Schedule random thickness changes for each line
    const scheduleLineChange = (lineIndex, isVertical) => {
      const randomDelay = 1000 + Math.random() * 4000; // 1-5 seconds
      const timer = setTimeout(() => {
        this.updateLineThickness(lineIndex, isVertical);
        scheduleLineChange(lineIndex, isVertical); // Schedule next change
      }, randomDelay);
      this.animationTimers.push(timer);
    };

    // Schedule for all 9 vertical and 9 horizontal lines
    for (let i = 0; i <= 8; i++) {
      scheduleLineChange(i, true);  // vertical
      scheduleLineChange(i, false); // horizontal
    }
  }

  updateLineThickness(lineIndex, isVertical) {
    const pattern = this.shadowRoot.querySelector('pattern');
    if (!pattern) return;

    const lines = pattern.querySelectorAll('line');
    const lineElement = lines[isVertical ? lineIndex : (9 + lineIndex)];

    if (lineElement) {
      const baseThickness = 0.5;
      const variation = 0.3;
      const newThickness = baseThickness + (Math.random() - 0.5) * variation;
      lineElement.setAttribute('stroke-width', newThickness);
    }
  }

  render() {
    // Generate initial random thickness variations for lines
    const baseThickness = 0.5;
    const variation = 0.3;
    let lines = '';

    // Vertical lines with varying thickness
    for (let i = 0; i <= 8; i++) {
      const x = i * this.cellWidth;
      const thickness = baseThickness + (Math.random() - 0.5) * variation;
      lines += `<line x1="${x}" y1="0" x2="${x}" y2="${this.patternHeight}" stroke="black" stroke-width="${thickness}" opacity="0.08"/>`;
    }

    // Horizontal lines with varying thickness
    for (let i = 0; i <= 8; i++) {
      const y = i * this.cellHeight;
      const thickness = baseThickness + (Math.random() - 0.5) * variation;
      lines += `<line x1="0" y1="${y}" x2="${this.patternWidth}" y2="${y}" stroke="black" stroke-width="${thickness}" opacity="0.08"/>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }

        svg {
          width: 100%;
          height: 100%;
        }

        line {
          transition: none !important;
        }
      </style>

      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="${this.patternWidth}" height="${this.patternHeight}" patternUnits="userSpaceOnUse">
            ${lines}
          </pattern>

          <!-- Noise filter for background -->
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.15 0.3"/>
            </feComponentTransfer>
          </filter>
        </defs>

        <!-- Grid pattern -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Noise overlay -->
        <rect width="100%" height="100%" filter="url(#noise)" opacity="0.25"/>
      </svg>
    `;
  }
}

customElements.define("hyperdeck-bg-grid", HyperdeckBgGrid);

export default HyperdeckBgGrid;
