'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Inventory,
  CheckCircle,
  LocalShipping,
  NotificationsActive,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    performance: [],
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/account');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // In a real application, this would be an API call
        // For now, simulate an API call with setTimeout
        setTimeout(() => {
          // Simulated API response
          const userData = JSON.parse(user);
          const data = {
            stats: [
              {
                title: 'Total Revenue',
                value: '$24,500',
                icon: <AttachMoney color="primary" />,
                percentChange: '+14%',
                isPositive: true,
              },
              {
                title: 'Active Orders',
                value: '75',
                icon: <ShoppingCart color="secondary" />,
                percentChange: '+9%',
                isPositive: true,
              },
              {
                title: 'New Customers',
                value: '32',
                icon: <People color="success" />,
                percentChange: '+5%',
                isPositive: true,
              },
              {
                title: 'Inventory',
                value: '523 items',
                icon: <Inventory color="warning" />,
                percentChange: '-3%',
                isPositive: false,
              },
            ],
            recentOrders: [
              {
                id: 'ORD-7523',
                customer: `${userData.firstName} ${userData.lastName}`,
                date: 'Sep 21, 2023',
                amount: '$152.00',
                status: 'Delivered',
                icon: (
                  <CheckCircle
                    fontSize="small"
                    sx={{ color: 'success.main' }}
                  />
                ),
              },
              {
                id: 'ORD-7522',
                customer: `${userData.firstName} ${userData.lastName}`,
                date: 'Sep 20, 2023',
                amount: '$214.99',
                status: 'Shipped',
                icon: (
                  <LocalShipping fontSize="small" sx={{ color: 'info.main' }} />
                ),
              },
              {
                id: 'ORD-7521',
                customer: `${userData.firstName} ${userData.lastName}`,
                date: 'Sep 20, 2023',
                amount: '$98.50',
                status: 'Processing',
                icon: (
                  <NotificationsActive
                    fontSize="small"
                    sx={{ color: 'warning.main' }}
                  />
                ),
              },
            ],
            performance: [
              { label: 'Completed Orders', value: 78 },
              { label: 'Customer Satisfaction', value: 92 },
              { label: 'Inventory Usage', value: 45 },
            ],
          };

          setDashboardData(data);
          setIsLoading(false);
        }, 1000); // Simulate network delay

        // In a real app, you would use fetch:
        /*
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(user).token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
        */
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert
          severity="error"
          icon={<ErrorIcon fontSize="inherit" />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardData.stats.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="600">
                    {card.value}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    height: 48,
                    width: 48,
                  }}
                >
                  {card.icon}
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                {card.isPositive ? (
                  <TrendingUp fontSize="small" color="success" />
                ) : (
                  <TrendingDown fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: card.isPositive ? 'success.main' : 'error.main',
                    ml: 0.5,
                  }}
                >
                  {card.percentChange}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  since last month
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <CardHeader title="Recent Orders" />
            <Divider />
            <CardContent>
              <List>
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={500}>
                              {order.id} - {order.customer}
                            </Typography>
                          }
                          secondary={order.date}
                        />
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ minWidth: 120 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {order.amount}
                          </Typography>
                          <Box
                            display="flex"
                            alignItems="center"
                            minWidth={100}
                          >
                            {order.icon}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              {order.status}
                            </Typography>
                          </Box>
                        </Stack>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No orders found"
                      secondary="Your recent orders will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <CardHeader title="Performance Overview" />
            <Divider />
            <CardContent>
              {dashboardData.performance.map((item, index) => (
                <Box
                  sx={{
                    mb: index < dashboardData.performance.length - 1 ? 3 : 0,
                  }}
                  key={item.label}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    color={
                      index === 0
                        ? 'primary'
                        : index === 1
                        ? 'success'
                        : 'warning'
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
