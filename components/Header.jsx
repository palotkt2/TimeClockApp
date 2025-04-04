import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { keyframes } from '@mui/system';
import Image from 'next/image';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';
import MarqueeText from './MarqueeText';

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
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

  const instructionsText =
    'Instrucciones: Si tiene problemas con el registro, contacte a RH - Asegúrese que su rostro esté visible y bien iluminado. Espere la confirmación de registro exitoso.';

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          mb: 0,
          borderBottom: 'none',
        }}
      >
        <Toolbar sx={{ py: 1.5 }}>
          {/* Logo on the left */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Image
              src="/images/benchpro-logo-blue-back.svg"
              alt="BenchPro Logo"
              width={150}
              height={58}
              priority
              style={{ height: 'auto' }}
            />
          </Box>

          {/* Center content with marquee text */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Using the new MarqueeText component */}
            <Box sx={{ mt: 1, width: '100%' }}>
              <MarqueeText
                text={instructionsText}
                speed={25}
                icon={<InfoIcon sx={{ color: '#1565c0' }} />}
              />
            </Box>
          </Box>

          {/* Clock, Date, and Bonus on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Added Date Paper next to the clock */}
            <Paper
              elevation={2}
              sx={{
                display: 'inline-flex',
                background: 'linear-gradient(145deg, #fdf6e3, #f5deb3)',
                color: '#5d4037',
                p: 1.5,
                borderRadius: 2,
                minWidth: '240px',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(180, 140, 100, 0.2)',
                border: '1px solid #d2b48c',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 15px rgba(180, 140, 100, 0.35)',
                },
              }}
            >
              <CalendarMonthIcon
                sx={{ mr: 1.5, fontSize: '1.3rem', color: '#8d6e63' }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    opacity: 0.9,
                    fontWeight: 500,
                    mb: 0.2,
                  }}
                >
                  Fecha
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', lineHeight: 1.1 }}
                >
                  {capitalizedDate}
                </Typography>
              </Box>
            </Paper>
            {/* Clock Paper with improved UI */}
            <Paper
              elevation={3}
              sx={{
                display: 'inline-flex',
                background: 'linear-gradient(145deg, #1976d2, #0d47a1)',
                color: 'white',
                p: 1.5,
                borderRadius: 2,
                minWidth: '180px',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(21, 101, 192, 0.45)',
                },
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
                    bgcolor: 'rgba(255,255,255,0.25)',
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
            {/* Weekly Bonus Paper with improved UI */}
            <Paper
              elevation={2}
              sx={{
                display: 'inline-flex',
                background: 'linear-gradient(145deg, #2e7d32, #1b5e20)',
                color: 'white',
                p: 1.5,
                borderRadius: 2,
                minWidth: '130px',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 15px rgba(46, 125, 50, 0.45)',
                },
              }}
            >
              <PaidIcon sx={{ mr: 1.5, fontSize: '1.3rem' }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    opacity: 0.9,
                    fontWeight: 500,
                    mb: 0.2,
                  }}
                >
                  Bono Semanal
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', lineHeight: 1.1 }}
                >
                  $950 pesos
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Divider with gradient effect for better visual separation */}
      <Box
        sx={{
          height: '4px',
          background: 'linear-gradient(90deg, #1565c0, #42a5f5, #1976d2)',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          mb: 2,
        }}
      />
    </>
  );
};

export default Header;
