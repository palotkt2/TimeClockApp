import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const marqueeAnimation = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-120%); }
`;

const MarqueeText = ({
  text = 'Escanee credencial o ingrése su numero de empleado manualmente.',
  speed = 0.1, // Reducido de 1 a 0.5 para un desplazamiento más rápido
  icon = <InfoIcon />,
  backgroundColor = '#e3f2fd',
  textColor = '#0d47a1',
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '500px',
        overflow: 'hidden',
        backgroundColor: backgroundColor,
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
          background: `linear-gradient(90deg, ${backgroundColor} 0%, transparent 100%)`,
        },
        '&::after': {
          right: 0,
          background: `linear-gradient(90deg, transparent 0%, ${backgroundColor} 100%)`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: `${marqueeAnimation} ${speed}s linear infinite`,
        }}
      >
        {React.cloneElement(icon, {
          sx: {
            mr: 1,
            color: textColor,
            animation: `${pulseAnimation} 2s infinite`,
          },
        })}
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Roboto", sans-serif',
            color: textColor,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

export default MarqueeText;
