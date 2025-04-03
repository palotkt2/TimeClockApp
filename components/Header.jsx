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
      position="sticky" // Changed from "static" to "sticky"
      color="default"
      elevation={1}
      sx={{
        bgcolor: 'white',
        mb: 2,
      }}
    >
      <Toolbar>
        {/* Logo on the left */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/images/benchpro-logo-blue-back.svg"
            alt="BenchPro Logo"
            width={200}
            height={60}
            priority
            style={{ height: 'auto' }} // Ensure proper scaling
          />
        </Box>

        {/* Center text */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1, // Ensures horizontal centering
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: '"Roboto", sans-serif',
            color: '#1976d2',
          }}
        >
          Reloj Checador
        </Typography>

        {/* Modern date and time display on the right */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              display: 'inline-flex',
              bgcolor: '#f0f7ff',
              p: 1,
              borderRadius: 2,
              mb: 3, // Increased from mb: 1 to create more separation
              minWidth: '250px',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'medium',
                fontFamily: '"Roboto", sans-serif',
                color: '#1976d2',
              }}
            >
              {capitalizedDate}
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              display: 'inline-flex',
              bgcolor: 'black',
              color: 'white',
              p: 1,
              borderRadius: 2,
              minWidth: '180px',
              justifyContent: 'center',
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
                  color: 'primary.main',
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
