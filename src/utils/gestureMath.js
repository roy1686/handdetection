// MediaPipe Hand Landmarks:
// 0: WRIST
// 1: THUMB_CMC, 2: THUMB_MCP, 3: THUMB_IP, 4: THUMB_TIP
// 5: INDEX_MCP, 6: INDEX_PIP, 7: INDEX_DIP, 8: INDEX_TIP
// 9: MIDDLE_MCP, 10: MIDDLE_PIP, 11: MIDDLE_DIP, 12: MIDDLE_TIP
// 13: RING_MCP, 14: RING_PIP, 15: RING_DIP, 16: RING_TIP
// 17: PINKY_MCP, 18: PINKY_PIP, 19: PINKY_DIP, 20: PINKY_TIP

export function countFingers(landmarks, handedness) {
  let count = 0;
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];

  // Check 4 fingers (Index, Middle, Ring, Pinky)
  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[pips[i]].y) {
      count++;
    }
  }

  // Check Thumb
  // Note: 'handedness' usually comes as "Left" or "Right" in MediaPipe, but
  // since we mirror the camera, it might be flipped. 
  // A robust way for the thumb is checking distance from tip to pinky mcp vs ip to pinky mcp,
  // or simply the x-coordinate relative to the index mcp based on handedness.
  const isRightHand = handedness === 'Right';
  
  if (isRightHand) {
    if (landmarks[4].x < landmarks[3].x) count++;
  } else {
    if (landmarks[4].x > landmarks[3].x) count++;
  }

  return count;
}
