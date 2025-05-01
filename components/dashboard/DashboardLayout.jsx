'use client';
import NextLink from 'next/link';
import {
  Box,
  Typography,
  CssBaseline,
  Container,
  Stack,
  Link,
  useTheme,
} from '@mui/material';

export default function DashboardLayout({ children }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Main Content - Now takes full width */}
      <Box
        component="main"
        sx={{
          backgroundColor:
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          {children}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Badges Maker. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={3}>
                <Link
                  component={NextLink}
                  href="/privacy"
                  underline="hover"
                  color="text.secondary"
                  variant="body2"
                >
                  Privacy Policy
                </Link>
                <Link
                  component={NextLink}
                  href="/terms"
                  underline="hover"
                  color="text.secondary"
                  variant="body2"
                >
                  Terms of Service
                </Link>
                <Link
                  component={NextLink}
                  href="/contact"
                  underline="hover"
                  color="text.secondary"
                  variant="body2"
                >
                  Contact Us
                </Link>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
