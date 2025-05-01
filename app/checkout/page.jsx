'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Grid,
  Paper,
  CssBaseline,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { motion } from 'framer-motion';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function CheckoutPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('check');
  const [formValid, setFormValid] = useState(false);
  const [checkInfo, setCheckInfo] = useState({
    checkNumber: '',
    bankName: '',
    accountHolder: '',
  });
  const [expanded, setExpanded] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const shippingOptions = {
    standard: { name: 'Standard Shipping (3-5 days)', rate: 5.99 },
    express: { name: 'Express Shipping (2 days)', rate: 12.99 },
    overnight: { name: 'Overnight Shipping (1 day)', rate: 24.99 },
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const fetchUserProfile = async (userId) => {
    try {
      setIsLoadingPage(true);
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });
      if (response.ok) {
        const profileData = await response.json();
        setFirstName(profileData.firstName || firstName);
        setLastName(profileData.lastName || lastName);
        setEmail(profileData.email || email);
        setFormData((prev) => ({
          ...prev,
          address: profileData.address || prev.address,
          city: profileData.city || prev.city,
          postalCode: profileData.postalCode || prev.postalCode,
          country: profileData.country || prev.country,
          state: profileData.state || prev.state,
        }));
      } else {
        console.warn('Failed to fetch user profile from API:', response.status);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/account');
      return;
    }
    try {
      const user = JSON.parse(userData);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setUserId(user.id);
      setFormData((prev) => ({
        ...prev,
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
      }));
      if (user.id) {
        fetchUserProfile(user.id);
      } else {
        setIsLoadingPage(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/account');
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('badgeCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const normalizedCart = parsedCart.map((item) => ({
          ...item,
          quantity: item.quantity || item.customizations?.quantity || 1,
        }));
        setCartItems(normalizedCart);
      }
    }
  }, []);

  const subtotal =
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.16;
  const shipping =
    cartItems.length > 0
      ? subtotal > 100 && shippingMethod === 'standard'
        ? 0
        : shippingOptions[shippingMethod].rate
      : 0;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateForm();
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
    validateForm();
  };

  const handleCheckInfoChange = (e) => {
    const { name, value } = e.target;
    setCheckInfo({
      ...checkInfo,
      [name]: value,
    });
    validateForm();
  };

  const validateForm = () => {
    const requiredFields = [
      'address',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    const allBillingFieldsFilled = requiredFields.every((field) =>
      formData[field]?.trim()
    );

    const allShippingFieldsFilled =
      !useShippingAddress ||
      requiredFields.every((field) => shippingAddress[field]?.trim());

    let paymentFieldsValid = true;
    if (paymentMethod === 'check') {
      paymentFieldsValid =
        checkInfo.checkNumber && checkInfo.bankName && checkInfo.accountHolder;
    }

    setFormValid(
      allBillingFieldsFilled && allShippingFieldsFilled && paymentFieldsValid
    );
  };

  const handleTermsAgreement = () => {
    if (paymentConfirmed) {
      setPaymentConfirmed(false);
      return;
    }

    setIsTermsLoading(true);
    setTimeout(() => {
      setPaymentConfirmed(true);
      setIsTermsLoading(false);
    }, 800);
  };

  const handleShippingMethodChange = (e) => {
    setShippingMethod(e.target.value);
  };

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!formValid) {
      setError('Please fill in all required fields');
      return;
    }

    if (!paymentConfirmed) {
      setError('Please confirm that you agree to the terms and conditions');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsLoading(true);

      const checkoutPayload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || item.image,
          badgeType: item.badgeType,
          size: item.size,
        })),
        customer: {
          userId: userId,
          name: `${firstName} ${lastName}`.trim(),
          email,
          ...formData,
          shippingAddress: useShippingAddress ? shippingAddress : formData,
        },
        orderInfo: {
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          total: total,
          status: 'pending',
          orderDate: new Date().toISOString(),
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === 'check' ? checkInfo : {},
        },
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify(checkoutPayload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create order';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
      localStorage.setItem('badgeCart', JSON.stringify([]));
      localStorage.removeItem('lastOrderId');
      localStorage.removeItem('checkoutData');
      setFormData({
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
      setShippingAddress({
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
      setCheckInfo({
        checkNumber: '',
        bankName: '',
        accountHolder: '',
      });

      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
      setSuccess(
        `Order #${data.orderId || data.id || 'new'} placed successfully!`
      );

      setTimeout(() => {
        router.push(
          `/checkout/success?orderId=${data.orderId || data.id || 'new'}`
        );
      }, 1500);
    } catch (error) {
      console.error('Checkout error:', error);
      setError(
        error.message || 'An error occurred while processing your order'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPage) {
    return (
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <CircularProgress size={60} color="primary" sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Preparing your checkout experience...
        </Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Box sx={{ mt: 8, mb: 8 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Checkout
            </Typography>
            <Paper
              elevation={3}
              sx={{
                p: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 3,
              }}
            >
              <ShoppingBagIcon
                sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h5" mb={2} fontWeight="medium">
                Your cart is empty
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                mb={4}
                textAlign="center"
              >
                Looks like you haven't added any products to your cart yet.
              </Typography>
              <Button
                component={Link}
                href="/badges"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingBagIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 'medium',
                }}
              >
                Browse Products
              </Button>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 6, mb: 8 }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            sx={{ mb: 4 }}
          >
            Complete Your Purchase
          </Typography>

          {isMobile && (
            <>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  icon={<CheckCircleIcon fontSize="large" />}
                  sx={{ borderRadius: 2, mb: 3 }}
                >
                  {success}
                </Alert>
              )}
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              width: '100%',
            }}
          >
            <Box sx={{ flex: { xs: '1', sm: '1 1 0' }, minWidth: 0 }}>
              <Card
                sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}
              >
                <Box sx={{ bgcolor: 'primary.main', py: 2, px: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="white"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <LocalShippingIcon sx={{ mr: 1 }} /> Shipping Information
                  </Typography>
                </Box>
                {!isMobile && (
                  <>
                    {error && (
                      <Box sx={{ px: 3, pt: 3 }}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {error}
                        </Alert>
                      </Box>
                    )}

                    {success && (
                      <Box sx={{ px: 3, pt: 3 }}>
                        <Alert
                          severity="success"
                          icon={<CheckCircleIcon fontSize="large" />}
                          sx={{ borderRadius: 2 }}
                        >
                          {success}
                        </Alert>
                      </Box>
                    )}
                  </>
                )}
                <Box sx={{ p: 3 }}>
                  {/* Shipping Options Selection - Ensure full width */}
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                      Shipping Options
                    </Typography>
                    <FormControl
                      fullWidth
                      size="small"
                      margin="dense"
                      sx={{ mb: 3, width: '100%' }}
                    >
                      <Select
                        value={shippingMethod}
                        onChange={handleShippingMethodChange}
                        sx={{ width: '100%' }}
                      >
                        {Object.entries(shippingOptions).map(
                          ([key, option]) => (
                            <MenuItem key={key} value={key}>
                              {option.name} (${option.rate.toFixed(2)})
                              {subtotal > 100 &&
                                key === 'standard' &&
                                ' - FREE'}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      {subtotal > 100 && shippingMethod === 'standard' && (
                        <FormHelperText>
                          Free standard shipping on orders over $100!
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Box>

                  <Box sx={{ width: '100%', mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={useShippingAddress}
                          onChange={(e) => {
                            setUseShippingAddress(e.target.checked);
                            validateForm();
                          }}
                          color="primary"
                          name="useShippingAddress"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Ship to a different address
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Use Grid container with full width */}
                  <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {useShippingAddress
                          ? 'Billing Address'
                          : 'Address Information'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="firstName"
                        label="First Name"
                        value={firstName}
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        sx={{ width: '100%' }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        value={lastName}
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        sx={{ width: '100%' }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="email"
                        label="Email Address"
                        value={email}
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        sx={{ width: '100%' }}
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="address"
                        name="address"
                        label="Street Address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="123 Main St"
                        sx={{ width: '100%' }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="city"
                        name="city"
                        label="City"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="state"
                        name="state"
                        label="State"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="postalCode"
                        name="postalCode"
                        label="Postal Code"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="country"
                        name="country"
                        label="Country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  {useShippingAddress && (
                    <Grid container spacing={2} sx={{ width: '100%', mt: 2 }}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Shipping Address
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sx={{ width: '100%' }}>
                        <TextField
                          fullWidth
                          id="shipping-address"
                          name="address"
                          label="Street Address"
                          required
                          value={shippingAddress.address}
                          onChange={handleShippingAddressChange}
                          variant="outlined"
                          placeholder="123 Main St"
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      <Grid
                        container
                        item
                        spacing={2}
                        xs={12}
                        sx={{
                          mt: 0,
                          mb: 0,
                        }}
                      >
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            id="shipping-city"
                            name="city"
                            label="City"
                            required
                            value={shippingAddress.city}
                            onChange={handleShippingAddressChange}
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            id="shipping-state"
                            name="state"
                            label="State"
                            required
                            value={shippingAddress.state}
                            onChange={handleShippingAddressChange}
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="shipping-postalCode"
                          name="postalCode"
                          label="Postal Code"
                          required
                          value={shippingAddress.postalCode}
                          onChange={handleShippingAddressChange}
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="shipping-country"
                          name="country"
                          label="Country"
                          required
                          value={shippingAddress.country}
                          onChange={handleShippingAddressChange}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1', sm: '1 1 0' }, minWidth: 0 }}>
              <Card
                sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}
              >
                <Box sx={{ bgcolor: 'primary.main', py: 2, px: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="white"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <PaymentsIcon sx={{ mr: 1 }} /> Payment Method
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <FormControl
                    component="fieldset"
                    sx={{ width: '100%', mb: 3 }}
                  >
                    <RadioGroup
                      aria-label="payment-method"
                      name="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Paper
                        elevation={paymentMethod === 'check' ? 3 : 1}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border:
                            paymentMethod === 'check'
                              ? `2px solid ${theme.palette.primary.main}`
                              : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <FormControlLabel
                          value="check"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PaymentsIcon
                                sx={{
                                  mr: 1,
                                  color:
                                    paymentMethod === 'check'
                                      ? 'primary.main'
                                      : 'text.secondary',
                                }}
                              />
                              <Typography fontWeight="medium">
                                Pay by Check
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper
                        elevation={paymentMethod === 'bank' ? 3 : 1}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border:
                            paymentMethod === 'bank'
                              ? `2px solid ${theme.palette.primary.main}`
                              : 'none',
                          opacity: 0.6,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <FormControlLabel
                          value="bank"
                          control={<Radio />}
                          disabled
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccountBalanceIcon sx={{ mr: 1 }} />
                              <Typography>
                                Bank Transfer (Coming Soon)
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper
                        elevation={paymentMethod === 'card' ? 3 : 1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border:
                            paymentMethod === 'card'
                              ? `2px solid ${theme.palette.primary.main}`
                              : 'none',
                          opacity: 0.6,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <FormControlLabel
                          value="card"
                          control={<Radio />}
                          disabled
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCardIcon sx={{ mr: 1 }} />
                              <Typography>Credit Card (Coming Soon)</Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </RadioGroup>
                  </FormControl>

                  <Collapse in={paymentMethod === 'check'}>
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <CardContent>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <HelpOutlineIcon color="info" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="medium">
                            Check Payment Details
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ width: '100%' }}>
                          <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                              fullWidth
                              id="checkNumber"
                              name="checkNumber"
                              label="Check Number"
                              required
                              value={checkInfo.checkNumber}
                              onChange={handleCheckInfoChange}
                              variant="outlined"
                              sx={{ width: '100%' }}
                            />
                          </Grid>
                          <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                              fullWidth
                              id="bankName"
                              name="bankName"
                              label="Bank Name"
                              required
                              value={checkInfo.bankName}
                              onChange={handleCheckInfoChange}
                              variant="outlined"
                              sx={{ width: '100%' }}
                            />
                          </Grid>
                          <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                              fullWidth
                              id="accountHolder"
                              name="accountHolder"
                              label="Account Holder Name"
                              required
                              value={checkInfo.accountHolder}
                              onChange={handleCheckInfoChange}
                              variant="outlined"
                              sx={{ width: '100%' }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    <Alert
                      severity="info"
                      icon={<HelpOutlineIcon />}
                      sx={{ borderRadius: 2, mb: 3 }}
                    >
                      <Typography fontWeight="medium" gutterBottom>
                        Check Payment Instructions:
                      </Typography>
                      <Typography variant="body2">
                        Please make your check payable to "Miller Square, Inc."
                        and include your order number on the memo line.
                      </Typography>
                    </Alert>
                  </Collapse>

                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={paymentConfirmed}
                          onChange={handleTermsAgreement}
                          name="paymentConfirm"
                          color="primary"
                          disabled={isTermsLoading}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            I confirm that the information provided is correct
                            and I agree to the{' '}
                            <Link
                              href="/terms"
                              style={{
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              terms and conditions
                            </Link>
                          </Typography>
                          {isTermsLoading && (
                            <CircularProgress
                              size={16}
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1', sm: '1 1 0' }, minWidth: 0 }}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%',
                }}
              >
                <Box sx={{ bgcolor: 'grey.100', py: 2, px: 3 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Order Summary
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {isMobile ? (
                      <>
                        <Button
                          onClick={() => setExpanded(!expanded)}
                          fullWidth
                          sx={{
                            justifyContent: 'space-between',
                            textTransform: 'none',
                          }}
                        >
                          <Typography>
                            {cartItems.length}{' '}
                            {cartItems.length === 1 ? 'item' : 'items'}
                          </Typography>
                          <Typography>
                            {expanded ? 'Hide details' : 'Show details'}
                          </Typography>
                        </Button>
                        <Collapse in={expanded}>
                          <Box sx={{ mt: 2 }}>
                            {cartItems.map((item) => (
                              <CartItemSummary key={item.id} item={item} />
                            ))}
                          </Box>
                        </Collapse>
                      </>
                    ) : (
                      <Box
                        sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}
                      >
                        {cartItems.map((item) => (
                          <CartItemSummary key={item.id} item={item} />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <PriceLine label="Subtotal" value={subtotal} />
                    <PriceLine
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Shipping
                          <Typography
                            variant="caption"
                            sx={{ ml: 1, color: 'text.secondary' }}
                          >
                            ({shippingOptions[shippingMethod].name})
                          </Typography>
                        </Box>
                      }
                      value={shipping}
                    />
                    <PriceLine label="Tax" value={tax} />
                    <Divider sx={{ my: 2 }} />
                    <PriceLine label="Total" value={total} bold />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleCheckout}
                    disabled={isLoading || !formValid || !paymentConfirmed}
                    fullWidth
                    sx={{
                      px: 4,
                      py: 1.5,
                      mt: 3,
                      borderRadius: 2,
                      fontWeight: 'medium',
                      fontSize: '1rem',
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 2,
                      mt: 3,
                    }}
                  >
                    <LockIcon
                      sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Secure checkout
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      We accept
                    </Typography>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
                    >
                      <PaymentsIcon
                        sx={{ fontSize: 28, color: 'text.secondary' }}
                      />
                      <AccountBalanceIcon
                        sx={{ fontSize: 28, color: 'text.secondary' }}
                      />
                      <CreditCardIcon
                        sx={{ fontSize: 28, color: 'text.secondary' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

function CartItemSummary({ item }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        pb: 2,
        mb: 2,
        borderBottom: '1px solid #eaeaea',
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          flexShrink: 0,
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid #eaeaea',
          position: 'relative',
        }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="60px"
            style={{ objectFit: 'cover' }}
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="60px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              No image
            </Typography>
          </Box>
        )}

        {item.quantity > 1 && (
          <Chip
            label={item.quantity}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              height: 24,
              minWidth: 24,
              borderRadius: '50%',
            }}
          />
        )}
      </Box>

      <Box sx={{ ml: 2, flex: 1, overflow: 'hidden' }}>
        <Typography variant="body2" fontWeight="medium" noWrap>
          {item.name}
        </Typography>
        {item.badgeType && item.size && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.badgeType} • {item.size}
          </Typography>
        )}
      </Box>

      <Typography variant="body2" fontWeight="medium">
        ${(item.price * item.quantity).toFixed(2)}
      </Typography>
    </Box>
  );
}

function PriceLine({ label, value, bold = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 1,
        fontWeight: bold ? 'bold' : 'normal',
      }}
    >
      <Typography fontWeight={bold ? 'bold' : 'normal'}>{label}</Typography>
      <Typography fontWeight={bold ? 'bold' : 'normal'}>
        ${value.toFixed(2)}
      </Typography>
    </Box>
  );
}

function InfoIcon(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19 10H17V7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7V10H5C3.9 10 3 10.9 3 12V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V12C21 10.9 20.1 10 19 10ZM9 7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7V10H9V7ZM19 20H5V12H19V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
        fill="currentColor"
      />
    </svg>
  );
}
