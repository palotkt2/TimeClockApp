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
  faUserShield, // Icon for human verification
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
  const [openHumanVerifyPopup, setOpenHumanVerifyPopup] = useState(false); // New state for human verification notification
  const [successEmployee, setSuccessEmployee] = useState({
    number: '',
    name: 'Empleado',
    photo: null,
    action: 'Registro',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSeverity, setErrorSeverity] = useState('error');
  const [verifyMessage, setVerifyMessage] = useState(''); // New state for human verification message
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // Refs for timers
  const autoCloseTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    showSuccess: ({ number, name, photo, action = 'Registro' }) => {
      setSuccessEmployee({ number, name, photo, action });
      setOpenSuccessPopup(true);
      setOpenErrorPopup(false);
      setOpenHumanVerifyPopup(false);

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
      setOpenHumanVerifyPopup(false);

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

    showHumanVerification: (message) => {
      setVerifyMessage(message);
      setOpenHumanVerifyPopup(true);
      setOpenSuccessPopup(false);
      setOpenErrorPopup(false);

      if (autoCloseDuration > 0) {
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => {
          setOpenHumanVerifyPopup(false);
          focusInput();
        }, autoCloseDuration);
      }
    },

    closeAll: () => {
      setOpenSuccessPopup(false);
      setOpenErrorPopup(false);
      setOpenHumanVerifyPopup(false);
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

  const handleCloseHumanVerify = () => {
    setOpenHumanVerifyPopup(false);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
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
          top: '20%', // Moved higher in the viewport
          transform: 'translateY(-50%)',
          width: { xs: '95%', sm: '630px' }, // 40% increase from 450px
          maxWidth: '630px', // 40% increase from 450px
        }}
      >
        <Alert
          severity="success"
          sx={{
            width: '100%',
            boxShadow: 4,
            p: 3, // Increased padding
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #dcfce7',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <Typography
              variant="h5" // Increased from h6
              component="div"
              sx={{ mb: 1.5, fontWeight: 'bold' }}
            >
              ¡Checada con éxito!
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                width: '100%',
                my: 1.5, // Increased margin
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 98, // 40% increase from 70
                  height: 98, // 40% increase from 70
                  bgcolor: '#bbf7d0',
                  color: '#15803d',
                  animation: `${bounce} 2s ease infinite`,
                  mr: 3, // Increased margin
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

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6" // Increased from subtitle1
                  sx={{ fontWeight: 'bold', mb: 0.7 }}
                >
                  {successEmployee?.name || 'Empleado'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ color: '#16a34a', marginRight: '12px' }} // Increased margin
                    size="lg" // Increased from sm
                  />
                  <Typography variant="body1">
                    {' '}
                    {/* Increased from body2 */}
                    {successEmployee?.action} guardado correctamente
                  </Typography>
                </Box>
              </Box>
            </Box>

            {successEmployee?.photo && (
              <>
                <Divider sx={{ width: '100%', my: 1.5 }} />{' '}
                {/* Increased margin */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography
                    variant="body1" // Increased from body2
                    sx={{ mb: 1.5, fontWeight: 'medium' }}
                  >
                    Foto capturada:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                      mb: 1.5,
                    }}
                  >
                    <img
                      src={successEmployee.photo}
                      alt="Foto capturada"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '182px', // Increased from 130px
                        objectFit: 'contain',
                        borderRadius: '4px',
                        border: '1px solid #dcfce7',
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="success"
                onClick={handleCloseSuccess}
                size="medium" // Increased from small
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  '&:hover': {
                    borderColor: '#15803d',
                    bgcolor: 'rgba(22, 163, 74, 0.04)',
                  },
                  px: 3, // Increased padding
                  py: 1, // Increased padding
                  fontSize: '1rem', // Increased font size
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
          width: { xs: '95%', sm: 'auto' },
          maxWidth: '560px', // 40% increase from 400px
        }}
      >
        <Alert
          severity={errorSeverity}
          sx={{
            width: '100%',
            boxShadow: 4,
            p: 3, // Increased padding
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
              size="medium" // Increased from small
              onClick={handleCloseError}
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />{' '}
              {/* Increased icon size */}
            </IconButton>
          }
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h5" component="div">
              {' '}
              {/* Increased from h6 */}
              {errorSeverity === 'warning' ? '¡Atención!' : '¡Error!'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                my: 1.5, // Increased margin
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 90, // 40% increase from 64px
                  height: 90, // 40% increase from 64px
                  bgcolor: errorSeverity === 'warning' ? '#fef3c7' : '#fee2e2',
                  color: errorSeverity === 'warning' ? '#92400e' : '#b91c1c',
                  mb: 1.5, // Increased margin
                }}
              >
                <span
                  role="img"
                  aria-label={
                    errorSeverity === 'warning'
                      ? 'warning face'
                      : 'surprised face'
                  }
                  style={{ fontSize: '2.8rem' }} // Increased from 2rem
                >
                  {errorSeverity === 'warning' ? '⚠️' : '😮'}
                </span>
              </Avatar>

              <Typography
                variant="h6" // Increased from body1
                sx={{
                  fontWeight: 'medium',
                  mt: 1.5, // Increased margin
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
                    mt: 2.8, // Increased margin
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    borderRadius: '8px',
                    padding: '11px 22px', // Increased padding
                  }}
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    style={{ marginRight: '12px', color: '#b45309' }} // Increased margin
                    size="xl" // Increased from lg
                  />
                  <Typography
                    variant="h4" // Increased from h5
                    sx={{ fontWeight: 'bold', color: '#b45309' }}
                  >
                    {cooldownTimer}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ ml: 1.5, color: '#92400e' }}
                  >
                    {' '}
                    {/* Increased from body2 */}
                    segundos restantes
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1.5,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {errorSeverity === 'warning' ? (
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  style={{ color: '#92400e', marginRight: '12px' }} // Increased margin
                  size="xl" // Increased from lg
                />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{ color: '#b91c1c', marginRight: '12px' }} // Increased margin
                  size="xl" // Increased from lg
                />
              )}
              <Typography variant="body1">
                {' '}
                {/* Increased from body2 */}
                {errorSeverity === 'warning'
                  ? 'Por favor, espere el tiempo indicado'
                  : 'Por favor, contacte a Recursos Humanos'}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {' '}
              {/* Increased margin and gap */}
              {errorSeverity === 'error' && onRetryCamera && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large" // Increased button size
                  onClick={onRetryCamera}
                  sx={{
                    bgcolor: '#0369a1',
                    '&:hover': { bgcolor: '#0284c7' },
                    fontSize: '1rem', // Increased font size
                  }}
                >
                  Reintentar Cámara
                </Button>
              )}
              <Button
                variant="outlined"
                size="large" // Increased button size
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
                  fontSize: '1rem', // Increased font size
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Alert>
      </Snackbar>

      {/* Human verification notification */}
      <Snackbar
        open={openHumanVerifyPopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '25%',
          transform: 'translateY(-50%)',
          width: { xs: '95%', sm: 'auto' },
          maxWidth: '560px', // 40% increase from 400px
        }}
      >
        <Alert
          severity="info"
          sx={{
            width: '100%',
            boxShadow: 4,
            p: 3, // Increased padding
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #dbeafe',
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="medium" // Increased from small
              onClick={handleCloseHumanVerify}
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />{' '}
              {/* Increased icon size */}
            </IconButton>
          }
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h5" component="div">
              {' '}
              {/* Increased from h6 */}
              Verificación de Persona
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                my: 1.5, // Increased margin
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 90, // 40% increase from 64px
                  height: 90, // 40% increase from 64px
                  bgcolor: '#dbeafe',
                  color: '#1e40af',
                  mb: 1.5, // Increased margin
                }}
              >
                <FontAwesomeIcon icon={faUserShield} size="xl" />{' '}
                {/* Increased from lg */}
              </Avatar>

              <Typography
                variant="h6" // Increased from body1
                sx={{
                  fontWeight: 'medium',
                  mt: 1.5, // Increased margin
                  textAlign: 'center',
                }}
              >
                {verifyMessage || 'Por favor, complete la verificación humana.'}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 2.8,
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {' '}
              {/* Increased margin and gap */}
              {onRetryCamera && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large" // Increased button size
                  onClick={onRetryCamera}
                  sx={{
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                    fontSize: '1rem', // Increased font size
                  }}
                >
                  Reintentar Cámara
                </Button>
              )}
              <Button
                variant="outlined"
                size="large" // Increased button size
                onClick={handleCloseHumanVerify}
                sx={{
                  color: '#2563eb',
                  borderColor: '#2563eb',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    bgcolor: 'rgba(37, 99, 235, 0.04)',
                  },
                  fontSize: '1rem', // Increased font size
                }}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
});

export default MessageNotification;
