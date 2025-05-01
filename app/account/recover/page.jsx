'use client';
import { useState } from 'react';
import NextLink from 'next/link';
import {
  Button,
  TextField,
  Typography,
  Link,
  Container,
  Box,
  Divider,
  Paper,
  Avatar,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { motion } from 'framer-motion';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password recovery logic here
    console.log({ email });
    setSubmitted(true);
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
            <LockResetOutlinedIcon fontSize="large" />
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
            Recover Password
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
          </Typography>

          {submitted ? (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Alert severity="success" sx={{ borderRadius: 2, mb: 3 }}>
                If an account exists with this email, you will receive password
                reset instructions shortly.
              </Alert>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link
                  component={NextLink}
                  href="/account"
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'none' },
                  }}
                >
                  Back to sign in
                </Link>
              </Box>
            </Box>
          ) : (
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
                id="email"
                label="Email Address"
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  background:
                    'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  },
                }}
              >
                Send Reset Link
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <Link
                    component={NextLink}
                    href="/account"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'none' },
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component={NextLink}
                    href="/account/register"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'none' },
                    }}
                  >
                    Create account
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
}
