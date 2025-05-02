import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
// ...existing code...
import LogoutButton from './LogoutButton';
// ...existing code...

const Navbar = () => {
  // ...existing code...

  const handleLogout = () => {
    // Implementar la lógica de cierre de sesión
    // Por ejemplo:
    // auth.logout();
    // navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Guards TimeSheet
        </Typography>
        {/* ...existing code... */}
        <Box sx={{ ml: 2 }}>
          <LogoutButton onLogout={handleLogout} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
