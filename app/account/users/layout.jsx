'use client';
import { useState } from 'react';
import { Box, CssBaseline, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideNavigation from './SideNavigation';

const drawerWidth = 240;

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Layout without the custom header
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        overflowY: 'hidden', // Keeps this to prevent outer scrollbar
      }}
    >
      <CssBaseline />

      {/* Mobile Menu Toggle Button - Only visible on small screens */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 1300,
          backgroundColor: 'rgba(25, 118, 210, 0.9)',
          color: 'white',
          display: { sm: 'none' },
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 1)',
          },
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Side Navigation (without AppBar) */}
      <SideNavigation
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      {/* Main Content - Adjusted to prevent double scroll */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` }, // Account for drawer width
          maxWidth: '100%', // Ensure content doesn't overflow viewport
          mx: 'auto',
          pb: 0,
          mb: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          overflowY: 'auto', // Changed to 'auto' to allow vertical scrolling
          marginTop: { xs: '48px', sm: 0 }, // Add space for mobile menu button
        }}
      >
        <Box sx={{ width: '100%', overflowX: 'hidden' }}>{children}</Box>
      </Box>

      {/* Hidden footer */}
      <Box component="footer" sx={{ display: 'none' }} />
    </Box>
  );
}
