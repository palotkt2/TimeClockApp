'use client';
import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import Link from 'next/link';

export default function SideNavigation() {
  return (
    <List>
      {/* Corrected ListItem components */}
      <ListItem component={Link} href="/dashboard" sx={{ cursor: 'pointer' }}>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem component={Link} href="/profile" sx={{ cursor: 'pointer' }}>
        <ListItemText primary="Profile" />
      </ListItem>
      <ListItem component={Link} href="/settings" sx={{ cursor: 'pointer' }}>
        <ListItemText primary="Settings" />
      </ListItem>
    </List>
  );
}
