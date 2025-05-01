import React from 'react';
import {
  Container,
  Typography,
  Box,
  Link,
  Divider,
  Chip,
  Button,
  Paper,
} from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import NextLink from 'next/link';
import AIChat from '../../components/AIChat';

export default function ChatPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            display: 'inline-block',
          }}
        >
          <SupportIcon
            sx={{ mr: 1, fontSize: 'inherit', verticalAlign: 'middle' }}
          />
          Customer Support
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<AutoAwesomeIcon />}
            label="Powered by Claude AI"
            color="primary"
            variant="outlined"
            sx={{ mx: 1 }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}
        >
          Our virtual assistant is here to help you. Ask any question about our
          services and products!
        </Typography>

        <Button
          component={NextLink}
          href="/badges"
          variant="contained"
          color="primary"
          startIcon={<DesignServicesIcon />}
          sx={{
            mb: 3,
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 10px rgba(25, 118, 210, 0.35)',
            },
          }}
        >
          Design Your Badge Now
        </Button>

        <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 4 }} />
      </Box>

      <Box sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            How to Get Support
          </Typography>
          <Typography paragraph>
            Our virtual assistant is available 24/7 to answer your questions.
            Click the chat bubble in the bottom-right corner to start a
            conversation!
          </Typography>
          <Typography paragraph>
            The assistant can help you with information about our products,
            production times, shipping, returns, and more.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          For additional assistance, you can contact us directly at
          <Link
            href="mailto:support@badgemaker.com"
            sx={{
              ml: 1,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            support@badgemaker.com
          </Link>
        </Typography>
      </Box>

      {/* The chat widget is now positioned fixed in the bottom right corner */}
      <AIChat />
    </Container>
  );
}
