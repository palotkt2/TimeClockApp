'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Import MUI components
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import DownloadIcon from '@mui/icons-material/Download';

// Create a separate debug component to isolate the localStorage access
const DebugCartStorage = () => {
  const [cartString, setCartString] = useState('');

  useEffect(() => {
    // Only access localStorage on the client
    setCartString(localStorage.getItem('badgeCart') || '[]');
  }, []);

  return (
    <Box
      sx={{
        mt: 4,
        p: 2,
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Debug: Cart Storage
      </Typography>
      <Box
        sx={{
          overflow: 'auto',
          maxHeight: 200,
          backgroundColor: '#f1f1f1',
          p: 1,
        }}
      >
        <pre style={{ fontSize: '0.8rem' }}>{cartString}</pre>
      </Box>
      <Button
        size="small"
        onClick={() =>
          console.log(JSON.parse(localStorage.getItem('badgeCart') || '[]'))
        }
        sx={{ mt: 1 }}
      >
        Log cart to console
      </Button>
    </Box>
  );
};

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // New state for initial loading
  const [zipCode, setZipCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shipping, setShipping] = useState(5.99);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [zipCodeError, setZipCodeError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false); // New state for checkout loader
  const router = useRouter();

  // Shipping options
  const shippingOptions = {
    standard: { name: 'Standard Shipping (3-5 days)', rate: 5.99 },
    express: { name: 'Express Shipping (2 days)', rate: 12.99 },
    overnight: { name: 'Overnight Shipping (1 day)', rate: 24.99 },
  };

  // Calculate total quantity of items in cart
  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    // Set loading state to true initially
    setIsLoading(true);

    // Load cart items from localStorage - only on client side
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('badgeCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // Ensure all items have a quantity property
        const normalizedCart = parsedCart.map((item) => ({
          ...item,
          quantity: item.quantity || item.customizations?.quantity || 1,
        }));

        setCartItems(normalizedCart);

        // Calculate subtotal
        const total = normalizedCart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setSubtotal(total);
      }

      // Dispatch custom event to update the cart icon in the header
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);

      // Set loading to false after data is loaded
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem('badgeCart', JSON.stringify(updatedCart));

    // Recalculate subtotal
    const total = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(total);

    // Dispatch custom event to update the cart icon in the header
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('badgeCart', JSON.stringify(updatedCart));

    // Recalculate subtotal
    const total = updatedCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(total);

    // Dispatch custom event to update the cart icon in the header
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
  };

  // Add a function to clear all cart items
  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('badgeCart', JSON.stringify([]));
    setSubtotal(0);

    // Dispatch custom event to update the cart icon in the header
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
  };

  const proceedToCheckout = () => {
    // Set loading state
    setIsCheckingOut(true);

    // Check if user is logged in and retrieve email
    try {
      const loginDataStr = localStorage.getItem('loginData');
      if (loginDataStr) {
        const loginData = JSON.parse(loginDataStr);
        if (loginData && loginData.email) {
          // Save email specifically for checkout
          localStorage.setItem('checkoutEmail', loginData.email);
        }
      }
    } catch (err) {
      console.error('Error retrieving user email for checkout:', err);
    }

    // Navigate to checkout page
    router.push('/checkout');
  };

  const downloadBadgePreview = (imageUrl, badgeName) => {
    // Create a link element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${badgeName}-preview.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate shipping based on zip code
  const calculateShipping = () => {
    if (!zipCode || zipCode.length < 5) {
      setZipCodeError('Please enter a valid ZIP code');
      return;
    }

    setZipCodeError('');
    setIsCalculatingShipping(true);

    // Simulate API call to calculate shipping
    setTimeout(() => {
      const baseRate = shippingOptions[shippingMethod].rate;

      // Calculate shipping based on zip code first digit
      // In a real app, you would call an actual shipping API
      const firstDigit = parseInt(zipCode.charAt(0));
      let zoneMultiplier = 1.0;

      if (firstDigit >= 0 && firstDigit <= 3) {
        // East coast
        zoneMultiplier = 1.0;
      } else if (firstDigit >= 4 && firstDigit <= 6) {
        // Central
        zoneMultiplier = 1.1;
      } else if (firstDigit >= 7 && firstDigit <= 9) {
        // West coast
        zoneMultiplier = 1.2;
      }

      // Free standard shipping for orders over $100
      const calculatedShipping =
        subtotal > 100 && shippingMethod === 'standard'
          ? 0
          : baseRate * zoneMultiplier;

      setShipping(calculatedShipping);
      setIsCalculatingShipping(false);
    }, 1000);
  };

  // Handle shipping method change
  const handleShippingMethodChange = (e) => {
    setShippingMethod(e.target.value);
    if (zipCode.length >= 5) {
      // Recalculate with new method if we have a zip code
      setShippingMethod(e.target.value, () => calculateShipping());
    } else {
      // Otherwise just use base rate
      setShipping(shippingOptions[e.target.value].rate);
    }
  };

  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + tax + shipping;

  return (
    <div className="container mx-auto px-4 py-4 mt-4">
      <Box
        sx={{
          pt: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Your Shopping Cart
        </Typography>
        {cartItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={clearCart}
            startIcon={<DeleteOutlineIcon />}
            size="small"
          >
            Clear Cart
          </Button>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading cart...
          </Typography>
        </Box>
      ) : cartItems.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph>
            Add some custom badges to start shopping
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/badges"
            startIcon={<ShoppingCartCheckoutIcon />}
          >
            Create a Badge
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 4,
          }}
        >
          <Box sx={{ flex: '2' }}>
            <Paper sx={{ mb: 2, overflow: 'hidden' }}>
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    p: 2,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 100 },
                      mr: 2,
                      mb: { xs: 2, sm: 0 },
                    }}
                  >
                    <Image
                      src={item.imageUrl || '/images/events-badge.jpg'}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="object-contain rounded-md"
                      priority
                    />
                  </Box>

                  <Box sx={{ flex: '1' }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.badgeType} • {item.size}
                    </Typography>
                    <Button
                      startIcon={<DownloadIcon />}
                      size="small"
                      onClick={() =>
                        downloadBadgePreview(
                          item.imageUrl || '/placeholder-badge.png',
                          item.name
                        )
                      }
                      sx={{ mt: 1 }}
                    >
                      Preview
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'space-between', sm: 'center' },
                      mt: { xs: 2, sm: 0 },
                      mr: { xs: 0, sm: 2 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ px: 2 }}>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'center', sm: 'flex-end' },
                      mt: { xs: 2, sm: 0 },
                      ml: { xs: 0, sm: 'auto' },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(item.id)}
                      size="small"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Paper>

            <Button
              startIcon={<ArrowBackIcon />}
              component={Link}
              href="/badges"
              sx={{ mt: 2 }}
            >
              Continue designing badges
            </Button>
          </Box>

          <Box
            sx={{
              flex: '1',
              position: 'sticky', // Always sticky regardless of screen size
              top: '100px',
              alignSelf: 'flex-start',
              height: 'fit-content',
              zIndex: 10, // Add z-index to ensure it stays above other content
              maxHeight: { xs: 'none', lg: 'calc(100vh - 120px)' }, // Limit height on large screens
              overflow: { xs: 'visible', lg: 'auto' }, // Enable scrolling if needed
              // On mobile, improve appearance
              mx: { xs: -2, sm: 0 }, // Remove side margin on smallest screens
              width: { xs: 'calc(100% + 32px)', sm: '100%' }, // Full width on smallest screens
              borderRadius: { xs: '12px 12px 0 0', sm: 1 }, // Rounded top corners on mobile
              boxShadow: { xs: '0 -4px 10px rgba(0,0,0,0.1)', sm: 1 }, // Shadow on top for mobile
              mt: { xs: 2, sm: 0 }, // Add margin top on mobile
            }}
          >
            <Card
              sx={{
                borderRadius: { xs: '12px 12px 0 0', sm: 1 }, // Match parent borderRadius
                boxShadow: { xs: 0, sm: 1 }, // No shadow on mobile (parent has it)
              }}
            >
              <CardContent sx={{ pb: { xs: 9, sm: 2 } }}>
                {' '}
                {/* Add padding at bottom for sticky footer */}
                {/* Mobile-only sticky summary footer */}
                {cartItems.length > 0 && (
                  <Box
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                      backgroundColor: 'background.paper',
                      zIndex: 20,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">Total</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${total.toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={!isCheckingOut && <LocalShippingIcon />}
                      onClick={proceedToCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Checkout'
                      )}
                    </Button>
                  </Box>
                )}
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Tax (7%)</Typography>
                  <Typography>${tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Shipping Options
                </Typography>
                <FormControl fullWidth size="small" margin="dense">
                  <Select
                    value={shippingMethod}
                    onChange={handleShippingMethodChange}
                  >
                    {Object.entries(shippingOptions).map(([key, option]) => (
                      <MenuItem key={key} value={key}>
                        {option.name} (${option.rate.toFixed(2)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Calculate Shipping by ZIP Code
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      error={!!zipCodeError}
                      helperText={zipCodeError}
                      inputProps={{ maxLength: 5 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={calculateShipping}
                      disabled={isCalculatingShipping}
                      sx={{ minWidth: '120px' }}
                    >
                      {isCalculatingShipping ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Calculate'
                      )}
                    </Button>
                  </Box>
                  {subtotal > 100 && shippingMethod === 'standard' && (
                    <FormHelperText>
                      Free standard shipping on orders over $100!
                    </FormHelperText>
                  )}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Typography>Shipping</Typography>
                  <Typography>${shipping.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">${total.toFixed(2)}</Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={!isCheckingOut && <LocalShippingIcon />}
                  onClick={proceedToCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Conditional rendering for debug section */}
      {process.env.NODE_ENV === 'development' &&
        typeof window !== 'undefined' && <DebugCartStorage />}
    </div>
  );
}
