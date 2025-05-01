import { useState, useEffect } from 'react';
import { IconButton, Badge, Tooltip, ListItemIcon } from '@mui/material';
import { FaShoppingCart } from 'react-icons/fa';

export default function CartButton({ isMobileMenu = false }) {
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    const updateCartQuantity = () => {
      const savedCart = localStorage.getItem('badgeCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const quantity = parsedCart.reduce(
          (total, item) => total + item.quantity,
          0
        );
        setCartQuantity(quantity);
      }
    };

    updateCartQuantity();

    window.addEventListener('storage', updateCartQuantity);
    window.addEventListener('cartUpdated', updateCartQuantity);

    return () => {
      window.removeEventListener('storage', updateCartQuantity);
      window.removeEventListener('cartUpdated', updateCartQuantity);
    };
  }, []);

  if (isMobileMenu) {
    return (
      <ListItemIcon>
        <Badge badgeContent={cartQuantity} color="secondary">
          <FaShoppingCart />
        </Badge>
      </ListItemIcon>
    );
  }

  return (
    <Tooltip title="Go to Cart" arrow>
      <IconButton
        color="inherit"
        href="/cart"
        aria-label="cart"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <Badge badgeContent={cartQuantity} color="secondary">
          <FaShoppingCart />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
