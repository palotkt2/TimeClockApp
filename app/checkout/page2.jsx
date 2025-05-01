'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CircularProgress, Alert, Button } from '@mui/material';

export default function CheckoutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  // Function to fetch user profile data from API
  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();

        // Update form with complete profile data
        setFormData((prev) => ({
          ...prev,
          name: `${profileData.firstName || ''} ${
            profileData.lastName || ''
          }`.trim(),
          email: profileData.email || prev.email,
          address: profileData.address || prev.address,
          city: profileData.city || prev.city,
          postalCode: profileData.postalCode || prev.postalCode,
          country: profileData.country || prev.country,
        }));

        // Update userData with more complete server-side data
        setUserData((prevData) => ({
          ...prevData,
          ...profileData,
        }));
      } else {
        console.warn('Failed to fetch user profile from API:', response.status);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    try {
      const loginDataStr = localStorage.getItem('loginData');
      const checkoutEmail = localStorage.getItem('checkoutEmail');

      if (loginDataStr) {
        const loginData = JSON.parse(loginDataStr);

        if (loginData && loginData.userId) {
          setIsAuthenticated(true);
          setUserData(loginData);

          // Set initial form data from localStorage
          setFormData((prev) => ({
            ...prev,
            name: `${loginData.firstName || ''} ${
              loginData.lastName || ''
            }`.trim(),
            email: checkoutEmail || loginData.email || '',
            address: loginData.address || prev.address,
            city: loginData.city || prev.city,
            postalCode: loginData.postalCode || prev.postalCode,
            country: loginData.country || prev.country,
          }));

          // Fetch complete profile data from API
          fetchUserProfile(loginData.userId);
        } else {
          setIsAuthenticated(false);

          if (checkoutEmail) {
            setFormData((prev) => ({
              ...prev,
              email: checkoutEmail,
            }));
          }
        }
      } else {
        setIsAuthenticated(false);

        if (checkoutEmail) {
          setFormData((prev) => ({
            ...prev,
            email: checkoutEmail,
          }));
        }
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
      localStorage.removeItem('checkoutEmail');
    }
  }, []);

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
  const total = subtotal + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated || !userData) {
      setError('Please log in to complete your purchase');
      localStorage.setItem('checkoutIntended', 'true');

      setTimeout(() => {
        router.push('/checkout/success');
      }, 1000);
      return;
    }

    if (!paymentConfirmed) {
      setError('Please confirm the payment by checking the box');
      return;
    }

    setLoading(true);

    try {
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
        customer: formData,
        total: total,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.userId}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error processing the checkout');
      }

      localStorage.setItem('badgeCart', JSON.stringify([]));

      const event = new Event('cartUpdated');
      window.dispatchEvent(event);

      router.push(`/success?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Error processing the purchase:', error);
      setError(
        error.message ||
          'There was an error processing your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <CircularProgress />
        <p className="ml-2">Checking session...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Complete purchase</h1>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Order summary</h2>

          <div className="border-t border-gray-200 py-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center py-4 border-b border-gray-200"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.badgeType && item.size && (
                    <p className="text-gray-500 mt-1">
                      {item.badgeType} • {item.size}
                    </p>
                  )}
                  <p className="text-gray-500 mt-1">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-medium">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>Taxes</p>
              <p className="font-medium">${tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <p className="font-semibold">Total</p>
              <p className="font-bold">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact information</h2>

          <form onSubmit={handleCheckout}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Payment method</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paymentConfirm"
                    checked={paymentConfirmed}
                    onChange={() => setPaymentConfirmed(!paymentConfirmed)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="paymentConfirm"
                    className="ml-2 text-sm text-gray-700"
                  >
                    I confirm that I will make the payment once the order is
                    processed
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {loading ? 'Processing...' : 'Complete order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
