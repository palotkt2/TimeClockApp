'use client';

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faClock,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { keyframes } from '@emotion/react';

// Animations
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

const MessageNotification = forwardRef(function MessageNotification(
  {
    onRetryCamera,
    inputRef, // Reference to input field for focusing after closing notifications
    autoCloseDuration = 5000, // Auto close after this many ms (0 to disable)
  },
  ref
) {
  // Internal state
  const [openSuccessPopup, setOpenSuccessPopup] = useState(false);
  const [openErrorPopup, setOpenErrorPopup] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState({
    number: '',
    name: 'Empleado',
    photo: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSeverity, setErrorSeverity] = useState('error');
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // Refs for timers
  const autoCloseTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    showSuccess: (employee) => {
      setSuccessEmployee(employee);
      setOpenSuccessPopup(true);
      setOpenErrorPopup(false);

      if (autoCloseDuration > 0) {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => {
          setOpenSuccessPopup(false);
          focusInput();
        }, autoCloseDuration);
      }
    },

    showError: (message, severity = 'error', cooldownSeconds = 0) => {
      setErrorMessage(message);
      setErrorSeverity(severity);
      setOpenErrorPopup(true);
      setOpenSuccessPopup(false);

      if (cooldownSeconds > 0) {
        setCooldownTimer(cooldownSeconds);
        startCooldownTimer();
      } else if (severity === 'warning' && autoCloseDuration > 0) {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => {
          setOpenErrorPopup(false);
          focusInput();
        }, autoCloseDuration);
      }
    },

    closeAll: () => {
      setOpenSuccessPopup(false);
      setOpenErrorPopup(false);
      clearAllTimers();
    },
  }));

  // Helper to focus input
  const focusInput = () => {
    if (inputRef && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  };

  // Start cooldown timer
  const startCooldownTimer = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldownTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(cooldownTimerRef.current);
          setOpenErrorPopup(false);
          focusInput();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Clear all timers
  const clearAllTimers = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
  };

  // Handle closures
  const handleCloseSuccess = () => {
    setOpenSuccessPopup(false);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    focusInput();
  };

  const handleCloseError = () => {
    setOpenErrorPopup(false);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    focusInput();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <>
      {/* Success notification */}
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
                  animation: `${bounce} 2s ease infinite`,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src="/images/ok.webp"
                  alt="Success"
                  style={{
                    width: '70%',
                    height: '70%',
                    objectFit: 'contain',
                  }}
                />
              </Avatar>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', mt: 1 }}
              >
                {successEmployee?.name || 'Empleado'}
              </Typography>

              <Typography variant="body2">
                Número: {successEmployee?.number || ''}
              </Typography>
            </Box>

            {successEmployee?.photo && (
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
              <FontAwesomeIcon
                icon={faCircleCheck}
                style={{ color: '#16a34a', marginRight: '8px' }}
                size="lg"
              />
              <Typography variant="body2">
                Registro guardado correctamente
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="success"
                onClick={handleCloseSuccess}
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  '&:hover': {
                    borderColor: '#15803d',
                    bgcolor: 'rgba(22, 163, 74, 0.04)',
                  },
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Alert>
      </Snackbar>

      {/* Error notification */}
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
              <FontAwesomeIcon icon={faXmark} />
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
                    errorSeverity === 'warning'
                      ? 'warning face'
                      : 'surprised face'
                  }
                  style={{ fontSize: '2rem' }}
                >
                  {errorSeverity === 'warning' ? '⚠️' : '😮'}
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

              {/* Display countdown timer for cooldown warnings */}
              {errorSeverity === 'warning' && cooldownTimer > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    style={{ marginRight: '8px', color: '#b45309' }}
                    size="lg"
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 'bold', color: '#b45309' }}
                  >
                    {cooldownTimer}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, color: '#92400e' }}>
                    segundos restantes
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {errorSeverity === 'warning' ? (
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  style={{ color: '#92400e', marginRight: '8px' }}
                  size="lg"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{ color: '#b91c1c', marginRight: '8px' }}
                  size="lg"
                />
              )}
              <Typography variant="body2">
                {errorSeverity === 'warning'
                  ? 'Por favor, espere el tiempo indicado'
                  : 'Por favor, contacte a Recursos Humanos'}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {errorSeverity === 'error' && onRetryCamera && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onRetryCamera}
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
    </>
  );
});

export default MessageNotification;
