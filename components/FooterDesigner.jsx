'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import QuoteRequestDrawer from './QuoteRequestDrawer';

const FooterDesigner = ({
  selectedAccessories,
  accessories,
  badgeInfo,
  template,
  fontFamily,
  showQR,
  showBackside,
  orientation,
  pricingData: externalPricingData,
  totalPrice,
  quantity: externalQuantity = 1,
  onQuantityChange,
  addToCart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [cartNotificationMessage, setCartNotificationMessage] = useState('');
  const [internalPricingData, setInternalPricingData] = useState(null);
  const pricingData = externalPricingData || internalPricingData;

  useEffect(() => {
    const fetchPricingData = async () => {
      if (externalPricingData) return;

      try {
        const response = await fetch('/data/pricing.json');
        if (!response.ok) {
          throw new Error('Failed to fetch pricing data');
        }
        const data = await response.json();
        setInternalPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      }
    };

    fetchPricingData();
  }, [externalPricingData]);

  const [internalQuantity, setInternalQuantity] = useState(externalQuantity);
  const { setCartQuantity } = useCart();
  const quantity = onQuantityChange ? externalQuantity : internalQuantity;

  useEffect(() => {
    try {
      if (quantity) {
        setCartQuantity(quantity);
      }
    } catch (error) {
      console.error('Failed to sync cart quantity:', error);
    }
  }, [quantity, setCartQuantity]);

  useEffect(() => {
    setInternalQuantity(externalQuantity);
  }, [externalQuantity]);

  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(1, newQuantity);

    try {
      setCartQuantity(validQuantity);
      console.log('Cart quantity set to:', validQuantity);

      const cartUpdatedEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartUpdatedEvent);
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }

    if (onQuantityChange) {
      onQuantityChange(validQuantity);
    } else {
      setInternalQuantity(validQuantity);
    }
  };

  const selectedAccessoryDetails = selectedAccessories
    .map((accId) => accessories.find((acc) => acc.id === accId))
    .filter(Boolean);

  const getCurrentTier = () => {
    if (!pricingData || !pricingData.tiers) return null;

    return pricingData.tiers.find(
      (tier) =>
        quantity >= tier.minQuantity &&
        (!tier.maxQuantity || quantity <= tier.maxQuantity)
    );
  };

  const currentTier = getCurrentTier();

  const calculateTotalPrice = () => {
    if (!pricingData) return 0;

    if (totalPrice !== undefined) return totalPrice;

    const pricePerCard = currentTier?.price || pricingData.singleCardPrice;
    let calculatedTotal = pricePerCard * quantity;

    if (showBackside && pricingData.options?.doubleSided) {
      calculatedTotal += pricingData.options.doubleSided * quantity;
    }

    if (selectedAccessoryDetails.length > 0) {
      calculatedTotal += selectedAccessoryDetails.reduce((total, acc) => {
        // Verificar si hay información de cantidad en el accesorio
        const accQuantity = acc.quantity || 1;
        return (
          total +
          (pricingData?.accessories[acc.id] || 0) * quantity * accQuantity
        );
      }, 0);
    }

    if (showQR && pricingData.options?.qrCode) {
      calculatedTotal += pricingData.options.qrCode * quantity;
    }

    return calculatedTotal;
  };

  const displayedTotalPrice = calculateTotalPrice();

  const handleCartAction = () => {
    try {
      if (typeof window !== 'undefined') {
        const badgeToAdd = {
          id: `badge-${Date.now()}`,
          name: badgeInfo?.name || 'Custom Badge',
          price: displayedTotalPrice / quantity,
          quantity: quantity,
          imageUrl: badgeInfo?.photo || '/images/badge sample.jpg',
          badgeType: template || 'Standard',
          size: 'Standard',
          customizations: {
            quantity: quantity,
            text: badgeInfo?.name || '',
            color: 'Standard',
            size: 'Standard',
          },
          showQR: showQR || false,
          showBackside: showBackside || false,
          orientation: orientation || 'portrait',
          selectedAccessories: selectedAccessories || [],
        };

        const savedCart = localStorage.getItem('badgeCart') || '[]';
        const existingCart = JSON.parse(savedCart);

        const existingProductIndex = existingCart.findIndex(
          (item) =>
            item.name === badgeToAdd.name &&
            item.badgeType === badgeToAdd.badgeType &&
            item.showQR === badgeToAdd.showQR &&
            item.showBackside === badgeToAdd.showBackside &&
            item.orientation === badgeToAdd.orientation &&
            JSON.stringify(item.selectedAccessories) ===
              JSON.stringify(badgeToAdd.selectedAccessories)
        );

        let updatedCart;
        if (existingProductIndex !== -1) {
          updatedCart = [...existingCart];
          updatedCart[existingProductIndex].quantity += quantity;
        } else {
          updatedCart = [...existingCart, badgeToAdd];
        }

        localStorage.setItem('badgeCart', JSON.stringify(updatedCart));

        const badgeText = quantity === 1 ? 'badge' : 'badges';
        setCartNotificationMessage(
          `${quantity} ${badgeText} added to the cart`
        );

        setShowCartNotification(true);

        const totalQuantity = updatedCart.reduce(
          (total, item) => total + (item.quantity || 1),
          0
        );
        setCartQuantity(totalQuantity);

        const cartUpdatedEvent = new CustomEvent('cartUpdated');
        window.dispatchEvent(cartUpdatedEvent);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const openQuoteDrawer = () => {
    setIsQuoteDrawerOpen(true);
  };

  const closeQuoteDrawer = () => {
    setIsQuoteDrawerOpen(false);
  };

  useEffect(() => {
    let timer;
    if (showCartNotification) {
      timer = setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCartNotification]);

  if (!pricingData) {
    return (
      <footer className="bg-gray-800 text-white sticky bottom-0 z-10">
        <div className="container mx-auto px-1 py-4 text-center">
          <p>Loading pricing information...</p>
        </div>
      </footer>
    );
  }

  return (
    <>
      {showCartNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 shadow-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>{cartNotificationMessage}</strong>
            </span>
          </div>
          <button
            onClick={() => setShowCartNotification(false)}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {pricingData && selectedAccessories && (
        <QuoteRequestDrawer
          isOpen={isQuoteDrawerOpen}
          onClose={closeQuoteDrawer}
          badgeInfo={{
            name: badgeInfo?.name || 'Custom Badge',
            title: badgeInfo?.title || '',
            company: badgeInfo?.company || '',
            ...badgeInfo,
          }}
          template={template || 'Standard'}
          fontFamily={fontFamily || 'Default'}
          showQR={showQR || false}
          showBackside={showBackside || false}
          orientation={orientation || 'portrait'}
          quantity={quantity || 1}
          selectedAccessories={
            Array.isArray(selectedAccessoryDetails)
              ? selectedAccessoryDetails
              : []
          }
          totalPrice={displayedTotalPrice || 0}
        />
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-30">
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <div className="text-gray-700">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex border rounded-md mt-1">
                    <button
                      onClick={() =>
                        handleQuantityChange(Math.max(1, quantity - 1))
                      }
                      className="px-3 py-1 border-r"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-16 text-center py-1 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-1 border-l"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-gray-700">
                    <span className="font-medium">Template:</span>
                    <p className="mt-1">{template}</p>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="text-gray-700">
                    <span className="font-medium">Options:</span>
                    <p className="mt-1 text-sm">
                      {showBackside && (
                        <span className="mr-2">Double-sided,</span>
                      )}
                      {showQR && <span className="mr-2">QR Code,</span>}
                      {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3"
              style={{ marginRight: '100px' }}
            >
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Price:</div>
                  <div className="text-2xl font-bold text-blue-700">
                    ${displayedTotalPrice.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openQuoteDrawer}
                    className="text-blue-600 border border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1.5 group-hover:animate-pulse duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Request Quote
                  </button>
                  <button
                    onClick={handleCartAction}
                    className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 text-white py-2 px-6 rounded-md font-medium transition-all duration-200 flex items-center group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 transform group-hover:animate-bounce duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 font-medium flex items-center text-sm focus:outline-none hover:text-blue-800 transition"
            >
              <span>{isExpanded ? 'Hide' : 'Show'} Order Details</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-1 transition-transform duration-200 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div
            className={`overflow-auto transition-all duration-300 ${
              isExpanded ? 'max-h-[80vh] mt-4' : 'max-h-0'
            }`}
          >
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Order Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Badge Details
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-left">
                      <span className="text-gray-600">Badge Type:</span>
                      <span className="font-medium">
                        {badgeInfo?.type || 'N/A'}
                      </span>
                    </li>
                    <li className="flex justify-left">
                      <span className="text-gray-600">Layout:</span>
                      <span className="font-medium">
                        {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                      </span>
                    </li>
                    <li className="flex justify-left">
                      <span className="text-gray-600">Font:</span>
                      <span className="font-medium">
                        {fontFamily || 'Default'}
                      </span>
                    </li>
                    <li className="flex justify-left">
                      <span className="text-gray-600">Double-sided:</span>
                      <span className="font-medium">
                        {showBackside ? 'Yes' : 'No'}
                      </span>
                    </li>
                    <li className="flex justify-left">
                      <span className="text-gray-600">QR Code:</span>
                      <span className="font-medium">
                        {showQR ? 'Yes' : 'No'}
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Pricing Tiers
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-3 text-left border border-gray-200">
                              Quantity
                            </th>
                            <th className="py-2 px-3 text-left border border-gray-200">
                              Price Per Badge
                            </th>
                            <th className="py-2 px-3 text-left border border-gray-200">
                              Discount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricingData?.tiers?.map((tier, index) => {
                            const basePrice = pricingData.singleCardPrice;
                            const discountPercentage = basePrice
                              ? Math.round(
                                  ((basePrice - tier.price) / basePrice) * 100
                                )
                              : 0;

                            return (
                              <tr
                                key={index}
                                className={
                                  currentTier?.minQuantity === tier.minQuantity
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50'
                                }
                              >
                                <td className="py-2 px-3 border border-gray-200">
                                  {tier.maxQuantity
                                    ? `${tier.minQuantity} - ${tier.maxQuantity}`
                                    : `${tier.minQuantity}+`}
                                  {currentTier?.minQuantity ===
                                    tier.minQuantity && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 border border-gray-200">
                                  ${tier.price.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 border border-gray-200 text-green-600 font-medium">
                                  {discountPercentage > 0
                                    ? `-${discountPercentage}%`
                                    : '0%'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pricing</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">
                        $
                        {(
                          (currentTier?.price ||
                            pricingData?.singleCardPrice ||
                            0) * quantity
                        ).toFixed(2)}
                      </span>
                    </li>

                    {showBackside && pricingData?.options?.doubleSided > 0 && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">Double-sided:</span>
                        <span className="font-medium">
                          +$
                          {(pricingData.options.doubleSided * quantity).toFixed(
                            2
                          )}
                        </span>
                      </li>
                    )}

                    {showQR && pricingData?.options?.qrCode > 0 && (
                      <li className="flex justify-between">
                        <span className="text-gray-600">QR Code:</span>
                        <span className="font-medium">
                          +${(pricingData.options.qrCode * quantity).toFixed(2)}
                        </span>
                      </li>
                    )}

                    {selectedAccessoryDetails.length > 0 && (
                      <>
                        {selectedAccessoryDetails.map((acc) => (
                          <li key={acc.id} className="flex justify-between">
                            <span className="text-gray-600">{acc.name}:</span>
                            <span className="font-medium">
                              +$
                              {(
                                (pricingData?.accessories[acc.id] || 0) *
                                quantity
                              ).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </>
                    )}

                    <li className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="text-gray-800 font-medium">Total:</span>
                      <span className="font-bold text-blue-600">
                        ${displayedTotalPrice.toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {currentTier && (
                <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                  <div className="font-medium">Volume Discount Applied!</div>
                  <div>
                    You're getting the{' '}
                    {currentTier.name || `Tier ${currentTier.minQuantity}+`}{' '}
                    price of ${currentTier.price.toFixed(2)} per badge
                  </div>
                </div>
              )}

              <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="text-green-800 font-medium text-base">
                      Need a larger quantity?
                    </h4>
                    <p className="text-green-700 text-sm">
                      For orders of 100+ badges or special requirements, request
                      a custom quote to receive our best pricing.
                    </p>
                    <div className="mt-1 text-sm text-green-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Potential for additional savings beyond standard pricing
                    </div>
                  </div>
                  <button
                    onClick={openQuoteDrawer}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center group hover:shadow-md"
                  >
                    Get Custom Quote
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterDesigner;
