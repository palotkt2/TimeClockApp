import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      {isMobile ? (
        <Tooltip title="Cerrar sesión">
          <IconButton
            color="inherit"
            onClick={handleClickOpen}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
                color: theme.palette.error.main,
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClickOpen}
          startIcon={<LogoutIcon />}
          sx={{
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.error.main,
              color: 'white',
              borderColor: theme.palette.error.main,
            },
          }}
        >
          Cerrar Sesión
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          {'¿Confirmar cierre de sesión?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            ¿Estás seguro de que deseas cerrar la sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
            autoFocus
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;
