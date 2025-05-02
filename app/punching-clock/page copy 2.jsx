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
  faExpand,
  faCompress,
} from '@fortawesome/free-solid-svg-icons';
import textToSpeech from '../components/TextToSpeech';

export default function PunchingClock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const notificationRef = useRef(null);
  const pageRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const timeoutRef = useRef(null);

  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAttempted, setFullscreenAttempted] = useState(false);

  const [employeeLastScanTimes, setEmployeeLastScanTimes] = useState({});

  // Use the TextToSpeech utility instead of a hook
  const speakText = (text) => {
    if (textToSpeech) {
      textToSpeech.speak(text);
    }
  };

  // Modify this function to not speak since we're using a more specific message
  const playSuccessSound = () => {
    // Don't speak generic success message here
    // The specific message is spoken in the saveBarcode function
    console.log('Success sound would play here');
  };

  const playErrorSound = () => {
    speakText('Error en el registro');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', voices.length);
      };
    }
  }, []);

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

    setTimeout(() => {
      enterFullscreen();
      setFullscreenAttempted(true);
    }, 500);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Add this effect to test speech on component mount
  useEffect(() => {
    // Wait a moment before trying to speak, to ensure the component is fully mounted
    const timer = setTimeout(() => {
      if (textToSpeech) {
        console.log('Testing speech synthesis...');
        textToSpeech.speak('Sistema listo para registrar empleados');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePageInteraction = () => {
    if (!document.fullscreenElement && fullscreenAttempted) {
      enterFullscreen();
    }
  };

  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error entering fullscreen mode:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen mode:', error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

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

  const verifyRealPerson = async () => {
    const faceDetected = videoRef.current.checkForFace
      ? await videoRef.current.checkForFace()
      : isFaceDetected;

    if (!faceDetected) {
      // Add speech notification when face is not detected
      speakText('Rostro no detectado. Por favor, mire a la cámara.');
      return false;
    }

    if (videoRef.current.isHumanVerified) {
      const isHuman = videoRef.current.isHumanVerified();
      if (!isHuman) {
        // Add speech notification for human verification failure
        speakText(
          'Verificación de persona real fallida. Por favor, muévase ligeramente y parpadee naturalmente.'
        );
      }
      return isHuman;
    }

    return true;
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
        // Add speech notification for face detection failure
        speakText('No se detectó un rostro. Por favor, mire a la cámara.');
      }
      return null;
    }

    // Verify human before proceeding
    const isHuman = await verifyRealPerson();
    if (!isHuman && notificationRef.current) {
      notificationRef.current.showError(
        'Se requiere verificación de persona real. Por favor, mire a la cámara, muévase ligeramente y parpadee.',
        'warning'
      );
      // Speech notification already added in verifyRealPerson
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
      // Reduce quality further to 0.5 (from 0.7) to help with database storage
      return canvas.toDataURL('image/jpeg', 0.5);
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

  // Add function to fetch entries from the database
  const fetchBarcodeEntries = async () => {
    try {
      const response = await fetch('/api/barcode-entries');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
  };

  // Add function to save entry to the database
  const saveBarcodeToDatabase = async (entry) => {
    try {
      const response = await fetch('/api/barcode-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  };

  const saveBarcode = async (codeToSave) => {
    if (codeToSave && codeToSave.trim() !== '') {
      const currentTime = Date.now();
      const lastScanTime = employeeLastScanTimes[codeToSave] || 0;
      const timeSinceLastScan = currentTime - lastScanTime;
      const cooldownPeriod = 5 * 1000;

      if (lastScanTime > 0 && timeSinceLastScan < cooldownPeriod) {
        const remainingSeconds = Math.ceil(
          (cooldownPeriod - timeSinceLastScan) / 1000
        );

        const cooldownMessage = `Debe esperar ${remainingSeconds} segundos antes de volver a checar.`;

        speakText(cooldownMessage);
        playErrorSound();

        if (notificationRef.current) {
          notificationRef.current.showError(
            cooldownMessage,
            'warning',
            remainingSeconds
          );
        }
        setBarcode('');
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
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
        setBarcode('');
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
        return;
      } else {
        // Verify it's a real person before capturing photo
        const isRealPerson = await verifyRealPerson();
        if (!isRealPerson) {
          if (notificationRef.current) {
            notificationRef.current.showError(
              'No se ha podido verificar una persona real. Por favor, asegúrese de mirar a la cámara, moverse ligeramente y parpadear naturalmente.',
              'warning'
            );
            // Speech notification already added in verifyRealPerson
          }
          setBarcode('');
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
          return;
        }

        photoData = await capturePhoto();

        if (!photoData) {
          // Speech notification already added in capturePhoto
          setBarcode('');
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
          return;
        }
      }

      try {
        if (photoData || !isRecording) {
          const timestamp = new Date().toISOString();
          const newEntry = { barcode: codeToSave, timestamp, photo: photoData };

          // Save to SQLite database instead of localStorage
          const result = await saveBarcodeToDatabase(newEntry);

          if (result.success) {
            // Fetch updated entries for the export file
            const allEntries = await fetchBarcodeEntries();
            // Still provide the JSON export functionality
            saveToJSONFile(allEntries);

            if (notificationRef.current) {
              const employeeName = getEmployeeName(codeToSave) || 'Empleado';
              notificationRef.current.showSuccess({
                number: codeToSave,
                name: employeeName,
                photo: photoData,
              });

              // Simply say "Registro exitoso" once
              speakText('Registro exitoso');
            }

            setEmployeeLastScanTimes((prev) => ({
              ...prev,
              [codeToSave]: currentTime,
            }));
          } else {
            throw new Error('Failed to save entry to database');
          }
        }
      } catch (error) {
        console.error('Error saving data:', error);

        speakText('Error al guardar los datos. Por favor contacte a RH.');
        playErrorSound();

        if (notificationRef.current) {
          notificationRef.current.showError(
            'Error al guardar los datos. Por favor contacte a RH.'
          );
        }

        setBarcode('');
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
        return;
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
      <div
        className="container w-full px-2 py-0 mb-0 -mt-12"
        ref={pageRef}
        onClick={handlePageInteraction}
      >
        <div className="bg-white rounded-lg shadow-2xl pt-4 px-8 pb-2 border-2 border-blue-100">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center whitespace-nowrap">
                <FontAwesomeIcon
                  icon={faIdCard}
                  className="h-6 w-6 mr-2 text-blue-600"
                />
                Número de Empleado
              </h2>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
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

              <p className="text-sm text-gray-500 whitespace-nowrap">
                Escanee credencial.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="w-full border border-gray-300 rounded-lg overflow-hidden mb-4 relative bg-gray-100">
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
                width="1024"
                height="480"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  aspectRatio: '1024/480',
                  display: 'block',
                }}
                className="object-cover"
              />

              <FaceDetector
                videoRef={videoRef}
                isRecording={isRecording}
                onFaceDetectionChange={setIsFaceDetected}
                onModelLoadingChange={setIsModelLoading}
                onError={(message, severity = 'error') =>
                  notificationRef.current?.showError(message, severity)
                }
                onHumanVerificationChange={setIsHumanVerified}
              />
            </div>
          </div>
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
