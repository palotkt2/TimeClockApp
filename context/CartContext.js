'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Initialize with default value to prevent undefined errors
const CartContext = createContext({
  cartQuantity: 1,
  setCartQuantity: () => {},
});

// Provider component that wraps the app
export function CartProvider({ children }) {
  // Initialize with value from localStorage if available
  const [cartQuantity, setCartQuantity] = useState(1);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedQuantity = localStorage.getItem('cartQuantity');
        if (savedQuantity) {
          setCartQuantity(parseInt(savedQuantity, 10) || 1);
        }
      }
    } catch (error) {
      console.error('Error loading cart quantity from localStorage:', error);
    }
  }, []);

  // Create a function that updates both state and localStorage
  const updateCartQuantity = (newQuantity) => {
    try {
      // Ensure the value is a valid number
      const validQuantity = Math.max(1, Number(newQuantity) || 1);

      // Update state immediately
      setCartQuantity(validQuantity);

      // Then persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartQuantity', validQuantity.toString());
      }

      // Add debugging
      console.log('Cart quantity updated to:', validQuantity);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Still update state even if localStorage fails
      setCartQuantity(Math.max(1, Number(newQuantity) || 1));
    }
  };

  const value = {
    cartQuantity,
    setCartQuantity: updateCartQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use the context - make sure we check for undefined
export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
