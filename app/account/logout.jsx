'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem('user');

    // You could also call a logout API endpoint here if needed
    // Example: fetch('/api/logout', { method: 'POST' })

    // Redirect to login page after logout
    setTimeout(() => {
      router.push('/account');
    }, 1000);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Changed from fixed height to min-height
        padding: '2rem', // Added padding for better spacing
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Logging out...
      </Typography>
    </Box>
  );
}
