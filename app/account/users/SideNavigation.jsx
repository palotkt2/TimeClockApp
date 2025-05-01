'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';

const drawerWidth = 240;

// Define header heights for positioning
const HEADER_HEIGHT = {
  xs: '64px', // Mobile header height
  sm: '64px', // Desktop header height
};

export default function SideNavigation({
  mobileOpen = false,
  handleDrawerToggle,
}) {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user data from localStorage on component mount
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(`${user.firstName} ${user.lastName}`);
        setUserRole(user.role || 'User');
      } else {
        // Redirect to login if no user data
        router.push('/account');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, [router]);

  const handleLogout = () => {
    try {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      // Redirect to login page
      router.push('/account');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/account/users' },
    { text: 'Profile', icon: <PersonIcon />, path: '/account/users/profile' },
    {
      text: 'Bulk Order',
      icon: <BadgeIcon />,
      path: '/account/users/badges',
    },
  ];

  const drawer = (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}></Box>

      {userName && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            href={item.path}
            key={item.text}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      <ListItem
        button
        onClick={handleLogout}
        sx={{
          borderRadius: 1,
          color: 'error.main',
          '&:hover': {
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            // Position below header for mobile
            marginTop: HEADER_HEIGHT.xs,
            height: `calc(100% - ${HEADER_HEIGHT.xs})`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            // Position below header for desktop
            marginTop: HEADER_HEIGHT.sm,
            height: `calc(100% - ${HEADER_HEIGHT.sm})`,
            position: 'fixed',
            zIndex: 1,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
