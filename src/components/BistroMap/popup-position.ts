export function locationCameraOffset(width: number, height: number): [number, number] {
  if (width < 1100) return [0, Math.min(120, height * 0.18)];
  const cardWidth = 420;
  // Reserve the existing list on the left and room for the popup on the right.
  return [(430 - cardWidth - 72) / 2, 0];
}

// Offsets from a native marker, with the card kept inside the map viewport.
export function popupPosition(point: { x: number; y: number }, viewport: { width: number; height: number }, card: { width: number; height: number }) {
  const gap = 56;
  const margin = 16;
  const desktop = viewport.width >= 1100;
  const preferredX = desktop
    ? (point.x + gap + card.width <= viewport.width - margin ? point.x + gap : point.x - gap - card.width)
    : point.x - card.width / 2;
  const preferredY = desktop ? point.y - card.height / 2 : point.y - gap - card.height;
  const leftEdge = desktop ? Math.min(406, viewport.width - margin - card.width) : margin;
  const x = Math.max(leftEdge, Math.min(preferredX, viewport.width - margin - card.width));
  const y = Math.max(80, Math.min(preferredY, viewport.height - 32 - card.height));
  return { x: x - point.x, y: y - point.y };
}
