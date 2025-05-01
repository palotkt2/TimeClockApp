'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  History as HistoryIcon,
  FileCopy as FileIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

export default function UserAccountPage() {
  const [activeSection, setActiveSection] = useState('orders');

  // Effect only hides footer, not header
  useEffect(() => {
    // Find and hide any footer elements
    const footerElements = document.querySelectorAll('footer');
    const possibleFooters = document.querySelectorAll(
      '[class*="footer"], [id*="footer"]'
    );

    // Hide all elements that might be footers
    [...footerElements, ...possibleFooters].forEach((el) => {
      if (el) {
        el.style.display = 'none';
      }
    });

    // Restore visibility when component unmounts
    return () => {
      [...footerElements, ...possibleFooters].forEach((el) => {
        if (el) {
          el.style.display = '';
        }
      });
    };
  }, []);

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return <OrderHistory />;
      case 'templates':
        return <Templates />;
      default:
        return <OrderHistory />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Modified Box to not cover the entire viewport and leave space for the header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '20px', // Leave space for the header
          minHeight: 'calc(100vh - 64px)', // Adjust for header height
          '& ~ footer': {
            display: 'none !important',
          },
        }}
      >
        {/* Navigation Tabs for section selection */}
        <Container maxWidth="lg" sx={{ mb: 3 }}>
          <Tabs
            value={activeSection}
            onChange={(e, newValue) => setActiveSection(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab value="orders" label="Order History" />
            <Tab value="templates" label="Templates" />
          </Tabs>
        </Container>

        {/* Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

// Order History Component
function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not logged in');
        }

        const user = JSON.parse(userData);
        const userId = user.id;

        // Fetch orders from the API
        const response = await fetch(`/api/orders?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 5 }}>
        <Typography>Loading order history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
          Order History
        </Typography>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Order History
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography>No orders found.</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => (
              <Box
                key={order.id}
                sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      #{order.order_number || `${order.orderId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ color: 'success.main' }}
                    >
                      Total: $
                      {order.total
                        ? parseFloat(order.total).toFixed(2)
                        : '0.00'}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={
                        order.status === 'Completed'
                          ? 'success'
                          : order.status === 'In Progress'
                          ? 'primary'
                          : order.status === 'Cancelled'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>
                </Box>
                <Typography variant="body1">
                  {order.items && order.items.length > 0
                    ? `${order.items.length} item(s): ${order.items
                        .map(
                          (item) =>
                            `${item.quantity || 1} × ${
                              item.name ||
                              item.product_name ||
                              'Unknown product'
                            }`
                        )
                        .join(', ')}`
                    : order.description || 'Order details not available'}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

// Templates Component
function Templates() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Templates
      </Typography>
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card elevation={2}>
              <CardMedia
                sx={{
                  height: 140,
                  backgroundColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">Preview</Typography>
              </CardMedia>
              <CardContent>
                <Typography variant="h6">Template {item}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Last modified: May 12, 2025
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<EditIcon />}
                  variant="contained"
                  size="small"
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DuplicateIcon />}
                  variant="outlined"
                  size="small"
                >
                  Duplicate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
