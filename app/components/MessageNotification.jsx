'use client';

import React from 'react';
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

export default function MessageNotification({
  // Success notification props
  openSuccessPopup,
  onCloseSuccess,
  successEmployee,

  // Error notification props
  openErrorPopup,
  errorMessage,
  errorSeverity = 'error',
  onCloseError,
  onRetryCamera,
}) {
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
              <CheckCircleIcon sx={{ color: '#16a34a', mr: 1 }} />
              <Typography variant="body2">
                Registro guardado correctamente
              </Typography>
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
              onClick={onCloseError}
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
                onClick={onCloseError}
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
}
