'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { keyframes } from '@emotion/react';

export default function PunchingClock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [savedBarcodes, setSavedBarcodes] = useState([]);
  const timeoutRef = useRef(null);

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

  // Load saved barcodes from localStorage on component mount
  useEffect(() => {
    const storedBarcodeEntries = localStorage.getItem('barcodeEntries');
    if (storedBarcodeEntries) {
      const parsedEntries = JSON.parse(storedBarcodeEntries);

      // Extract just the barcode values for backward compatibility
      const justBarcodes = parsedEntries.map((entry) =>
        typeof entry === 'string' ? entry : entry.barcode
      );

      setSavedBarcodes(justBarcodes);
    }
  }, []);

  // Auto-start webcam when component mounts
  useEffect(() => {
    // Start the webcam automatically
    startWebcam().catch((error) => {
      console.error('Failed to auto-start webcam:', error);
      // Show error but don't block UI - user can try manual start
      showError(
        'La cámara no inició automáticamente. Haga clic en "Iniciar Cámara" o contacte a RH.',
        'warning'
      );
    });

    // Cleanup function - stop the webcam when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Empty dependency array means this runs once on mount

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

      // Close error popup if it was open - camera is working now
      if (openErrorPopup) {
        setOpenErrorPopup(false);
      }

      // Focus the barcode input when camera starts
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
  };

  // Function to show error message - auto-dismiss for warnings only
  const showError = (message, severity = 'error') => {
    setErrorMessage(message);
    setErrorSeverity(severity);
    setOpenErrorPopup(true);

    // Auto-dismiss warnings after 5 seconds, but keep errors until manually closed
    if (severity === 'warning') {
      setTimeout(() => {
        setOpenErrorPopup(false);
      }, 5000);
    }
  };

  // Function to close the error popup manually
  const handleCloseError = () => {
    setOpenErrorPopup(false);
  };

  // Function to capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !isRecording) {
      return null;
    }

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL (base64 encoded image)
    try {
      return canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality to reduce size
    } catch (error) {
      console.error('Error capturing photo:', error);
      showError('Error al capturar la foto. Por favor contacte a RH.');
      return null;
    }
  };

  // Function to check for duplicate entries within timeframe (5 minutes = 300000 ms)
  const isDuplicateEntry = (code, timeframeMs = 300000) => {
    const storedEntries = localStorage.getItem('barcodeEntries');
    if (!storedEntries) return false;

    try {
      const entries = JSON.parse(storedEntries);
      const now = new Date().getTime();

      return entries.some((entry) => {
        if (entry.barcode !== code) return false;

        const entryTime = new Date(entry.timestamp).getTime();
        const timeDiff = now - entryTime;

        return timeDiff < timeframeMs;
      });
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  // Format a time interval in minutes and seconds
  const formatTimeRemaining = (code) => {
    const storedEntries = localStorage.getItem('barcodeEntries');
    if (!storedEntries) return '';

    try {
      const entries = JSON.parse(storedEntries);
      const now = new Date().getTime();

      const matchingEntries = entries
        .filter((entry) => entry.barcode === code)
        .map((entry) => new Date(entry.timestamp).getTime());

      if (matchingEntries.length === 0) return '';

      const mostRecentTime = Math.max(...matchingEntries);
      const fiveMinutesLater = mostRecentTime + 300000;
      const remainingMs = fiveMinutesLater - now;

      if (remainingMs <= 0) return '';

      const remainingMinutes = Math.floor(remainingMs / 60000);
      const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

      return `${remainingMinutes}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return '';
    }
  };

  // Function to save the barcode
  const saveBarcode = async (codeToSave) => {
    if (codeToSave && codeToSave.trim() !== '') {
      if (isDuplicateEntry(codeToSave)) {
        const timeRemaining = formatTimeRemaining(codeToSave);
        showError(
          `Tu registro del día de hoy ya se hizo. Favor de intentar en 5 minutos.${
            timeRemaining ? ` Tiempo restante: ${timeRemaining}` : ''
          }`,
          'warning'
        );

        setLastScannedBarcode(codeToSave);
        setBarcode('');

        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 50);

        return;
      }

      setLastScannedBarcode(codeToSave);

      let photoData = null;
      if (!isRecording) {
        showError(
          'La cámara no está activa. Por favor inicie la cámara y vuelva a intentarlo. Contacte a RH si necesita asistencia.'
        );
        return;
      } else {
        photoData = capturePhoto();

        if (!photoData) {
          showError('No se pudo capturar la foto. Por favor contacte a RH.');
          return;
        }
      }

      const entry = {
        barcode: codeToSave,
        photo: photoData,
        timestamp: new Date().toISOString(),
      };

      try {
        const updatedBarcodes = [codeToSave, ...savedBarcodes];
        setSavedBarcodes(updatedBarcodes);

        const storedEntries = localStorage.getItem('barcodeEntries');
        const existingEntries = storedEntries ? JSON.parse(storedEntries) : [];

        const updatedEntries = [entry, ...existingEntries];

        localStorage.setItem('barcodeEntries', JSON.stringify(updatedEntries));
        localStorage.setItem(
          'scannedBarcodes',
          JSON.stringify(updatedBarcodes)
        );

        if (photoData || !isRecording) {
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
          <div className="mb-6">
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

            <div className="mt-4">
              <div className="relative bg-gray-100 border border-gray-300 rounded max-h-48 overflow-hidden">
                <h3 className="text-lg font-semibold p-3 sticky top-0 bg-gray-100 border-b border-gray-300 z-10 shadow-sm">
                  Códigos Guardados:
                </h3>
                <div className="overflow-y-auto max-h-[calc(12rem-44px)] p-3 pt-0">
                  {savedBarcodes.length > 0 ? (
                    <ul>
                      {savedBarcodes.map((code, index) => (
                        <li
                          key={index}
                          className="mb-1 pb-1 border-b border-gray-200 last:border-0"
                        >
                          {code}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No hay códigos guardados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl border border-gray-300 mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 flex gap-4">
              {!isRecording ? (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={startWebcam}
                >
                  Iniciar Cámara
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

      <Snackbar
        open={openSuccessPopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '25%',
          transform: 'translateY(-50%)',
          width: { xs: '90%', sm: 'auto' },
          maxWidth: '400px',
        }}
      >
        <Alert
          severity="success"
          sx={{
            width: '100%',
            boxShadow: 4,
            p: 2,
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #dcfce7',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" component="div">
              ¡Checada con éxito!
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                my: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#bbf7d0',
                  color: '#15803d',
                  animation: `${bounce} 1s ease infinite`,
                  mb: 1,
                }}
              >
                <span
                  role="img"
                  aria-label="winking face"
                  style={{ fontSize: '2rem' }}
                >
                  😉
                </span>
              </Avatar>

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', mt: 1 }}
              >
                {successEmployee.name}
              </Typography>

              <Typography variant="body2">
                Número: {successEmployee.number}
              </Typography>
            </Box>

            {successEmployee.photo && (
              <>
                <Divider sx={{ width: '100%', my: 1.5 }} />
                <Box sx={{ mt: 1, width: '100%' }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 'medium', textAlign: 'center' }}
                  >
                    Foto capturada:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    <img
                      src={successEmployee.photo}
                      alt="Foto capturada"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '120px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        border: '1px solid #dcfce7',
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CheckCircleIcon sx={{ color: '#16a34a', mr: 1 }} />
              <Typography variant="body2">
                Registro guardado correctamente
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorPopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '25%',
          transform: 'translateY(-50%)',
          width: { xs: '90%', sm: 'auto' },
          maxWidth: '400px',
        }}
      >
        <Alert
          severity={errorSeverity}
          sx={{
            width: '100%',
            boxShadow: 4,
            p: 2,
            backgroundColor:
              errorSeverity === 'warning' ? '#fffbeb' : '#fef2f2',
            color: errorSeverity === 'warning' ? '#92400e' : '#991b1b',
            border: `1px solid ${
              errorSeverity === 'warning' ? '#fef3c7' : '#fee2e2'
            }`,
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseError}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" component="div">
              {errorSeverity === 'warning' ? '¡Atención!' : '¡Error!'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                my: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: errorSeverity === 'warning' ? '#fef3c7' : '#fee2e2',
                  color: errorSeverity === 'warning' ? '#92400e' : '#b91c1c',
                  mb: 1,
                }}
              >
                <span
                  role="img"
                  aria-label={
                    errorSeverity === 'warning' ? 'warning face' : 'error face'
                  }
                  style={{ fontSize: '2rem' }}
                >
                  {errorSeverity === 'warning' ? '⚠️' : '❌'}
                </span>
              </Avatar>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'medium',
                  mt: 1,
                  textAlign: 'center',
                }}
              >
                {errorMessage}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {errorSeverity === 'warning' ? (
                <WarningIcon sx={{ color: '#92400e', mr: 1 }} />
              ) : (
                <ErrorOutlineIcon sx={{ color: '#b91c1c', mr: 1 }} />
              )}
              <Typography variant="body2">
                {errorSeverity === 'warning'
                  ? 'Por favor, espere el tiempo indicado'
                  : 'Por favor, contacte a Recursos Humanos'}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {errorSeverity === 'error' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startWebcam}
                  sx={{
                    bgcolor: '#0369a1',
                    '&:hover': { bgcolor: '#0284c7' },
                  }}
                >
                  Reintentar Cámara
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleCloseError}
                sx={{
                  color: errorSeverity === 'warning' ? '#92400e' : '#991b1b',
                  borderColor:
                    errorSeverity === 'warning' ? '#92400e' : '#991b1b',
                  '&:hover': {
                    borderColor:
                      errorSeverity === 'warning' ? '#b45309' : '#b91c1c',
                    bgcolor:
                      errorSeverity === 'warning'
                        ? 'rgba(234, 179, 8, 0.04)'
                        : 'rgba(239, 68, 68, 0.04)',
                  },
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Alert>
      </Snackbar>
    </Layout>
  );
}
