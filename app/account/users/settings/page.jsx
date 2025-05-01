'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

// This component will redirect or import the profile page content
export default function SettingsPage() {
  const router = useRouter();

  // Option 1: Redirect to the profile page while preserving navigation context
  useEffect(() => {
    router.push('/account/users/profile');
  }, [router]);

  // Show a loading indicator while redirecting
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
      }}
    >
      <CircularProgress />
    </Box>
  );

  /* 
  // Option 2: If you have access to the Profile component, you could import it directly:
  // import Profile from '../profile/page';
  // return <Profile />;
  */
}
