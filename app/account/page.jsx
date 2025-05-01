'use client';

// Group related imports
// React imports
import { useState, useEffect } from 'react';

// Next.js imports
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

// MUI components - consider splitting into logical groups
import {
  // Layout components
  Container,
  Box,
  Grid,
  Divider,
  Paper,
  CssBaseline,

  // Form components
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  InputAdornment,

  // Display components
  Typography,
  Link,
  Avatar,
  Alert,
  CircularProgress,

  // Utilities
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';

// Icon imports
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Animation library
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/account/users');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!email || !password) {
      return setError('Email and password are required');
    }

    try {
      setIsLoading(true);
      console.log('Authenticating...');

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();
      console.log('Login response:', response.status);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      console.log('Login successful, redirecting...');

      // Store user data or token if needed
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        })
      );

      // Redirect to the users page
      router.push('/account/users');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={6}
          sx={{
            mt: 8,
            mb: 8,
            p: { xs: 3, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography
            component="h1"
            variant={isSmallScreen ? 'h5' : 'h4'}
            sx={{
              mb: 2,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Sign In
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            Or{' '}
            <Link
              component={NextLink}
              href="/account/register"
              variant="body1"
              sx={{
                fontWeight: 600,
                '&:hover': { textDecoration: 'none' },
              }}
            >
              create a new account
            </Link>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email-address"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{ mt: 3 }}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                mt: 3,
                mb: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                  />
                }
                label="Remember me"
                sx={{ mb: { xs: 2, sm: 0 } }}
              />
              <Link
                component={NextLink}
                href="/account/recover"
                variant="body2"
                sx={{
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'none' },
                }}
              >
                Forgot your password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 4,
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ mt: 4, mb: 3, position: 'relative' }}>
              <Divider
                sx={{
                  '&::before, &::after': { borderColor: 'rgba(0, 0, 0, 0.08)' },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ px: 2, color: 'text.secondary' }}
                >
                  Or continue with
                </Typography>
              </Divider>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#DB4437',
                    borderColor: 'rgba(219, 68, 55, 0.5)',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#DB4437',
                      backgroundColor: 'rgba(219, 68, 55, 0.04)',
                      boxShadow: '0 2px 8px rgba(219, 68, 55, 0.15)',
                    },
                  }}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#4267B2',
                    borderColor: 'rgba(66, 103, 178, 0.5)',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#4267B2',
                      backgroundColor: 'rgba(66, 103, 178, 0.04)',
                      boxShadow: '0 2px 8px rgba(66, 103, 178, 0.15)',
                    },
                  }}
                >
                  Facebook
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}
