'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout';
import { keyframes } from '@emotion/react';
import FaceDetector from '../components/FaceDetector';
import MessageNotification from '../components/MessageNotification';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdCard,
  faSearch,
  faCheck,
  faVideo,
  faVideoSlash,
  faSpinner,
  faCircleStop,
} from '@fortawesome/free-solid-svg-icons';

export default function PunchingClock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const notificationRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const timeoutRef = useRef(null);

  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [employeeLastScanTimes, setEmployeeLastScanTimes] = useState({});

  useEffect(() => {
    startWebcam().catch((error) => {
      console.error('Failed to auto-start webcam:', error);
      if (notificationRef.current) {
        notificationRef.current.showError(
          'La cámara no inició automáticamente. Haga clic en "Iniciar Cámara" o contacte a RH.',
          'warning'
        );
      }
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

      // Close any error notifications
      if (notificationRef.current) {
        notificationRef.current.closeAll();
      }

      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      if (notificationRef.current) {
        notificationRef.current.showError(
          'No se pudo acceder a la cámara. Por favor, verifique los permisos y contacte a RH si el problema persiste.'
        );
      }
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

  const capturePhoto = async () => {
    if (!videoRef.current || !isRecording) {
      return null;
    }

    const faceDetected = videoRef.current.checkForFace
      ? await videoRef.current.checkForFace()
      : isFaceDetected;

    if (!faceDetected) {
      if (notificationRef.current) {
        notificationRef.current.showError(
          'No se detectó un rostro. Por favor, mire a la cámara.',
          'warning'
        );
      }
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
      if (notificationRef.current) {
        notificationRef.current.showError(
          'Error al capturar la foto. Por favor contacte a RH.'
        );
      }
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
      const currentTime = Date.now();
      const lastScanTime = employeeLastScanTimes[codeToSave] || 0;
      const timeSinceLastScan = currentTime - lastScanTime;
      const cooldownPeriod = 30 * 1000;

      if (lastScanTime > 0 && timeSinceLastScan < cooldownPeriod) {
        const remainingSeconds = Math.ceil(
          (cooldownPeriod - timeSinceLastScan) / 1000
        );

        // Show cooldown warning
        if (notificationRef.current) {
          notificationRef.current.showError(
            `Debe esperar ${remainingSeconds} segundos antes de volver a checar.`,
            'warning',
            remainingSeconds
          );
        }
        return;
      }

      setLastScannedBarcode(codeToSave);

      let photoData = null;
      if (!isRecording) {
        if (notificationRef.current) {
          notificationRef.current.showError(
            'La cámara no está activa. Por favor inicie la cámara y vuelva a intentarlo. Contacte a RH si necesita asistencia.'
          );
        }
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

          saveToJSONFile(existingEntries);

          // Show success notification
          if (notificationRef.current) {
            notificationRef.current.showSuccess({
              number: codeToSave,
              name: getEmployeeName(codeToSave) || 'Empleado',
              photo: photoData,
            });
          }

          setEmployeeLastScanTimes((prev) => ({
            ...prev,
            [codeToSave]: currentTime,
          }));
        }
      } catch (error) {
        console.error('Error saving data:', error);
        if (notificationRef.current) {
          notificationRef.current.showError(
            'Error al guardar los datos. Por favor contacte a RH.'
          );
        }
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <FontAwesomeIcon
                  icon={faIdCard}
                  className="h-6 w-6 mr-2 text-blue-600"
                />
                Número de Empleado
              </h2>
              <p className="text-sm text-gray-500">
                Escanee credencial o ingrése su número de empleado manualmente.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número de empleado"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  onKeyDown={handleBarcodeInput}
                />
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex-shrink-0 flex items-center"
                onClick={() => saveBarcode(barcode)}
              >
                <FontAwesomeIcon icon={faCheck} className="h-5 w-5 mr-1" />
                Registrar
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden mb-4 relative bg-gray-100">
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
                  <div className="text-center p-4">
                    <FontAwesomeIcon
                      icon={faVideoSlash}
                      className="h-16 w-16 mx-auto text-gray-400 mb-2"
                    />
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

              <FaceDetector
                videoRef={videoRef}
                isRecording={isRecording}
                onFaceDetectionChange={setIsFaceDetected}
                onModelLoadingChange={setIsModelLoading}
                onError={(message, severity = 'error') =>
                  notificationRef.current?.showError(message, severity)
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
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faVideo}
                        className="h-5 w-5 mr-2"
                      />
                      Iniciar Cámara
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center font-medium shadow-md"
                  onClick={stopWebcam}
                >
                  <FontAwesomeIcon
                    icon={faCircleStop}
                    className="h-5 w-5 mr-2"
                  />
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
        ref={notificationRef}
        onRetryCamera={startWebcam}
        inputRef={barcodeInputRef}
        autoCloseDuration={5000}
      />
    </Layout>
  );
}
