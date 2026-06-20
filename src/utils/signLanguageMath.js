export function detectSignLanguage(landmarks, handedness) {
  // A simple heuristic-based detection for ASL A, B, C, D, E.
  if (!landmarks || landmarks.length < 21) return null;

  // Helpers to determine if fingers are folded
  const isFolded = (tipIdx, pipIdx) => landmarks[tipIdx].y > landmarks[pipIdx].y;
  const isStraight = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;

  const indexFolded = isFolded(8, 6);
  const middleFolded = isFolded(12, 10);
  const ringFolded = isFolded(16, 14);
  const pinkyFolded = isFolded(20, 18);

  const indexStraight = isStraight(8, 6);
  const middleStraight = isStraight(12, 10);
  const ringStraight = isStraight(16, 14);
  const pinkyStraight = isStraight(20, 18);

  // Thumb rules (simplified)
  const isRightHand = handedness === 'Right'; // Note: camera mirror might flip this logically
  const thumbFolded = isRightHand 
    ? landmarks[4].x > landmarks[5].x // Right hand mirrored: thumb x > index mcp x
    : landmarks[4].x < landmarks[5].x;

  const thumbOut = !thumbFolded;

  // Letter B: all fingers straight, thumb folded across palm
  if (indexStraight && middleStraight && ringStraight && pinkyStraight && thumbFolded) {
    return 'B';
  }

  // Letter D: index straight, others folded (often forming circle with thumb)
  if (indexStraight && middleFolded && ringFolded && pinkyFolded) {
    return 'D';
  }

  // Letter E: all fingers tightly curled. Tips are below the MCPs (knuckles 5, 9, 13, 17)
  const isTightFold = (tip, mcp) => landmarks[tip].y > landmarks[mcp].y;
  if (isTightFold(8, 5) && isTightFold(12, 9) && isTightFold(16, 13) && isTightFold(20, 17)) {
    return 'E';
  }

  // Letter A: fingers folded (not necessarily tightly below MCP, but below PIP), thumb out
  if (indexFolded && middleFolded && ringFolded && pinkyFolded && thumbOut) {
    return 'A';
  }

  // Letter C: Semi-curved hand. Hard to distinguish from just relaxed.
  // We'll approximate: fingers are neither straight up nor tightly folded, and thumb is out.
  // Check if distance between thumb tip and index tip is large, but all fingers are bent.
  const distThumbIndex = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
  if (distThumbIndex > 0.1 && indexFolded && middleFolded) {
    // If not A, D, E, we might guess C if it's somewhat open.
    // This is a very rough heuristic for C.
    // For a better 'C', tips x should be significantly shifted.
    return 'C';
  }

  // Letter L: Index straight, thumb out, others folded
  if (indexStraight && middleFolded && ringFolded && pinkyFolded && thumbOut) {
    return 'L';
  }

  // Letter Y: Thumb and pinky out, others folded
  if (indexFolded && middleFolded && ringFolded && pinkyStraight && thumbOut) {
    return 'Y';
  }

  // Letter F: Index and thumb touching, middle, ring, pinky straight
  if (distThumbIndex < 0.1 && middleStraight && ringStraight && pinkyStraight) {
    return 'F';
  }

  // Letter V: Index and middle straight, ring and pinky folded, thumb folded
  if (indexStraight && middleStraight && ringFolded && pinkyFolded && thumbFolded) {
    // V vs W vs others: check distance between index and middle to ensure it's a V? 
    // We can just rely on the folded state
    return 'V';
  }

  // Letter W: Index, middle, ring straight, pinky folded, thumb folded
  if (indexStraight && middleStraight && ringStraight && pinkyFolded && thumbFolded) {
    return 'W';
  }

  return null;
}
