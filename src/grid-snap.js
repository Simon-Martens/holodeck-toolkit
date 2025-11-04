// Minimal grid snapping - just rounds up auto-sized elements to grid boundaries

function snapElement(element) {
  const style = getComputedStyle(document.documentElement);
  const cellWidth = parseFloat(style.getPropertyValue('--grid-cell-width'));
  const cellHeight = parseFloat(style.getPropertyValue('--grid-cell-height'));

  if (!cellWidth || !cellHeight) return;

  // Get current rendered dimensions
  const rect = element.getBoundingClientRect();

  // Round up to nearest grid cell
  const cellsWide = Math.ceil(rect.width / cellWidth);
  const cellsTall = Math.ceil(rect.height / cellHeight);

  // Set explicit dimensions
  element.style.width = `${cellsWide * cellWidth}px`;
  element.style.height = `${cellsTall * cellHeight}px`;
}

function snapAll() {
  document.querySelectorAll('[data-grid-snap]').forEach(snapElement);
}

// Auto-snap on load and when content changes
export function initGridSnap() {
  // Initial snap with retry for grid dimensions
  let attempts = 0;
  const trySnap = () => {
    const cellWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-width'));
    if (cellWidth) {
      snapAll();
    } else if (attempts++ < 10) {
      setTimeout(trySnap, 100);
    }
  };
  setTimeout(trySnap, 50);

  // Re-snap on window resize
  window.addEventListener('resize', snapAll);

  // Observe for new elements with data-grid-snap
  const observer = new MutationObserver(() => snapAll());
  observer.observe(document.body, { childList: true, subtree: true });
}
