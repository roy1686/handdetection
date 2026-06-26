export function drawHandResults(results, ctx, canvas) {
  if (!window.drawConnectors || !window.drawLandmarks || !window.HAND_CONNECTIONS) return;

  const colors = [
    { conn: '#3b82f6', land: '#8b5cf6' }, // Blue / Purple
    { conn: '#ef4444', land: '#f59e0b' }, // Red / Amber
    { conn: '#10b981', land: '#059669' }, // Emerald / Dark Emerald
    { conn: '#ec4899', land: '#be185d' }, // Pink / Dark Pink
  ];

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((landmarks, index) => {
      const colorScheme = colors[index % colors.length];
      
      window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
        color: colorScheme.conn,
        lineWidth: 4
      });
      window.drawLandmarks(ctx, landmarks, {
        color: colorScheme.land,
        lineWidth: 2,
        radius: 3
      });
    });
  }
  ctx.restore();
}
