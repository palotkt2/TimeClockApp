'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignInAlt } from 'react-icons/fa';
import users from '../data/users.json';

// MUI imports
import {
  TextField,
  Button,
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  InputAdornment,
  Avatar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already logged in, but only once
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.isLoggedIn) {
            router.push('/storage');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []); // Empty dependency array to run only once

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Por favor ingrese email y contraseña');
      setLoading(false);
      return;
    }

    try {
      // Find user in the users array
      const user = users.find(
        (user) => user.email === email && user.password === password
      );

      if (user) {
        // Save user data to localStorage (excluding password)
        const userData = {
          email: user.email,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString(),
          isLoggedIn: true,
        };

        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect to storage page
        router.push('/storage');
      } else {
        setError(
          'Credenciales inválidas. Por favor verifique su email y contraseña.'
        );
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while checking auth
  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            py: 4,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Control de Tiempo - Acceso
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingrese sus credenciales para acceder al sistema
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FaSignInAlt />
                  )
                }
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
