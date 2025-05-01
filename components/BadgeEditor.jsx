'use client';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import Header from '../components/Header';
import FooterDesigner from '../components/FooterDesigner';
import Drawer from '../components/Drawer';
import TierPricing from '../components/TierPricing';
import './BadgeEditor.css'; // Import the new CSS file

const BadgeEditor = () => {
  // Basic info states
  const [name, setName] = useState('John Doe');
  const [title, setTitle] = useState('Software Engineer');
  const [idNumber, setIdNumber] = useState('ID-123456');
  const [company, setCompany] = useState('ACME Corporation');
  const [photo, setPhoto] = useState(
    'https://randomuser.me/api/portraits/men/32.jpg'
  ); // Default to the first sample photo
  const [logo, setLogo] = useState('/images/logo_fast_id_white.svg'); // Default to the white version of the header logo

  // Design states
  const [backgroundColor, setBackgroundColor] = useState('#0066cc');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');
  const [hasBorder, setHasBorder] = useState(true);

  // Add missing states needed by FooterDesigner
  const [quantity, setQuantity] = useState(1);
  const [badgeImage, setBadgeImage] = useState(null);
  const [showCartNotification, setShowCartNotification] = useState(false);

  // Add price state with a default value
  const [totalPrice, setTotalPrice] = useState(10);

  // Assuming these variables exist elsewhere in your component
  const activeTab = 'templates'; // Update with your actual state
  const setActiveTab = () => {}; // Update with your actual function
  const selectedAccessory = []; // Update with your actual state
  const accessories = []; // Update with your actual array
  const template = 'Standard'; // Update with your actual state
  const fontFamily = 'Arial'; // Update with your actual state
  const showQR = false; // Update with your actual state
  const showBackside = false; // Update with your actual state
  const orientation = 'portrait'; // Update with your actual state
  const pricingData = null; // Update with your actual state/data
  const isDrawerOpen = false; // Update with your actual state
  const setIsDrawerOpen = () => {}; // Update with your actual function
  const drawerTitle = ''; // Update with your actual state
  const drawerContent = ''; // Update with your actual state
  const renderCardOptions = () => {}; // Update with your actual function

  // Handle quantity change function
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  // Handle price change from TierPricing component
  const handlePriceChange = (newPrice) => {
    setTotalPrice(newPrice);
  };

  // Custom add to cart function if needed
  const handleAddToCart = () => {
    if (!badgeImage) {
      // Try to capture image first if not already available
      captureImage();
    }

    // Create a unique ID for the badge
    const badgeId = `badge_${Date.now()}`;

    // Price per badge is already calculated in the TierPricing component
    const pricePerBadge = totalPrice / quantity;

    // Create the badge object with all relevant info
    const badgeItem = {
      id: badgeId,
      name: name || 'Custom Badge',
      badgeType: template || 'Standard',
      size: orientation || 'Standard',
      imageUrl: badgeImage || '/placeholder-badge.png',
      options: {
        title: title || '',
        company: company || '',
        idNumber: idNumber || '',
        fontFamily,
        showQR,
        showBackside,
        orientation,
        selectedAccessories: selectedAccessory.map((accId) => {
          const acc = accessories.find((a) => a.id === accId) || {};
          return {
            id: accId,
            name: acc.name || '',
            price: 0, // Add actual price if available
          };
        }),
      },
      quantity: quantity,
      price: pricePerBadge,
      totalPrice: totalPrice || 0,
    };

    // Get existing cart from localStorage or create empty array
    const existingCart = JSON.parse(localStorage.getItem('badgeCart') || '[]');

    // Add new badge to cart
    existingCart.push(badgeItem);

    // Save updated cart to localStorage
    localStorage.setItem('badgeCart', JSON.stringify(existingCart));

    console.log('Badge added to cart:', badgeItem);
    console.log('Current cart:', existingCart);

    // Show notification
    setShowCartNotification(true);

    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  // Capture badge image for preview
  const captureImage = async () => {
    try {
      const badgeElement = document.getElementById('badge-preview');
      if (badgeElement) {
        const canvas = await html2canvas(badgeElement);
        setBadgeImage(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      console.error('Failed to capture badge image:', error);
    }
  };

  // Capture badge image on initial load and when relevant properties change
  useEffect(() => {
    captureImage();
  }, [
    name,
    title,
    company,
    photo,
    template,
    fontFamily,
    orientation,
    showQR,
    showBackside,
  ]);

  return (
    <>
      <Header>
        <div className="header-logo">
          <img
            src="/images/logo_fast_id.svg"
            alt="Fast ID Logo"
            className="logo-image"
          />
        </div>
      </Header>
      <div className="editor-container">
        <h1 className="editor-title">Professional ID Badge Creator</h1>

        <div className="editor-content">
          {/* Navigation Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${
                activeTab === 'templates' ? 'active-tab' : ''
              }`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button
              className={`tab-button ${
                activeTab === 'info' ? 'active-tab' : ''
              }`}
              onClick={() => setActiveTab('info')}
            >
              Badge Info
            </button>
          </div>

          {/* Add Tier Pricing Component */}
          <TierPricing
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onPriceChange={handlePriceChange}
          />
        </div>
      </div>

      <div className="footer-spacing"></div>

      {/* Replace AccessoryFooter with FooterDesigner and pass all required props */}
      <FooterDesigner
        selectedAccessories={selectedAccessory || []}
        accessories={accessories || []}
        badgeInfo={{
          name,
          company,
          title,
        }}
        template={template}
        fontFamily={fontFamily}
        showQR={showQR}
        showBackside={showBackside}
        orientation={orientation}
        pricingData={pricingData}
        totalPrice={totalPrice}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        badgeImage={badgeImage}
        addToCart={handleAddToCart}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerTitle}
      >
        {drawerContent === 'card' && renderCardOptions()}
      </Drawer>
    </>
  );
};

export default BadgeEditor;
