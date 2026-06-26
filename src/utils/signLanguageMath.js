export function detectSignLanguage(landmarks, handedness) {
  if (!landmarks || landmarks.length < 21) return null;

  const isRightHand = handedness === 'Right';
  
  // Helpers
  const isFolded = (tipIdx, pipIdx) => landmarks[tipIdx].y > landmarks[pipIdx].y;
  const isStraight = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;
  const dist = (p1, p2) => Math.hypot(landmarks[p1].x - landmarks[p2].x, landmarks[p1].y - landmarks[p2].y);

  const indexFolded = isFolded(8, 6);
  const middleFolded = isFolded(12, 10);
  const ringFolded = isFolded(16, 14);
  const pinkyFolded = isFolded(20, 18);

  const indexStraight = isStraight(8, 6);
  const middleStraight = isStraight(12, 10);
  const ringStraight = isStraight(16, 14);
  const pinkyStraight = isStraight(20, 18);

  // Loosened thumb heuristics
  const thumbFolded = isRightHand 
    ? landmarks[4].x > landmarks[5].x - 0.05
    : landmarks[4].x < landmarks[5].x + 0.05;
  const thumbOut = !thumbFolded;

  const isTightFold = (tip, mcp) => landmarks[tip].y > landmarks[mcp].y + 0.05;
  const tightE = isTightFold(8, 5) && isTightFold(12, 9) && isTightFold(16, 13) && isTightFold(20, 17);

  const distThumbIndex = dist(4, 8);
  const distIndexMiddle = dist(8, 12);

  // A: Fist with thumb to the side
  if (indexFolded && middleFolded && ringFolded && pinkyFolded && thumbOut && !tightE) return 'A';

  // B: Flat hand, thumb folded across palm
  if (indexStraight && middleStraight && ringStraight && pinkyStraight && thumbFolded) return 'B';

  // C: Semi-curved hand
  if (distThumbIndex > 0.10 && distThumbIndex < 0.5 && indexFolded && middleFolded && ringFolded) return 'C';

  // D: Index straight, others folded
  if (indexStraight && middleFolded && ringFolded && pinkyFolded && dist(4, 12) < 0.25) return 'D';

  // E: All fingers tightly curled
  if (tightE && thumbFolded) return 'E';

  // F: Index and thumb touching, middle, ring, pinky straight
  if (distThumbIndex < 0.20 && middleStraight && ringStraight && pinkyStraight) return 'F';

  // G: Index straight horizontal, others folded
  if (indexStraight && middleFolded && ringFolded && pinkyFolded && thumbOut && Math.abs(landmarks[8].y - landmarks[5].y) < 0.25) return 'G';

  // H: Index and middle straight and horizontal, others folded
  if (indexStraight && middleStraight && ringFolded && pinkyFolded && thumbFolded && Math.abs(landmarks[8].y - landmarks[5].y) < 0.25) return 'H';

  // I: Pinky straight, others folded
  if (indexFolded && middleFolded && ringFolded && pinkyStraight && thumbFolded) return 'I';

  // L: Index straight up, thumb out, others folded
  if (indexStraight && middleFolded && ringFolded && pinkyFolded && thumbOut && Math.abs(landmarks[8].y - landmarks[5].y) > 0.05) return 'L';

  // O: Fingers curved to touch thumb
  if (distThumbIndex < 0.20 && dist(4, 12) < 0.20 && dist(4, 16) < 0.20) return 'O';

  // S: Fist with thumb over fingers
  if (indexFolded && middleFolded && ringFolded && pinkyFolded && dist(4, 10) < 0.25 && thumbFolded) return 'S';

  // U: Index and middle straight and touching
  if (indexStraight && middleStraight && ringFolded && pinkyFolded && distIndexMiddle < 0.08) return 'U';

  // V: Index and middle straight and separated
  if (indexStraight && middleStraight && ringFolded && pinkyFolded && distIndexMiddle >= 0.08) return 'V';

  // W: Index, middle, ring straight
  if (indexStraight && middleStraight && ringStraight && pinkyFolded && distIndexMiddle >= 0.05) return 'W';

  // Y: Thumb and pinky out, others folded
  if (indexFolded && middleFolded && ringFolded && pinkyStraight && thumbOut) return 'Y';

  return null;
}
