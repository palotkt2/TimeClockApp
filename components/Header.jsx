import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import Image from 'next/image';

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
  const hours = dateTime.getHours().toString().padStart(2, '0');
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
            width={180}
            height={55}
            priority
            style={{ height: 'auto' }}
          />
        </Box>

        {/* Center content with title and date */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontFamily: '"Roboto", sans-serif',
              color: '#1565c0',
              mb: 0.5,
              letterSpacing: '0.5px',
            }}
          >
            Reloj Checador
          </Typography>

          {/* Date now appears below the title */}
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              color: '#5c6bc0',
              fontWeight: 500,
              fontSize: '0.95rem',
              backgroundColor: '#f3f8ff',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              border: '1px solid #e3f2fd',
            }}
          >
            {capitalizedDate}
          </Typography>
        </Box>

        {/* Clock on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                {hours}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
