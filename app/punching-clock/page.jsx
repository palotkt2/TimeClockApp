'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout';
import { keyframes } from '@emotion/react';
import FaceDetector from '../components/FaceDetector';
import MessageNotification from '../components/MessageNotification';
import { saveAs } from 'file-saver';

export default function PunchingClock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const timeoutRef = useRef(null);

  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [openSuccessPopup, setOpenSuccessPopup] = useState(false);
  const [openErrorPopup, setOpenErrorPopup] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState({
    number: '',
    name: 'Empleado',
    photo: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSeverity, setErrorSeverity] = useState('error');

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

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsRecording(false);
    }
    setIsFaceDetected(false);
  };

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

  const capturePhoto = async () => {
    if (!videoRef.current || !isRecording) {
      return null;
    }

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

  const saveToJSONFile = (entries) => {
    const jsonContent = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    saveAs(blob, 'barcodeEntries.json');
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

          const existingEntries =
            JSON.parse(localStorage.getItem('barcodeEntries')) || [];
          existingEntries.push(newEntry);
          localStorage.setItem(
            'barcodeEntries',
            JSON.stringify(existingEntries)
          );

          // Save to JSON file
          saveToJSONFile(existingEntries);

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
      <div className="container mx-auto px-2 py-0 mb-0 max-w-4xl -mt-6">
        <div className="bg-white rounded-lg shadow-xl pt-3 px-6 pb-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              Número de Empleado
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  onKeyDown={handleBarcodeInput}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-10 py-3 w-full text-lg transition-all duration-200"
                  placeholder="Escanear..."
                  autoFocus
                  aria-label="Escanear código de empleado"
                />
                {barcode.trim() !== '' && (
                  <button
                    onClick={() => saveBarcode(barcode)}
                    className="absolute right-2 top-2 bg-blue-600 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-700 transition-all duration-200 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Guardar
                  </button>
                )}
              </div>
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 w-full shadow-sm">
                <span className="font-medium text-gray-600">
                  Último código:{' '}
                </span>
                <span className="font-bold text-blue-700">
                  {lastScannedBarcode || 'Ninguno'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden mb-4 relative bg-gray-100">
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
                  <div className="text-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">
                      Cámara desactivada
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Haga clic en "Iniciar Cámara" para activarla
                    </p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />

              {/* Enhanced status indicator with better styling and animations */}

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

            <div className="mt-4 flex gap-4 w-full justify-center">
              {!isRecording ? (
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={startWebcam}
                  disabled={isModelLoading}
                >
                  {isModelLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Cargando...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Iniciar Cámara
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center font-medium shadow-md"
                  onClick={stopWebcam}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  Detener Cámara
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Si tiene problemas con el registro, contacte a RH al ext. 1234
        </div>
      </div>

      <MessageNotification
        openSuccessPopup={openSuccessPopup}
        onCloseSuccess={handleCloseSuccess}
        successEmployee={successEmployee}
        openErrorPopup={openErrorPopup}
        errorMessage={errorMessage}
        errorSeverity={errorSeverity}
        onCloseError={handleCloseError}
        onRetryCamera={startWebcam}
      />
    </Layout>
  );
}
