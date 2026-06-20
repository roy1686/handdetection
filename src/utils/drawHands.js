export function drawHandResults(results, ctx, canvas) {
  if (!window.drawConnectors || !window.drawLandmarks || !window.HAND_CONNECTIONS) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
        color: '#3b82f6', // primary blue
        lineWidth: 4
      });
      window.drawLandmarks(ctx, landmarks, {
        color: '#8b5cf6', // secondary purple
        lineWidth: 2,
        radius: 3
      });
    }
  }
  ctx.restore();
}
