import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import Image from 'next/image';
import InfoIcon from '@mui/icons-material/Info';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const marqueeAnimation = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-120%); }
`;

const Header = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format the date: weekday, month day, year
  const formattedDate = dateTime.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Capitalize first letter for better appearance
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Get hours, minutes, seconds for modern display
  const hours = dateTime.getHours();
  // Convert to 12-hour format
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const formattedHours = hours12.toString().padStart(2, '0');
  const minutes = dateTime.getMinutes().toString().padStart(2, '0');
  const seconds = dateTime.getSeconds().toString().padStart(2, '0');
  const ampm = dateTime.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        bgcolor: 'white',
        mb: 2,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        {/* Logo on the left */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Image
            src="/images/benchpro-logo-blue-back.svg"
            alt="BenchPro Logo"
            width={140}
            height={55}
            priority
            style={{ height: 'auto' }}
          />
        </Box>

        {/* Center content with marquee text (removed Date Paper) */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Horizontal scrolling text - improved marquee effect */}
          <Box
            sx={{
              mt: 1,
              width: '80%',
              maxWidth: '600px',
              overflow: 'hidden',
              backgroundColor: '#e3f2fd',
              borderRadius: 1,
              border: '1px solid #bbdefb',
              py: 0.75,
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                width: '15px',
                height: '100%',
                zIndex: 2,
              },
              '&::before': {
                left: 0,
                background:
                  'linear-gradient(90deg, #e3f2fd 0%, transparent 100%)',
              },
              '&::after': {
                right: 0,
                background:
                  'linear-gradient(90deg, transparent 0%, #e3f2fd 100%)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                animation: `${marqueeAnimation} 35s linear infinite`,
              }}
            >
              <InfoIcon
                sx={{
                  mr: 1,
                  color: '#1565c0',
                  animation: `${pulseAnimation} 2s infinite`,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Roboto", sans-serif',
                  color: '#0d47a1',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                Instrucciones: Asegúrese que su rostro esté visible y bien
                iluminado. Escanee credencial o ingrése su numero de empleado
                manualmente. Espere la confirmación de registro exitoso.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Clock, Date, and Bonus on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Added Date Paper next to the clock */}
          <Paper
            elevation={2}
            sx={{
              display: 'inline-flex',
              background: 'linear-gradient(145deg, #fdf6e3, #f5deb3)',
              color: '#5d4037',
              p: 1.2,
              borderRadius: 2,
              minWidth: '240px',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(180, 140, 100, 0.3)',
              border: '1px solid #d2b48c',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          >
            <CalendarMonthIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', opacity: 0.9, fontWeight: 500 }}
              >
                Fecha
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', lineHeight: 1 }}
              >
                {capitalizedDate}
              </Typography>
            </Box>
          </Paper>
          {/* Clock Paper remains unchanged */}
          <Paper
            elevation={3}
            sx={{
              display: 'inline-flex',
              background: 'linear-gradient(145deg, #1565c0, #0d47a1)',
              color: 'white',
              p: 1.2,
              borderRadius: 2,
              minWidth: '180px',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: '"Roboto Mono", monospace',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formattedHours}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mx: 0.5,
                  animation: `${pulseAnimation} 1s infinite`,
                }}
              >
                :
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {minutes}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mx: 0.5,
                  animation: `${pulseAnimation} 1s infinite`,
                }}
              >
                :
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {seconds}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  alignSelf: 'flex-start',
                  color: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  px: 0.8,
                  py: 0.3,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {ampm}
              </Typography>
            </Box>
          </Paper>
          {/* Weekly Bonus Paper remains unchanged */}
          <Paper
            elevation={2}
            sx={{
              display: 'inline-flex',
              background: 'linear-gradient(145deg, #2e7d32, #1b5e20)',
              color: 'white',
              p: 1.2,
              borderRadius: 2,
              minWidth: '120px',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          >
            <PaidIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', opacity: 0.9, fontWeight: 500 }}
              >
                Bono Semanal
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', lineHeight: 1 }}
              >
                $950 pesos
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
