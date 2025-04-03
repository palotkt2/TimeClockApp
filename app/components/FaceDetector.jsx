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

  // New state for face depth
  const [faceDepth, setFaceDepth] = useState(null);
  // Add new states for photo detection
  const [isPossiblyPhoto, setIsPossiblyPhoto] = useState(false);
  const [depthVariance, setDepthVariance] = useState(null);

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

    // Check for faces every 200ms
    detectionIntervalRef.current = setInterval(() => {
      detectFaces(model);
    }, 200);
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

  // Function to detect faces in video stream
  const detectFaces = async (model = faceDetectionModel) => {
    if (!model || !videoRef.current || !isRecording) return false;

    try {
      const predictions = await model.estimateFaces(videoRef.current, false);
      // Filter predictions using a confidence threshold (e.g., 0.9)
      const filteredPredictions = predictions.filter(
        (pred) => pred.probability && pred.probability[0] > 0
      );
      const faceDetected = filteredPredictions.length > 0;

      if (faceDetected) {
        // Extract landmarks for depth analysis
        const face = filteredPredictions[0];
        const landmarks = face.landmarks;

        if (landmarks && landmarks.length >= 6) {
          // Calculate depth values from different face landmarks
          const depths = landmarks.map((landmark) => landmark[2]);
          const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;

          // Calculate variance in depth across face landmarks
          // Real faces have more variance in depth, photos are flatter
          const variance =
            depths.reduce(
              (sum, depth) => sum + Math.pow(depth - avgDepth, 2),
              0
            ) / depths.length;
          setDepthVariance(variance);

          // Set threshold for photo detection - may need tuning based on testing
          const isLikelyPhoto = variance < 0.01; // Threshold needs adjustment based on testing
          setIsPossiblyPhoto(isLikelyPhoto);

          // Set the average depth for display
          setFaceDepth(avgDepth);

          // Treat photo detection as a serious error that prevents check-in
          if (isLikelyPhoto) {
            if (onError) {
              onError(
                'Se ha detectado el uso de una fotografía. Por favor, utilice su rostro real para registrar su asistencia.',
                'error' // Changed from 'warning' to 'error'
              );
            }

            // Consider photo detection as "no valid face detected"
            if (isFaceDetected) {
              setIsFaceDetected(false);
              if (onFaceDetectionChange) onFaceDetectionChange(false);
            }

            return false;
          }
        } else {
          setFaceDepth(null);
          setDepthVariance(null);
          setIsPossiblyPhoto(false);
        }

        // Only update and notify parent if state changes and no photo was detected
        if (!isPossiblyPhoto && faceDetected !== isFaceDetected) {
          setIsFaceDetected(faceDetected);
          if (onFaceDetectionChange) onFaceDetectionChange(faceDetected);
        }

        return !isPossiblyPhoto && faceDetected;
      } else {
        setFaceDepth(null);
        setDepthVariance(null);
        setIsPossiblyPhoto(false);

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
          <div
            className={`absolute top-3 right-3 flex items-center backdrop-blur-sm shadow-md border ${
              isFaceDetected
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            } rounded-full py-1.5 px-4 transform transition-all duration-300 ease-in-out hover:scale-105`}
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

          {/* Face indicator in upper-left */}
          {isFaceDetected && (
            <div className="absolute top-2 left-2 pointer-events-none">
              <div
                className={`${
                  isPossiblyPhoto ? 'bg-yellow-500' : 'bg-green-500'
                } bg-opacity-20 rounded-full h-16 w-16 flex items-center justify-center`}
                style={{ animation: `${pulse} 2s infinite` }}
              >
                <FaceIcon
                  style={{
                    fontSize: 36,
                    color: isPossiblyPhoto ? '#eab308' : '#10b981',
                  }}
                />
              </div>
            </div>
          )}

          {/* Add an explicit photo detection warning */}
          {isPossiblyPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-30 z-20">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-xs">
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: 'error.main', mb: 1 }}
                >
                  ⚠️ Fotografía Detectada
                </Typography>
                <Typography variant="body2">
                  El sistema ha detectado una fotografía. Por favor, use su
                  rostro real para el registro.
                </Typography>
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

      {/* Display face depth and photo detection information */}
      {faceDepth !== null && (
        <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-800 p-2 rounded text-sm flex flex-col">
          <span>Profundidad: {faceDepth.toFixed(2)}</span>
          {depthVariance !== null && (
            <span>
              Variación: {depthVariance.toFixed(5)}
              {isPossiblyPhoto && (
                <span className="ml-2 text-red-600 font-bold">
                  ⛔ FOTO DETECTADA
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </>
  );
}
