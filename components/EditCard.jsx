'use client';
import React from 'react';
import DrawerComponent from './DrawerComponent';

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <DrawerComponent isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </DrawerComponent>
  );
};

export default Drawer;
