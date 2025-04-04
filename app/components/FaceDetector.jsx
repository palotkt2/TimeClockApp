'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import FaceRetouchingOffIcon from '@mui/icons-material/FaceRetouchingOff';
import { keyframes } from '@emotion/react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

// Animations
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(52, 211, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

export default function FaceDetector({
  videoRef,
  isRecording,
  onFaceDetectionChange,
  onModelLoadingChange,
  onError,
}) {
  // Face detection states
  const [faceDetectionModel, setFaceDetectionModel] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState(null);
  const detectionIntervalRef = useRef(null);

  // New state for tracking no-face timeout
  const noFaceTimeoutRef = useRef(null);
  const [noFaceWarningShown, setNoFaceWarningShown] = useState(false);
  const lastFaceDetectionTimeRef = useRef(0);
  const [showFaceDetectedMessage, setShowFaceDetectedMessage] = useState(false);

  // Enhanced depth detection
  const [faceDepth, setFaceDepth] = useState(null);
  const [isPossiblyPhoto, setIsPossiblyPhoto] = useState(false);
  const [depthVariance, setDepthVariance] = useState(null);

  // History tracking for movement detection
  const depthHistoryRef = useRef([]);
  const landmarkHistoryRef = useRef([]);
  const [movementScore, setMovementScore] = useState(0);
  const [faceConfidence, setFaceConfidence] = useState(0);

  // New metrics for better detection
  const [textureScore, setTextureScore] = useState(0);
  const [edgeScore, setEdgeScore] = useState(0);
  const photoDetectionCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastPhotoWarningRef = useRef(0);

  // New state for enhanced human detection
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [eyeStateHistory, setEyeStateHistory] = useState([]);
  const [livenessScore, setLivenessScore] = useState(0);
  const lastBlinkTimeRef = useRef(0);
  const consecutiveFramesNoBlinkRef = useRef(0);

  // Detection thresholds - adjusted for better sensitivity
  const VARIANCE_THRESHOLD = 0.004; // More sensitive to depth
  const MOVEMENT_THRESHOLD = 0.25; // More sensitive to movement
  const TEXTURE_THRESHOLD = 0.35; // More sensitive to texture
  const BLINK_DETECTION_FRAMES = 5; // Frames to confirm blink
  const REQUIRED_BLINKS = 1; // Minimum blinks required for verification
  const MIN_FACE_CONFIDENCE = 0.75; // Minimum confidence to consider verified human
  const BLINK_TIMEOUT_MS = 10000; // Time window to detect required blinks
  const HISTORY_LENGTH = 10;
  const CONFIDENCE_THRESHOLD = 0.65;
  const PHOTO_DETECTION_THRESHOLD = 3; // Frames to confirm photo
  const FACE_TIMEOUT_MS = 2000; // 2 seconds without face to hide message

  // Load face detection model
  useEffect(() => {
    if (isRecording) {
      loadFaceDetectionModel();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isRecording]);

  const loadFaceDetectionModel = async () => {
    try {
      setIsModelLoading(true);
      if (onModelLoadingChange) onModelLoadingChange(true);
      setFaceDetectionError(null);

      await tf.ready();
      const model = await blazeface.load();

      setFaceDetectionModel(model);
      setIsModelLoading(false);
      if (onModelLoadingChange) onModelLoadingChange(false);
      console.log('Face detection model loaded successfully');

      // Start face detection loop
      startDetection(model);
    } catch (error) {
      console.error('Failed to load face detection model:', error);
      const errorMessage = 'No se pudo cargar el modelo de detección facial';
      setFaceDetectionError(errorMessage);
      setIsModelLoading(false);
      if (onModelLoadingChange) onModelLoadingChange(false);
      if (onError) onError(errorMessage);
    }
  };

  const startDetection = (model) => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Reset history arrays and counters
    depthHistoryRef.current = [];
    landmarkHistoryRef.current = [];
    photoDetectionCountRef.current = 0;
    frameCountRef.current = 0;
    lastFaceDetectionTimeRef.current = 0;
    setShowFaceDetectedMessage(false); // Start with the message hidden

    // Face detection interval
    detectionIntervalRef.current = setInterval(() => {
      detectFaces(model);
    }, 150);

    // Separate interval for checking message timeout (more responsive)
    const messageTimeoutInterval = setInterval(() => {
      const now = Date.now();
      if (
        showFaceDetectedMessage &&
        now - lastFaceDetectionTimeRef.current > FACE_TIMEOUT_MS
      ) {
        setShowFaceDetectedMessage(false);
      }

      // Clean up this interval when detection stops
      if (!isRecording) {
        clearInterval(messageTimeoutInterval);
      }
    }, 100);

    // Make sure to clean up both intervals on unmount
    return () => {
      clearInterval(messageTimeoutInterval);
    };
  };

  // Stop detection when component unmounts or recording stops
  useEffect(() => {
    if (!isRecording && detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      setIsFaceDetected(false);
      if (onFaceDetectionChange) onFaceDetectionChange(false);
    }
  }, [isRecording, onFaceDetectionChange]);

  // Calculate movement score from landmark history
  const calculateMovementScore = (landmarks, prevLandmarks) => {
    if (!prevLandmarks || prevLandmarks.length === 0) return 0;

    // Calculate average movement of landmarks between frames
    let totalMovement = 0;
    landmarks.forEach((landmark, i) => {
      if (prevLandmarks[i]) {
        // Calculate Euclidean distance between current and previous landmark positions
        const dx = landmark[0] - prevLandmarks[i][0];
        const dy = landmark[1] - prevLandmarks[i][1];
        const dz = landmark[2] - prevLandmarks[i][2];

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        totalMovement += distance;
      }
    });

    // Normalize by number of landmarks
    return totalMovement / landmarks.length;
  };

  // Enhanced depth metrics calculation with eye state detection
  const calculateDepthMetrics = (landmarks) => {
    if (!landmarks || landmarks.length < 6)
      return { variance: 0, avgDepth: 0, edgeScore: 0, eyeState: 1.0 };

    // Extract depth values (z-coordinates)
    const depths = landmarks.map((landmark) => landmark[2]);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;

    // Calculate variance using a more stable algorithm
    const squareDiffs = depths.map((depth) => {
      const diff = depth - avgDepth;
      return diff * diff;
    });

    const variance = squareDiffs.reduce((a, b) => a + b, 0) / depths.length;

    // Calculate edge score - difference between adjacent landmarks
    let edgeTotal = 0;
    for (let i = 0; i < landmarks.length - 1; i++) {
      const depth1 = landmarks[i][2];
      const depth2 = landmarks[i + 1][2];
      edgeTotal += Math.abs(depth1 - depth2);
    }

    const edgeScore =
      landmarks.length > 1 ? edgeTotal / (landmarks.length - 1) : 0;

    // Analyze eye landmarks (typically 2-3 and 4-5 in blazeface)
    // Lower value indicates closed eyes (detect blinks)
    let eyeState = 1.0;
    if (landmarks.length >= 6) {
      // Measure the eye opening - simplified approach since blazeface
      // doesn't provide detailed eye landmarks
      const leftEye = landmarks[2];
      const rightEye = landmarks[1];
      const nose = landmarks[0];

      // Calculate eye aspect ratio - simplified version
      // Lower ratio might indicate closed eyes
      const eyeDistanceRatio = calculateEyeOpeningRatio(
        leftEye,
        rightEye,
        nose
      );
      eyeState = eyeDistanceRatio;
    }

    return { variance, avgDepth, edgeScore, eyeState };
  };

  // Helper function to detect eye state
  const calculateEyeOpeningRatio = (leftEye, rightEye, nose) => {
    try {
      // Simple heuristic approach since blazeface doesn't give precise eye landmarks
      // We measure relative positions to detect changes that might indicate blinks
      const leftDist = Math.sqrt(
        Math.pow(leftEye[1] - nose[1], 2) + Math.pow(leftEye[0] - nose[0], 2)
      );

      const rightDist = Math.sqrt(
        Math.pow(rightEye[1] - nose[1], 2) + Math.pow(rightEye[0] - nose[0], 2)
      );

      // Average of both eyes' distances - changes when blinking
      return (leftDist + rightDist) / 2;
    } catch (error) {
      console.error('Error calculating eye ratio:', error);
      return 1.0; // Default to open eyes on error
    }
  };

  // Enhanced blink detection
  const detectBlink = (eyeState) => {
    // Add current eye state to history
    const newEyeStateHistory = [...eyeStateHistory, eyeState];

    // Keep history at manageable size
    if (newEyeStateHistory.length > 15) {
      newEyeStateHistory.shift();
    }
    setEyeStateHistory(newEyeStateHistory);

    // Detect blink pattern: open -> closed -> open
    if (newEyeStateHistory.length >= BLINK_DETECTION_FRAMES) {
      // Calculate average of first few and last few states (should be higher - eyes open)
      // and middle should be lower (eyes closed)
      const firstFrames =
        newEyeStateHistory.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const middleFrames =
        newEyeStateHistory.slice(3, -3).reduce((a, b) => a + b, 0) /
        (newEyeStateHistory.length - 6);
      const lastFrames =
        newEyeStateHistory.slice(-3).reduce((a, b) => a + b, 0) / 3;

      // If we see a dip and then rise (indicating a blink)
      const blinkThreshold = 0.15; // Threshold for detecting blink
      if (
        firstFrames > middleFrames + blinkThreshold &&
        lastFrames > middleFrames + blinkThreshold
      ) {
        const now = Date.now();
        // Don't count rapid repeated detections
        if (now - lastBlinkTimeRef.current > 1000) {
          lastBlinkTimeRef.current = now;
          setBlinkDetected(true);
          consecutiveFramesNoBlinkRef.current = 0;

          // Show short confirmation
          setTimeout(() => {
            setBlinkDetected(false);
          }, 1000);

          return true;
        }
      }
    }

    consecutiveFramesNoBlinkRef.current++;
    return false;
  };

  // New function to analyze texture using pixel data
  const analyzeTexture = (video) => {
    if (!video || !video.videoWidth) return 0;

    try {
      // Create a temporary canvas to analyze pixel data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Get face bounding box (approximate center of video)
      const centerX = video.videoWidth / 2;
      const centerY = video.videoHeight / 2;
      const boxSize = Math.min(video.videoWidth, video.videoHeight) * 0.3;

      // Set canvas size to face region
      canvas.width = boxSize;
      canvas.height = boxSize;

      // Draw face region to canvas
      ctx.drawImage(
        video,
        centerX - boxSize / 2,
        centerY - boxSize / 2,
        boxSize,
        boxSize,
        0,
        0,
        boxSize,
        boxSize
      );

      // Get image data
      const imageData = ctx.getImageData(0, 0, boxSize, boxSize);
      const data = imageData.data;

      // Analyze local contrast (texture)
      let totalVariation = 0;
      const pixelCount = data.length / 4;

      // Sample pixels (use stride to improve performance)
      const sampleStep = 4;
      let sampleCount = 0;

      for (let i = 0; i < data.length; i += 4 * sampleStep) {
        if (i + 4 * sampleStep < data.length) {
          // Get current pixel and next sampled pixel
          const r1 = data[i];
          const g1 = data[i + 1];
          const b1 = data[i + 2];

          const r2 = data[i + 4 * sampleStep];
          const g2 = data[i + 1 + 4 * sampleStep];
          const b2 = data[i + 2 + 4 * sampleStep];

          // Calculate color distance between nearby pixels
          const colorDiff = Math.sqrt(
            Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
          );

          totalVariation += colorDiff;
          sampleCount++;
        }
      }

      // Calculate average variation - higher means more texture
      const avgVariation = totalVariation / (sampleCount || 1);

      // Normalize to 0-1 range (typical values are 5-30 for natural photos)
      return Math.min(1, avgVariation / 20);
    } catch (error) {
      console.error('Error analyzing texture:', error);
      return 0;
    }
  };

  // Function to detect faces in video stream - enhanced for human detection
  const detectFaces = async (model = faceDetectionModel) => {
    if (!model || !videoRef.current || !isRecording) return false;

    try {
      frameCountRef.current++;
      const predictions = await model.estimateFaces(videoRef.current, false);
      const filteredPredictions = predictions.filter(
        (pred) => pred.probability && pred.probability[0] > 0.8
      );
      const faceDetected = filteredPredictions.length > 0;

      if (faceDetected) {
        // Update last face detection time
        lastFaceDetectionTimeRef.current = Date.now();
        setShowFaceDetectedMessage(true);

        // Extract landmarks for depth analysis
        const face = filteredPredictions[0];
        const landmarks = face.landmarks;
        const probability = face.probability[0];

        if (landmarks && landmarks.length >= 6) {
          // Calculate depth metrics with enhanced eye state detection
          const { variance, avgDepth, edgeScore, eyeState } =
            calculateDepthMetrics(landmarks);

          setFaceDepth(avgDepth);
          setDepthVariance(variance);
          setEdgeScore(edgeScore);

          // Check for blink
          const blinkDetected = detectBlink(eyeState);

          // Calculate texture score
          const currentTextureScore = analyzeTexture(videoRef.current);
          setTextureScore(currentTextureScore);

          // Add to history for tracking changes over time
          landmarkHistoryRef.current.push([...landmarks]);
          depthHistoryRef.current.push(variance);

          // Limit history length
          if (landmarkHistoryRef.current.length > HISTORY_LENGTH) {
            landmarkHistoryRef.current.shift();
            depthHistoryRef.current.shift();
          }

          // Calculate movement score if we have history
          let currentMovementScore = 0;
          if (landmarkHistoryRef.current.length > 1) {
            currentMovementScore = calculateMovementScore(
              landmarks,
              landmarkHistoryRef.current[landmarkHistoryRef.current.length - 2]
            );
          }
          setMovementScore(currentMovementScore);

          // Calculate overall confidence combining all metrics - enhanced for human detection
          const varianceScore =
            variance > VARIANCE_THRESHOLD ? 1 : variance / VARIANCE_THRESHOLD;
          const movementScoreNormalized =
            currentMovementScore > MOVEMENT_THRESHOLD
              ? 1
              : currentMovementScore / MOVEMENT_THRESHOLD;
          const textureScoreNormalized =
            currentTextureScore > TEXTURE_THRESHOLD
              ? 1
              : currentTextureScore / TEXTURE_THRESHOLD;
          const edgeScoreNormalized = edgeScore > 0.01 ? 1 : edgeScore / 0.01;

          // Blink factor boosts confidence significantly
          const blinkFactor = blinkDetected
            ? 2.0
            : Date.now() - lastBlinkTimeRef.current < BLINK_TIMEOUT_MS
            ? 1.5
            : 1.0;

          // Calculate liveness score with weighted metrics
          const overallConfidence =
            (varianceScore * 0.3 +
              movementScoreNormalized * 0.25 +
              textureScoreNormalized * 0.2 +
              edgeScoreNormalized * 0.1) *
            blinkFactor;

          setFaceConfidence(overallConfidence);
          setLivenessScore(overallConfidence * 100); // 0-100 scale for display

          // Update human verification state
          const isHuman = overallConfidence > MIN_FACE_CONFIDENCE;

          // Only verify as human if good confidence and at least one blink detected
          const humanVerified =
            isHuman &&
            (blinkDetected ||
              Date.now() - lastBlinkTimeRef.current < BLINK_TIMEOUT_MS);

          setIsHumanVerified(humanVerified);

          // Determine if this is possibly a photo
          const likelyPhoto = overallConfidence < CONFIDENCE_THRESHOLD;

          // Implement consecutive frame detection for more stability
          if (likelyPhoto) {
            photoDetectionCountRef.current++;
          } else {
            photoDetectionCountRef.current = Math.max(
              0,
              photoDetectionCountRef.current - 1
            );
          }

          // Only set photo detection state after multiple consecutive detections
          const confirmedPhoto =
            photoDetectionCountRef.current >= PHOTO_DETECTION_THRESHOLD;

          if (confirmedPhoto !== isPossiblyPhoto) {
            setIsPossiblyPhoto(confirmedPhoto);
          }

          // Handle photo detection warning - with rate limiting to avoid too many alerts
          if (confirmedPhoto) {
            const now = Date.now();
            if (now - lastPhotoWarningRef.current > 3000) {
              // Only show warning every 3 seconds
              lastPhotoWarningRef.current = now;
              if (onError) {
                onError(
                  'Se ha detectado uso de una fotografía. Por favor, asegúrese de usar su rostro real, muévase ligeramente y parpadee.',
                  'error'
                );
              }
            }

            // Consider photo detection as "no valid face detected"
            if (isFaceDetected) {
              setIsFaceDetected(false);
              if (onFaceDetectionChange) onFaceDetectionChange(false);
            }

            return false;
          }
        } else {
          // Reset metrics if landmarks not available
          resetMetrics();
        }

        // Only update and notify parent if state changes and no photo was detected
        if (!isPossiblyPhoto && faceDetected !== isFaceDetected) {
          setIsFaceDetected(faceDetected);
          if (onFaceDetectionChange) onFaceDetectionChange(faceDetected);
        }

        return !isPossiblyPhoto && faceDetected;
      } else {
        // Reset all detection metrics when no face is found
        resetMetrics();

        // Update face detection state
        if (isFaceDetected) {
          setIsFaceDetected(false);
          if (onFaceDetectionChange) onFaceDetectionChange(false);
        }

        return false;
      }
    } catch (error) {
      console.error('Error during face detection:', error);
      const errorMessage = 'Error en la detección facial';
      setFaceDetectionError(errorMessage);
      if (onError) onError(errorMessage);
      return false;
    }
  };

  // Enhanced helper function to reset all metrics
  const resetMetrics = () => {
    setFaceDepth(null);
    setDepthVariance(null);
    setIsPossiblyPhoto(false);
    setMovementScore(0);
    setFaceConfidence(0);
    setTextureScore(0);
    setEdgeScore(0);
    setIsHumanVerified(false);
    setBlinkDetected(false);
    setLivenessScore(0);
    photoDetectionCountRef.current = 0;
    consecutiveFramesNoBlinkRef.current++;

    // Don't reset blink time - we want to remember last blink
  };

  // Public method to check for faces on demand
  const checkForFace = async () => {
    return await detectFaces();
  };

  // Expose the checkForFace method to parent component
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.checkForFace = checkForFace;
    }
  }, [videoRef, faceDetectionModel]);

  // Setup a timer to check if face is not detected for 3 seconds
  useEffect(() => {
    if (isRecording && faceDetectionModel) {
      if (!isFaceDetected) {
        // Show warning immediately when no face is detected
        if (!noFaceWarningShown && onError) {
          onError(
            'No se detecta un rostro en la cámara. Por favor, mire directamente a la cámara.',
            'warning'
          );
          setNoFaceWarningShown(true);
        }
      } else {
        // Face detected, reset warning state
        setNoFaceWarningShown(false);
      }
    }
  }, [
    isRecording,
    isFaceDetected,
    faceDetectionModel,
    noFaceWarningShown,
    onError,
  ]);

  // Reset warning when recording state changes
  useEffect(() => {
    setNoFaceWarningShown(false);
  }, [isRecording]);

  // Helper function to get confidence level color
  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isRecording) return null;

  return (
    <>
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <CircularProgress color="primary" />
          <Typography variant="body2" color="white" sx={{ ml: 2 }}>
            Cargando modelo de detección facial...
          </Typography>
        </div>
      )}

      {!isModelLoading && (
        <>
          {/* Status indicator - only show when face is actually detected or less than 2 seconds passed */}
          {showFaceDetectedMessage && (
            <div
              className={`absolute top-3 right-3 flex items-center backdrop-blur-sm shadow-md border ${
                isFaceDetected
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              } rounded-full py-1.5 px-4 transform transition-all duration-300 ease-in-out hover:scale-105 transition-opacity ${
                !isFaceDetected ? 'opacity-70' : 'opacity-100'
              }`}
            >
              <span
                className={`h-3.5 w-3.5 rounded-full mr-2.5 ${
                  isFaceDetected ? 'bg-green-500' : 'bg-yellow-500'
                } shadow-inner flex-shrink-0`}
              >
                <span
                  className={`absolute inset-0 rounded-full ${
                    isFaceDetected ? 'bg-green-400' : 'bg-yellow-400'
                  } animate-ping opacity-75`}
                  style={{ width: '14px', height: '14px' }}
                ></span>
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">
                {isFaceDetected ? 'Rostro detectado ✓' : 'Buscando rostro...'}
              </span>
            </div>
          )}

          {/* Human verification indicator */}
          {isHumanVerified && (
            <div className="absolute top-16 right-3 flex items-center backdrop-blur-sm shadow-md border bg-blue-100 border-blue-300 text-blue-800 rounded-full py-1.5 px-4 transform transition-all duration-300 ease-in-out">
              <span className="h-3.5 w-3.5 rounded-full mr-2.5 bg-blue-500 shadow-inner flex-shrink-0">
                <span
                  className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"
                  style={{ width: '14px', height: '14px' }}
                ></span>
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">
                Humano verificado ✓
              </span>
            </div>
          )}

          {/* Blink detection indicator - only shown briefly when blink detected */}
          {blinkDetected && (
            <div className="absolute top-28 right-3 flex items-center backdrop-blur-sm shadow-md border bg-purple-100 border-purple-300 text-purple-800 rounded-full py-1.5 px-4 animate-pulse">
              <span className="text-sm font-semibold whitespace-nowrap">
                ¡Parpadeo detectado! 👁️
              </span>
            </div>
          )}

          {/* Face indicator in upper-left - enhanced with human status */}
          {isFaceDetected && (
            <div className="absolute top-2 left-2 pointer-events-none">
              <div
                className={`${
                  isHumanVerified
                    ? 'bg-blue-500'
                    : isPossiblyPhoto
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                } bg-opacity-20 rounded-full h-16 w-16 flex items-center justify-center`}
                style={{ animation: `${pulse} 2s infinite` }}
              >
                <FaceIcon
                  style={{
                    fontSize: 36,
                    color: isHumanVerified
                      ? '#3b82f6'
                      : isPossiblyPhoto
                      ? '#eab308'
                      : '#10b981',
                  }}
                />
              </div>
            </div>
          )}

          {/* Photo detection warning */}
          {isPossiblyPhoto && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-40 z-20"
              style={{ animation: `${shake} 0.5s` }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm border-2 border-red-500">
                <div className="flex justify-center mb-2">
                  <FaceRetouchingOffIcon
                    style={{ fontSize: 48, color: '#ef4444' }}
                  />
                </div>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ color: 'error.main', mb: 1, fontWeight: 'bold' }}
                >
                  ⚠️ No se detecta una persona real
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  El sistema ha detectado que está utilizando una fotografía o
                  imagen estática en lugar de su rostro real.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Para la verificación correcta, por favor:
                </Typography>
                <ul className="text-left list-disc pl-6 mt-2 mb-3">
                  <li>Retire cualquier fotografía del campo visual</li>
                  <li>Asegúrese de que su rostro es visible</li>
                  <li>Mueva ligeramente la cabeza</li>
                  <li>Parpadee naturalmente</li>
                  <li>Asegure buena iluminación</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {faceDetectionError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-100 text-red-800 p-2 rounded text-sm">
          {faceDetectionError}
        </div>
      )}

      {/* Enhanced liveness metrics display */}
      {(faceDepth !== null || depthVariance !== null || faceConfidence > 0) && (
        <div className="absolute bottom-2 right-2 bg-gray-900 text-white p-3 rounded-lg text-sm flex flex-col opacity-80 shadow-lg">
          <span className="font-semibold text-xs text-gray-300 mb-1">
            Verificación de Persona Real
          </span>
          <div className="flex flex-col space-y-1">
            {depthVariance !== null && (
              <span
                className={
                  depthVariance > VARIANCE_THRESHOLD
                    ? 'text-green-300'
                    : 'text-red-300'
                }
              >
                Profundidad: {depthVariance.toFixed(5)}
                {depthVariance <= VARIANCE_THRESHOLD && ' ⚠️'}
              </span>
            )}
            <span
              className={`${
                movementScore / MOVEMENT_THRESHOLD > 0.8
                  ? 'text-green-300'
                  : movementScore / MOVEMENT_THRESHOLD > 0.5
                  ? 'text-yellow-300'
                  : 'text-red-300'
              }`}
            >
              Movimiento: {movementScore.toFixed(3)}
              {movementScore < MOVEMENT_THRESHOLD && ' ⚠️'}
            </span>
            {textureScore > 0 && (
              <span
                className={`${
                  textureScore > TEXTURE_THRESHOLD
                    ? 'text-green-300'
                    : 'text-red-300'
                }`}
              >
                Textura: {textureScore.toFixed(3)}
                {textureScore < TEXTURE_THRESHOLD && ' ⚠️'}
              </span>
            )}
            <span
              className={
                Date.now() - lastBlinkTimeRef.current < BLINK_TIMEOUT_MS
                  ? 'text-green-300'
                  : 'text-yellow-300'
              }
            >
              Parpadeo:{' '}
              {Date.now() - lastBlinkTimeRef.current < BLINK_TIMEOUT_MS
                ? '✅ Detectado'
                : '👁️ Esperando...'}
            </span>
            <div className="mt-1 font-semibold">Verificación Humano:</div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  livenessScore > 75
                    ? 'bg-blue-500'
                    : livenessScore > 50
                    ? 'bg-green-500'
                    : livenessScore > 25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, livenessScore)}%` }}
              ></div>
            </div>
            <span className="text-xs text-center mt-0">
              {isHumanVerified
                ? '✅ Persona Real Verificada'
                : livenessScore > 50
                ? '⏳ Verificando...'
                : '❌ No Verificado'}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
