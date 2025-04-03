'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout';
// Remove unnecessary imports
import { keyframes } from '@emotion/react';
// Import our components
import FaceDetector from '../components/FaceDetector';
import MessageNotification from '../components/MessageNotification';

export default function PunchingClock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const timeoutRef = useRef(null);

  // Face detection states - simplified now that we're using the component
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // Success and error popup states
  const [openSuccessPopup, setOpenSuccessPopup] = useState(false);
  const [openErrorPopup, setOpenErrorPopup] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState({
    number: '',
    name: 'Empleado',
    photo: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSeverity, setErrorSeverity] = useState('error');

  // Auto-start webcam when component mounts
  useEffect(() => {
    startWebcam().catch((error) => {
      console.error('Failed to auto-start webcam:', error);
      showError(
        'La cámara no inició automáticamente. Haga clic en "Iniciar Cámara" o contacte a RH.',
        'warning'
      );
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Function to start the webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsRecording(true);

      if (openErrorPopup) {
        setOpenErrorPopup(false);
      }

      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      showError(
        'No se pudo acceder a la cámara. Por favor, verifique los permisos y contacte a RH si el problema persiste.'
      );
    }
  };

  // Function to stop the webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsRecording(false);
    }
    setIsFaceDetected(false);
  };

  // Function to show error message - auto-dismiss for warnings only
  const showError = (message, severity = 'error') => {
    setErrorMessage(message);
    setErrorSeverity(severity);
    setOpenErrorPopup(true);

    if (severity === 'warning') {
      setTimeout(() => {
        setOpenErrorPopup(false);
      }, 5000);
    }
  };

  const handleCloseError = () => {
    setOpenErrorPopup(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccessPopup(false);
  };

  // Function to capture photo from webcam
  const capturePhoto = async () => {
    if (!videoRef.current || !isRecording) {
      return null;
    }

    // Use the checkForFace method exposed by the FaceDetector component
    const faceDetected = videoRef.current.checkForFace
      ? await videoRef.current.checkForFace()
      : isFaceDetected;

    if (!faceDetected) {
      showError(
        'No se detectó un rostro. Por favor, mire a la cámara.',
        'warning'
      );
      return null;
    }

    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Error capturing photo:', error);
      showError('Error al capturar la foto. Por favor contacte a RH.');
      return null;
    }
  };

  const saveBarcode = async (codeToSave) => {
    if (codeToSave && codeToSave.trim() !== '') {
      setLastScannedBarcode(codeToSave);

      let photoData = null;
      if (!isRecording) {
        showError(
          'La cámara no está activa. Por favor inicie la cámara y vuelva a intentarlo. Contacte a RH si necesita asistencia.'
        );
        return;
      } else {
        photoData = await capturePhoto();

        if (!photoData) {
          return;
        }
      }

      try {
        if (photoData || !isRecording) {
          const timestamp = new Date().toISOString();
          const newEntry = { barcode: codeToSave, timestamp, photo: photoData };

          // Save to localStorage
          const existingEntries =
            JSON.parse(localStorage.getItem('barcodeEntries')) || [];
          existingEntries.push(newEntry);
          localStorage.setItem(
            'barcodeEntries',
            JSON.stringify(existingEntries)
          );

          setSuccessEmployee({
            number: codeToSave,
            name: getEmployeeName(codeToSave) || 'Empleado',
            photo: photoData,
          });
          setOpenSuccessPopup(true);

          setTimeout(() => {
            setOpenSuccessPopup(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error saving data:', error);
        showError('Error al guardar los datos. Por favor contacte a RH.');
      }

      setBarcode('');

      setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }, 50);
    }
  };

  const getEmployeeName = (employeeNumber) => {
    return 'Empleado #' + employeeNumber;
  };

  const handleBarcodeInput = (e) => {
    if (e.key === 'Enter') {
      saveBarcode(barcode);
    }
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcode(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim() !== '') {
      timeoutRef.current = setTimeout(() => {
        saveBarcode(value);
      }, 1500);
    }
  };

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stream]);

  const bounce = keyframes`
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  `;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Input fields section */}
          <div className="sticky mb-6">
            <h2 className="text-xl font-semibold mb-3">Número de Empleado</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  onKeyDown={handleBarcodeInput}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Escanear código de barras..."
                  autoFocus
                />
                {barcode.trim() !== '' && (
                  <button
                    onClick={() => saveBarcode(barcode)}
                    className="absolute right-1 top-1 bg-blue-500 text-white rounded px-2 py-1 text-sm"
                  >
                    Guardar
                  </button>
                )}
              </div>
              <div className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full">
                <span className="font-medium">Último código escaneado: </span>
                <span className="font-bold">
                  {lastScannedBarcode || 'Ninguno'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl border border-gray-300 mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />

              {/* Face detection component - update onError to pass severity */}
              <FaceDetector
                videoRef={videoRef}
                isRecording={isRecording}
                onFaceDetectionChange={setIsFaceDetected}
                onModelLoadingChange={setIsModelLoading}
                onError={(message, severity = 'error') =>
                  showError(message, severity)
                }
              />
            </div>

            <div className="mt-4 flex gap-4">
              {!isRecording ? (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={startWebcam}
                  disabled={isModelLoading}
                >
                  {isModelLoading ? 'Cargando...' : 'Iniciar Cámara'}
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={stopWebcam}
                >
                  Detener Cámara
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Notifications component */}
      <MessageNotification
        // Success props
        openSuccessPopup={openSuccessPopup}
        onCloseSuccess={handleCloseSuccess}
        successEmployee={successEmployee}
        // Error props
        openErrorPopup={openErrorPopup}
        errorMessage={errorMessage}
        errorSeverity={errorSeverity}
        onCloseError={handleCloseError}
        onRetryCamera={startWebcam}
      />
    </Layout>
  );
}
