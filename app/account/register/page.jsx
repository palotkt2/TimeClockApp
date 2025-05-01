'use client';
import { useState } from 'react';
import NextLink from 'next/link';
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  Container,
  Box,
  Grid,
  Divider,
  Paper,
  Avatar,
  CssBaseline,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form data
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return setError('All fields are required');
    }

    if (!agreeToTerms) {
      return setError(
        'You must agree to the Terms of Service and Privacy Policy'
      );
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    try {
      setIsLoading(true);
      console.log('Sending registration data...');

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Registration response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to register');
      }

      setSuccess('Account created successfully! Redirecting to login...');

      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeToTerms(false);

      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            <PersonAddOutlinedIcon fontSize="large" />
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
            Create Account
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            Already have an account?{' '}
            <Link
              component={NextLink}
              href="/account"
              variant="body1"
              sx={{
                fontWeight: 600,
                '&:hover': { textDecoration: 'none' },
              }}
            >
              Sign in
            </Link>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: '100%' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ mt: 3 }}
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
              autoComplete="new-password"
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              sx={{ mt: 3 }}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="agreeTerms"
                  color="primary"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link
                    component={NextLink}
                    href="/terms"
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    component={NextLink}
                    href="/privacy"
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 3 }}
            />
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
                'Create Account'
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
                  Or register with
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
