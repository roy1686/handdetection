# GestureAI

A complete production-ready AI-powered Hand Gesture Recognition Web Application.

## Features

- **Real-Time Hand Detection**: Track hands with high precision using MediaPipe.
- **Finger Counter**: Instantly count raised fingers.
- **Air Canvas**: Draw on the screen using your index finger.
- **Rock Paper Scissors**: Play against an AI opponent using gestures.
- **Gesture Calculator**: Perform math operations with your hands.
- **Speed Tracker**: Measure your hand movement speed.
- **Hand Heatmap**: Visualize where your hands spend the most time.
- **Gesture Memory**: A fun memory game using finger counts.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion
- **AI/CV**: MediaPipe Hands (`@mediapipe/hands`), MediaPipe Camera Utils

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`. Make sure to grant camera permissions.

### Deployment (Vercel)

This project is fully ready to be deployed on Vercel.
Since there is no backend (all AI processing is done client-side), you can simply connect your GitHub repository to Vercel. The `vercel.json` file is already included to handle React Router navigation.

Build Command: `npm run build`
Output Directory: `dist`

## Privacy & Performance
All image processing is done locally in your browser using WebAssembly and WebGL. No video data is ever sent to a server. This ensures maximum privacy and enables smooth 60 FPS real-time performance.
