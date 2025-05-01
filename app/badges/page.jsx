'use client';
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import FooterDesigner from '../../components/FooterDesigner';
import Drawer from '../../components/EditCard';
import BadgeTemplates from '../../components/BadgeTemplates';
import BadgeInfoMenu from '../../components/BadgeInfoMenu';
import BadgePreview from '../../components/BadgePreview';
import UploadBadgeDesign from '../../components/UploadBadgeDesign';
import EmployeeImageEditor from '../../components/EmployeeImageEditor';
import TextOptionsEditor from '../../components/TextOptionsEditor';
import SecurityOptionsEditor from '../../components/SecurityOptionsEditor';
import ShapeOptionsEditor from '../../components/ShapeOptionsEditor';
import AccessoriesEditor from '../../components/AccessoriesEditor';
import EmployeePhoto from '../../components/EmployeePhoto';
import LogoUploader from '../../components/LogoUploader';
import BackgroundImageUploader from '../../components/BackgroundImageUploader';
import downloadBadgeUtil from '../../utils/badgeDownloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTableCells,
  faIdCard,
  faPortrait,
  faTable,
  faFileUpload,
} from '@fortawesome/free-solid-svg-icons';
import MuiTooltip from '../../components/TooltipComponent';
import CardInformationSection from '../../components/CardInformationSection';

// Add MUI component imports
import {
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
// Import MUI icons
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import LoopIcon from '@mui/icons-material/Loop';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Add this import
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Import the new background generation services
import {
  generateGradientBackground,
  generatePatternBackground,
  generatePictureBackground,
} from '../../services/backgroundGenerationService';

// Import the new drawer components
import CardOptionsDrawer from '../../components/CardOptionsDrawer';
import TextOptionsDrawer from '../../components/TextOptionsDrawer';

// Create a theme with the brand color
const theme = createTheme({
  palette: {
    primary: {
      main: '#065388',
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#065388',
            color: 'white',
            '&:hover': {
              backgroundColor: '#054371',
              color: 'white',
            },
          },
        },
      },
    },
  },
});

const BadgeEditor = () => {
  const [name, setName] = useState('John Doe');
  const [title, setTitle] = useState('Software Engineer');
  const [idNumber, setIdNumber] = useState('ID-123456');
  const [company, setCompany] = useState('ACME Corporation');
  const [photo, setPhoto] = useState({
    url: 'https://randomuser.me/api/portraits/men/32.jpg',
    borderVisible: true,
    size: 128, // Add size in pixels
  });
  const [logo, setLogo] = useState('/images/logo_fast_id_white.svg');
  const [logoSize, setLogoSize] = useState(64);
  const [backgroundType, setBackgroundType] = useState('color');
  const [backgroundColor, setBackgroundColor] = useState('#0066cc');
  const [backgroundGradient, setBackgroundGradient] = useState({
    startColor: '#0066cc',
    endColor: '#00cc99',
    direction: '45deg',
  });
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');
  const [hasBorder] = useState(true);
  const [template, setTemplate] = useState('standard');
  const [orientation, setOrientation] = useState('portrait');
  const [activeTab, setActiveTab] = useState('info');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [backText, setBackText] = useState('');
  const [showBackside, setShowBackside] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [accessoryQuantities, setAccessoryQuantities] = useState({});
  const [editableAccessories, setEditableAccessories] = useState({}); // Nuevo estado para accesorios editables
  const [isEditMode, setIsEditMode] = useState(false); // Estado para controlar el modo de edición
  const [viewingSide, setViewingSide] = useState('front');
  const [qrValue, setQrValue] = useState('https://example.com');
  const [showQR, setShowQR] = useState(false);
  const [qrSide, setQrSide] = useState('front');
  const [qrSize, setQrSize] = useState(128);
  const [qrDraggable, setQrDraggable] = useState(false);
  const [frontQrPosition, setFrontQrPosition] = useState({ x: 50, y: 50 });
  const [backQrPosition, setBackQrPosition] = useState({ x: 50, y: 50 });
  const [fontFamily, setFontFamily] = useState('Arial');
  const [nameSize, setNameSize] = useState(18);
  const [titleSize, setTitleSize] = useState(14);
  const [idSize, setIdSize] = useState(12);
  const [nameColor, setNameColor] = useState('#ffffff');
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [idColor, setIdColor] = useState('#ffffff');
  const [quantity, setQuantity] = useState(1);
  const [photoBorderStyle, setPhotoBorderStyle] = useState('rounded');
  const [photoBorderColor, setPhotoBorderColor] = useState('#cccccc');
  const [customFrontBadge, setCustomFrontBadge] = useState(null);
  const [customBackBadge, setCustomBackBadge] = useState(null);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [aiGeneratedTemplates, setAiGeneratedTemplates] = useState([]);
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [barcodeSide, setBarcodeSide] = useState('front');
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeDraggable, setBarcodeDraggable] = useState(false);
  const [frontBarcodePosition, setFrontBarcodePosition] = useState({
    x: 50,
    y: 50,
  });
  const [backBarcodePosition, setBackBarcodePosition] = useState({
    x: 50,
    y: 50,
  });
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Impact', label: 'Impact' },
  ];
  const frontBadgeRef = useRef(null);
  const backBadgeRef = useRef(null);
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'corporate', name: 'Corporate' },
    { id: 'event', name: 'Event' },
    { id: 'education', name: 'Education' },
    { id: 'security', name: 'Security' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'patterns', name: 'Patterns' }, // New category added
    { id: 'custom', name: 'Custom' },
  ];
  const templates = [
    { id: 'standard', name: 'Standard', category: 'corporate' },
    { id: 'corporate', name: 'Corporate', category: 'corporate' },
    { id: 'minimal', name: 'Minimal', category: 'event' },
    { id: 'gradient', name: 'Gradient', category: 'education' },
    { id: 'striped', name: 'Striped', category: 'security' },
    { id: 'conference', name: 'Conference', category: 'event' },
    { id: 'school', name: 'School ID', category: 'education' },
    { id: 'hospital', name: 'Hospital Staff', category: 'healthcare' },
    { id: 'visitor', name: 'Visitor Pass', category: 'security' },
  ];

  const selectedTemplateObj = templates.find((t) => t.id === template);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto({ ...photo, url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFrontBadgeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomFrontBadge(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomBackBadgeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackBadge(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomFrontBadge = () => {
    setCustomFrontBadge(null);
  };

  const removeCustomBackBadge = () => {
    setCustomBackBadge(null);
  };

  const getBadgeBackground = () => {
    const aiTemplate = aiGeneratedTemplates.find((t) => t.id === template);

    if (aiTemplate) {
      if (
        aiTemplate.backgroundType === 'image' &&
        (aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage)
      ) {
        return aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage;
      }
      if (aiTemplate.colors && aiTemplate.colors.background) {
        return aiTemplate.colors.background;
      }
    }

    // If it has a custom image background, return it
    if (backgroundType === 'image' && backgroundImage) {
      // If it is a data URI for SVG, we need to format it correctly
      if (backgroundImage.startsWith('data:image/svg+xml')) {
        // Format for CSS, ensuring it starts with url()
        return `url("${backgroundImage}")`;
      }
      return backgroundImage; // For other non-SVG images
    } else if (backgroundType === 'gradient') {
      const { startColor, endColor, direction } = backgroundGradient;
      return direction === 'circle'
        ? `radial-gradient(circle, ${startColor}, ${endColor})`
        : `linear-gradient(${direction}, ${startColor}, ${endColor})`;
    } else if (backgroundType === 'color') {
      // For solid color backgrounds, define them according to the template
      switch (template) {
        case 'standard':
          return '#0066cc'; // Standard blue
        case 'corporate':
          return '#1a365d'; // Dark corporate blue
        case 'gradient':
          return `linear-gradient(45deg, ${backgroundColor}, #${Math.floor(
            Math.random() * 16777215
          ).toString(16)})`;
        case 'striped':
          return `repeating-linear-gradient(45deg, ${backgroundColor}, ${backgroundColor} 10px, ${textColor}22 10px, ${textColor}22 20px)`;
        case 'minimal':
          return 'white';
        case 'conference':
          return 'linear-gradient(to right, #ff7e5f, #feb47b)';
        case 'school':
          return 'linear-gradient(to right, #4776E6, #8E54E9)';
        case 'hospital':
          return 'linear-gradient(to right, #11998e, #38ef7d)';
        case 'visitor':
          return 'linear-gradient(to right, #f83600, #f9d423)';
        default:
          return backgroundColor;
      }
    }

    // Default value in case no previous condition matches
    return backgroundColor;
  };

  const downloadBadge = (side) => {
    const badgeElement =
      side === 'front' ? frontBadgeRef.current : backBadgeRef.current;

    if (!badgeElement) {
      console.error('Badge element not found');
      return;
    }

    downloadBadgeUtil(side, badgeElement, getBadgeBackground);
  };

  const getTextColorForTemplate = (baseColor) => {
    const aiTemplate = aiGeneratedTemplates.find((t) => t.id === template);
    if (aiTemplate && aiTemplate.colors && aiTemplate.colors.text) {
      return aiTemplate.colors.text;
    }

    if (template === 'minimal') {
      return '#333333';
    }

    return baseColor || textColor || '#ffffff';
  };

  const accessories = [
    {
      id: 'none',
      name: 'None',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      description: 'No accessories with this badge',
    },
    {
      id: 'clip',
      name: 'Badge Clip',
      image: '/images/products/accessories/vinyl-strap-clip-black.jpg',
      description: 'Standard badge clip',
    },
    {
      id: 'lanyard',
      name: 'Lanyard',
      image: '/images/products/accessories/standard-badge-reel-black.jpg',
      description: 'Neck lanyard',
    },
    {
      id: 'retractable',
      name: 'Retractable Reel',
      image: '/images/products/accessories/Retractable-Reel.jpg',
      description: 'Retractable ID holder',
    },
    {
      id: 'magnetic',
      name: 'Magnetic Holder',
      image: '/images/products/accessories/magnetic-holder.jpg',
      description: 'Magnetic attachment',
    },
  ];

  const samplePhotos = [
    {
      id: 'photo1',
      url: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Male 1',
    },
    {
      id: 'photo2',
      url: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Female 1',
    },
    {
      id: 'photo3',
      url: 'https://randomuser.me/api/portraits/men/86.jpg',
      name: 'Male 2',
    },
    {
      id: 'photo4',
      url: 'https://randomuser.me/api/portraits/women/63.jpg',
      name: 'Female 2',
    },
  ];

  const selectSamplePhoto = (url) => {
    setPhoto({ ...photo, url });
  };

  const [activeInfoSection, setActiveInfoSection] = useState('card');

  const infoSections = [
    {
      id: 'card',
      name: 'Card Options',
      icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    },
    {
      id: 'text',
      name: 'Text',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      id: 'images',
      name: 'Images',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      id: 'security',
      name: 'Security',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      id: 'shape',
      name: 'Shape',
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
    },
  ];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState('');
  const [drawerTitle, setDrawerTitle] = useState('');
  const [pricingData, setPricingData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Inicializar los accesorios editables con los valores originales
  useEffect(() => {
    const initialEditableAccessories = {};
    accessories.forEach((acc) => {
      initialEditableAccessories[acc.id] = {
        name: acc.name,
        description: acc.description,
      };
    });
    setEditableAccessories(initialEditableAccessories);
  }, []);

  // Función para actualizar el nombre o descripción de un accesorio
  const updateAccessoryText = (accId, field, value) => {
    setEditableAccessories((prev) => ({
      ...prev,
      [accId]: {
        ...prev[accId],
        [field]: value,
      },
    }));
  };

  // Función para activar/desactivar el modo de edición
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Modificamos la definición de accesorios para usar los valores editados cuando están disponibles
  const getDisplayAccessories = () => {
    return accessories.map((acc) => ({
      ...acc,
      name: editableAccessories[acc.id]?.name || acc.name,
      description: editableAccessories[acc.id]?.description || acc.description,
    }));
  };

  // Load saved configuration from localStorage on initial load
  useEffect(() => {
    const savedConfig = localStorage.getItem('badgeMakerConfig');

    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);

        // Restore all saved configuration values
        if (config.name) setName(config.name);
        if (config.title) setTitle(config.title);
        if (config.idNumber) setIdNumber(config.idNumber);
        if (config.company) setCompany(config.company);
        if (config.photo) setPhoto(config.photo);
        if (config.logo) setLogo(config.logo);
        if (config.logoSize) setLogoSize(config.logoSize);
        if (config.backgroundType) setBackgroundType(config.backgroundType);
        if (config.backgroundColor) setBackgroundColor(config.backgroundColor);
        if (config.backgroundGradient)
          setBackgroundGradient(config.backgroundGradient);
        if (config.backgroundImage) setBackgroundImage(config.backgroundImage);
        if (config.borderColor) setBorderColor(config.borderColor);
        if (config.template) setTemplate(config.template);
        if (config.orientation) setOrientation(config.orientation);
        if (config.selectedCategory)
          setSelectedCategory(config.selectedCategory);
        if (config.backText) setBackText(config.backText);
        if (config.showBackside) setShowBackside(config.showBackside);
        if (config.selectedAccessories)
          setSelectedAccessories(config.selectedAccessories);
        if (config.viewingSide) setViewingSide(config.viewingSide);
        if (config.qrValue) setQrValue(config.qrValue);
        if (config.showQR) setShowQR(config.showQR);
        if (config.qrSide) setQrSide(config.qrSide);
        if (config.qrSize) setQrSize(config.qrSize);
        if (config.qrDraggable) setQrDraggable(config.qrDraggable);
        if (config.frontQrPosition) setFrontQrPosition(config.frontQrPosition);
        if (config.backQrPosition) setBackQrPosition(config.backQrPosition);
        if (config.fontFamily) setFontFamily(config.fontFamily);
        if (config.nameSize) setNameSize(config.nameSize);
        if (config.titleSize) setTitleSize(config.titleSize);
        if (config.idSize) setIdSize(config.idSize);
        if (config.nameColor) setNameColor(config.nameColor);
        if (config.titleColor) setTitleColor(config.titleColor);
        if (config.idColor) setIdColor(config.idColor);
        if (config.photoBorderStyle)
          setPhotoBorderStyle(config.photoBorderStyle);
        if (config.photoBorderColor)
          setPhotoBorderColor(config.photoBorderColor);
        if (config.customFrontBadge)
          setCustomFrontBadge(config.customFrontBadge);
        if (config.customBackBadge) setCustomBackBadge(config.customBackBadge);

        // Restore barcode settings if they exist
        if (config.showBarcode !== undefined)
          setShowBarcode(config.showBarcode);
        if (config.barcodeValue) setBarcodeValue(config.barcodeValue);
        if (config.barcodeFormat) setBarcodeFormat(config.barcodeFormat);
        if (config.barcodeSide) setBarcodeSide(config.barcodeSide);
        if (config.barcodeWidth) setBarcodeWidth(config.barcodeWidth);
        if (config.barcodeHeight) setBarcodeHeight(config.barcodeHeight);
        if (config.barcodeDraggable)
          setBarcodeDraggable(config.barcodeDraggable);
        if (config.frontBarcodePosition)
          setFrontBarcodePosition(config.frontBarcodePosition);
        if (config.backBarcodePosition)
          setBackBarcodePosition(config.backBarcodePosition);

        console.log('Badge configuration restored from local storage');
      } catch (e) {
        console.error('Error restoring badge configuration:', e);
      }
    }

    // Other existing initialization code...
    const fetchPricingData = async () => {
      try {
        const response = await fetch('/data/pricing.json');
        const data = await response.json();
        setPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      }
    };

    fetchPricingData();

    // Load any saved AI templates
    const savedAiTemplates = localStorage.getItem('aiGeneratedTemplates');
    if (savedAiTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedAiTemplates);
        setAiGeneratedTemplates(parsedTemplates);
      } catch (e) {
        console.error('Failed to load saved AI templates', e);
      }
    }
  }, []);

  // Save current configuration to localStorage whenever relevant state changes
  useEffect(() => {
    // Create configuration object with all relevant badge properties
    const badgeConfig = {
      name,
      title,
      idNumber,
      company,
      photo,
      logo,
      logoSize,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundImage,
      borderColor,
      template,
      orientation,
      selectedCategory,
      backText,
      showBackside,
      selectedAccessories,
      viewingSide,
      qrValue,
      showQR,
      qrSide,
      qrSize,
      qrDraggable,
      frontQrPosition,
      backQrPosition,
      fontFamily,
      nameSize,
      titleSize,
      idSize,
      nameColor,
      titleColor,
      idColor,
      photoBorderStyle,
      photoBorderColor,
      customFrontBadge,
      customBackBadge,
      showBarcode,
      barcodeValue,
      barcodeFormat,
      barcodeSide,
      barcodeWidth,
      barcodeHeight,
      barcodeDraggable,
      frontBarcodePosition,
      backBarcodePosition,
    };

    // Save to localStorage
    localStorage.setItem('badgeMakerConfig', JSON.stringify(badgeConfig));
  }, [
    name,
    title,
    idNumber,
    company,
    photo,
    logo,
    logoSize,
    backgroundType,
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    borderColor,
    template,
    orientation,
    selectedCategory,
    backText,
    showBackside,
    selectedAccessories,
    viewingSide,
    qrValue,
    showQR,
    qrSide,
    qrSize,
    qrDraggable,
    frontQrPosition,
    backQrPosition,
    fontFamily,
    nameSize,
    titleSize,
    idSize,
    nameColor,
    titleColor,
    idColor,
    photoBorderStyle,
    photoBorderColor,
    customFrontBadge,
    customBackBadge,
    showBarcode,
    barcodeValue,
    barcodeFormat,
    barcodeSide,
    barcodeWidth,
    barcodeHeight,
    barcodeDraggable,
    frontBarcodePosition,
    backBarcodePosition,
  ]);

  // Add this new handler for background generation
  const handleBackgroundGeneration = async (type, prompt) => {
    try {
      let backgroundUrl;

      // Show loading notification
      const loadingNotification = document.createElement('div');
      loadingNotification.className =
        'fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-md bg-blue-100 text-blue-800';
      loadingNotification.textContent = `Generating ${
        type === 'gradient'
          ? 'gradient'
          : type === 'pattern'
          ? 'pattern'
          : 'image'
      }...`;
      document.body.appendChild(loadingNotification);

      switch (type) {
        case 'gradient':
          backgroundUrl = await generateGradientBackground(prompt);
          break;
        case 'pattern':
          backgroundUrl = await generatePatternBackground(prompt);
          break;
        case 'picture':
          backgroundUrl = await generatePictureBackground(prompt);
          break;
        default:
          document.body.removeChild(loadingNotification);
          return; // Do nothing for unknown types
      }

      // Remove loading notification
      document.body.removeChild(loadingNotification);

      // Important: Ensure to change the type first and then the URL
      setBackgroundType('image');
      setBackgroundImage(backgroundUrl);

      // Show success notification
      const successNotification = document.createElement('div');
      successNotification.className =
        'fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-md bg-green-100 text-green-800';
      successNotification.textContent = `${
        type === 'gradient'
          ? 'Gradient'
          : type === 'pattern'
          ? 'Pattern'
          : 'Image'
      } applied successfully!`;
      document.body.appendChild(successNotification);

      setTimeout(() => {
        document.body.removeChild(successNotification);
      }, 3000);

      console.log(
        `Background updated: type=${type}, backgroundType=image, URL length=${backgroundUrl.length}`
      );
    } catch (error) {
      console.error(`Error generating ${type} background:`, error);
      // Handle error, show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className =
        'fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-md bg-red-100 text-red-800';
      errorNotification.textContent = `Error generating ${
        type === 'gradient'
          ? 'gradient'
          : type === 'pattern'
          ? 'pattern'
          : 'image'
      }`;
      document.body.appendChild(errorNotification);

      setTimeout(() => {
        document.body.removeChild(errorNotification);
      }, 3000);
    }
  };

  const handleTemplateSelection = (templateId) => {
    console.log(`Selecting template: ${templateId}`);
    setTemplate(templateId);

    // Clear any custom badge images when selecting a template
    setCustomFrontBadge(null);
    setCustomBackBadge(null);

    // Update text colors based on the selected template
    let newTextColor = '#ffffff'; // Default color for dark backgrounds

    if (templateId === 'minimal') {
      newTextColor = '#333333';
    } else if (templateId === 'standard') {
      newTextColor = '#ffffff';
      // Also set the background color and type for standard
      setBackgroundType('color');
      setBackgroundColor('#0066cc');
    } else if (templateId === 'corporate') {
      newTextColor = '#ffffff';
      setBackgroundType('color');
      setBackgroundColor('#1a365d');
    }

    setNameColor(newTextColor);
    setTitleColor(newTextColor);
    setIdColor(newTextColor);

    // For AI templates, handle their specific settings
    const aiTemplate = aiGeneratedTemplates.find((t) => t.id === templateId);
    if (aiTemplate) {
      // Existing code for AI templates...
      if (aiTemplate.colors) {
        if (aiTemplate.colors.text) {
          // Update text colors based on the AI template's text color
          setNameColor(aiTemplate.colors.text);
          setTitleColor(aiTemplate.colors.text);
          setIdColor(aiTemplate.colors.text);
        }
      }

      // Set background type based on AI template
      if (aiTemplate.backgroundType) {
        setBackgroundType(aiTemplate.backgroundType);

        if (
          aiTemplate.backgroundType === 'image' &&
          (aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage)
        ) {
          setBackgroundImage(
            aiTemplate.suggestedImageUrl || aiTemplate.backgroundImage
          );
        }
      }
    }

    // Force a preview update
    setTimeout(() => {
      const previewElement = document.getElementById('badge-preview-container');
      if (previewElement) {
        previewElement.style.opacity = '0.99';
        setTimeout(() => {
          previewElement.style.opacity = '1';
        }, 50);
      }
    }, 100);
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch('/data/pricing.json');
        const data = await response.json();
        setPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      }
    };

    fetchPricingData();

    // Load any saved AI templates
    const savedAiTemplates = localStorage.getItem('aiGeneratedTemplates');
    if (savedAiTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedAiTemplates);
        setAiGeneratedTemplates(parsedTemplates);
      } catch (e) {
        console.error('Failed to load saved AI templates', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!pricingData) return;

    let pricePerBadge = pricingData.singleCardPrice;

    const currentTier = pricingData.tiers?.find(
      (tier) =>
        quantity >= tier.minQuantity &&
        (!tier.maxQuantity || quantity <= tier.maxQuantity)
    );

    if (currentTier) {
      pricePerBadge = currentTier.price;
    }

    let totalPrice = pricePerBadge * quantity;

    selectedAccessories.forEach((accId) => {
      if (pricingData.accessories[accId]) {
        const accessoryQuantity = accessoryQuantities[accId] || 1;
        totalPrice +=
          pricingData.accessories[accId] * quantity * accessoryQuantity;
      }
    });

    if (showBackside && pricingData.options.doubleSided) {
      totalPrice += pricingData.options.doubleSided * quantity;
    }

    if (showQR && pricingData.options.qrCode) {
      totalPrice += pricingData.options.qrCode * quantity;
    }

    setTotalPrice(totalPrice);
  }, [
    pricingData,
    selectedAccessories,
    accessoryQuantities,
    showBackside,
    showQR,
    quantity,
  ]);

  useEffect(() => {
    if (selectedAccessories.length > 0) {
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [selectedAccessories]);

  const toggleAccessory = (accessoryId) => {
    if (accessoryId === 'none') {
      setSelectedAccessories([]);
      setAccessoryQuantities({});
    } else if (selectedAccessories.includes(accessoryId)) {
      setSelectedAccessories(
        selectedAccessories.filter((id) => id !== accessoryId)
      );
      setAccessoryQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        delete newQuantities[accessoryId];
        return newQuantities;
      });
    } else {
      const newSelection = [...selectedAccessories, accessoryId];
      setSelectedAccessories(newSelection);
      setAccessoryQuantities((prevQuantities) => ({
        ...prevQuantities,
        [accessoryId]: 1,
      }));
    }
  };

  const updateAccessoryQuantity = (accessoryId, newQuantity) => {
    console.log(`Updating quantity for ${accessoryId} to ${newQuantity}`);
    setAccessoryQuantities((prevQuantities) => ({
      ...prevQuantities,
      [accessoryId]: newQuantity,
    }));
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const openDrawer = (content, title) => {
    setDrawerContent(content);
    setDrawerTitle(title);
    setIsDrawerOpen(true);
  };

  const addToCart = () => {
    const badgeId = `badge_${Date.now()}`;

    const pricePerBadge = totalPrice / quantity;

    const badgeItem = {
      id: badgeId,
      name: name || 'Custom Badge',
      badgeType: template || 'Standard',
      size: orientation || 'Standard',
      imageUrl: '/placeholder-badge.png',
      options: {
        title: title || '',
        fontFamily,
        showQR,
        showBackside,
        orientation,
        selectedAccessories: selectedAccessories.map((accId) => {
          const acc = accessories.find((a) => a.id === accId);
          return {
            id: acc.id,
            name: acc.name,
            quantity: accessoryQuantities[acc.id] || 1,
            price: pricingData?.accessories[acc.id] || 0,
          };
        }),
      },
      quantity: quantity,
      price: pricePerBadge,
      totalPrice: totalPrice,
    };

    const existingCart = JSON.parse(localStorage.getItem('badgeCart') || '[]');

    existingCart.push(badgeItem);

    localStorage.setItem('badgeCart', JSON.stringify(existingCart));

    setShowCartNotification(true);

    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  const handleFrontQrPositionChange = (newPosition) => {
    setFrontQrPosition(newPosition);
  };

  const handleBackQrPositionChange = (newPosition) => {
    setBackQrPosition(newPosition);
  };

  const handleFrontBarcodePositionChange = (newPosition) => {
    setFrontBarcodePosition(newPosition);
  };

  const handleBackBarcodePositionChange = (newPosition) => {
    setBackBarcodePosition(newPosition);
  };

  const handleTextClick = (fieldType, param) => {
    // Don't open drawer for photo update operations
    if (
      fieldType === 'updatePhoto' ||
      fieldType === 'updatePhotoBorderStyle' ||
      fieldType === 'updatePhotoBorderColor' ||
      fieldType === 'updatePhotoBorderVisibility' ||
      fieldType === 'updatePhotoSize' ||
      fieldType === 'removePhoto'
    ) {
      // Handle photo updates without opening drawer
      if (fieldType === 'updatePhoto') {
        // For removal (param is null), set URL to null but keep other properties
        if (param === null) {
          setPhoto({ ...photo, url: null });
        } else {
          setPhoto({ ...photo, url: param });
        }
      } else if (fieldType === 'updatePhotoBorderStyle' && param) {
        setPhotoBorderStyle(param);
      } else if (fieldType === 'updatePhotoBorderColor' && param) {
        setPhotoBorderColor(param);
      } else if (fieldType === 'updatePhotoBorderVisibility') {
        setPhoto({ ...photo, borderVisible: param });
      } else if (fieldType === 'updatePhotoSize' && param) {
        setPhoto({ ...photo, size: param });
      } else if (fieldType === 'removePhoto') {
        setPhoto({ ...photo, url: null });
      }

      return;
    }

    // Don't open drawer for logo update operations
    if (
      fieldType === 'updateLogo' ||
      fieldType === 'uploadLogo' ||
      fieldType === 'updateLogoSize' ||
      fieldType === 'removeLogo'
    ) {
      // Handle logo updates without opening drawer
      if (fieldType === 'updateLogo' || fieldType === 'uploadLogo') {
        setLogo(param);
      } else if (fieldType === 'updateLogoSize' && param) {
        setLogoSize(param);
      } else if (fieldType === 'removeLogo') {
        setLogo(null);
      }

      return;
    }

    // Handle text field updates directly from the drawer
    if (fieldType === 'updateName') {
      setName(param);
      return;
    }

    if (fieldType === 'updateTitle') {
      setTitle(param);
      return;
    }

    if (fieldType === 'updateId') {
      setIdNumber(param);
      return;
    }

    if (fieldType === 'updateCompany') {
      setCompany(param);
      return;
    }

    if (fieldType === 'updateBackText') {
      setBackText(param);
      return;
    }

    if (fieldType === 'updateNameSize') {
      setNameSize(param);
      return;
    }

    if (fieldType === 'updateTitleSize') {
      setTitleSize(param);
      return;
    }

    if (fieldType === 'updateIdSize') {
      setIdSize(param);
      return;
    }

    if (fieldType === 'updateNameColor') {
      setNameColor(param);
      return;
    }

    if (fieldType === 'updateTitleColor') {
      setTitleColor(param);
      return;
    }

    if (fieldType === 'updateIdColor') {
      setIdColor(param);
      return;
    }

    if (fieldType === 'updateFontFamily') {
      setFontFamily(param);
      return;
    }

    // For other cases, switch to the info tab for editing
    // Switch to the info tab for editing
    setActiveTab('info');
    setActiveInfoSection('card');

    // Open the card options drawer
    setDrawerContent('card');
    setDrawerTitle(
      viewingSide === 'front' ? 'CARD OPTIONS' : 'BACKSIDE OPTIONS'
    );
    setIsDrawerOpen(true);

    // For mobile: scroll to the relevant input
    setTimeout(() => {
      // Find the relevant input field by creating a selector
      const selector =
        viewingSide === 'front'
          ? fieldType === 'name'
            ? 'input[value="' + name + '"]'
            : fieldType === 'title'
            ? 'input[value="' + title + '"]'
            : fieldType === 'id'
            ? 'input[value="' + idNumber + '"]'
            : fieldType === 'company'
            ? 'input[value="' + company + '"]'
            : null
          : 'textarea';

      if (selector) {
        const inputElement = document.querySelector(selector);
        if (inputElement) {
          inputElement.focus();
          inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 300); // Small delay to allow drawer to open
  };

  const renderCardOptions = () => (
    <CardOptionsEditor
      viewingSide={viewingSide}
      name={name}
      setName={setName}
      title={title}
      setTitle={setTitle}
      company={company}
      setCompany={setCompany}
      idNumber={idNumber}
      setIdNumber={setIdNumber}
      backText={backText}
      setBackText={setBackText}
      showBackside={showBackside}
      setShowBackside={setShowBackside}
      setViewingSide={setViewingSide}
    />
  );

  const renderTextOptions = () => (
    <TextOptionsEditor
      fontFamily={fontFamily}
      setFontFamily={setFontFamily}
      nameSize={nameSize}
      setNameSize={setNameSize}
      titleSize={titleSize}
      setTitleSize={setTitleSize}
      idSize={idSize}
      setIdSize={setIdSize}
      nameColor={nameColor}
      setNameColor={setNameColor}
      titleColor={titleColor}
      setTitleColor={setTitleColor}
      idColor={idColor}
      setIdColor={setIdColor}
      name={name}
      title={title}
      idNumber={idNumber}
      fontOptions={fontOptions}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <div
        className={`fixed top-10 right-10 z-50 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 shadow-lg flex items-center transform transition-all duration-300 ${
          showNotification && selectedAccessories.length > 0
            ? 'translate-y-0 opacity-100'
            : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
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
          {selectedAccessories.length === 1 ? (
            <>
              <strong>
                {
                  accessories.find((acc) => acc.id === selectedAccessories[0])
                    ?.name
                }
              </strong>
              {' added to your badge order'}
            </>
          ) : (
            <>
              <strong>{selectedAccessories.length} accessories</strong>
              {' added to your badge order'}
            </>
          )}
        </span>
      </div>
      <div
        className={`fixed top-10 right-10 z-50 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg border border-blue-200 shadow-lg flex items-center transform transition-all duration-300 ${
          showCartNotification
            ? 'translate-y-0 opacity-100'
            : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
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
          <strong>ID Badge added to cart!</strong>
        </span>
      </div>

      <div className="bg-white rounded-lg p-4 pt-3 -mt-2">
        {isEditMode && (
          <div className="bg-yellow-100 text-yellow-800 p-2 text-center mb-4 rounded-md">
            <strong>Modo de edición activado</strong> - Ahora puede editar los
            nombres y descripciones de los accesorios.
          </div>
        )}

        <div className="shadow-sm bg-white sticky top-16 z-20">
          <div className="flex relative">
            <div className="flex-1 flex flex-wrap md:flex-nowrap">
              <button
                className={`px-2 sm:px-4 md:px-6 py-3 font-medium text-sm md:text-base lg:text-lg flex-1 relative transition-all duration-200 cursor-pointer ${
                  activeTab === 'templates'
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                  <FontAwesomeIcon
                    icon={faTableCells}
                    className="h-5 w-5 mb-1 sm:mb-0 sm:mr-1.5"
                  />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="whitespace-nowrap">Templates</span>
                    <span className="text-xs opacity-75 -mt-0.5 hidden sm:block">
                      Choose a design
                    </span>
                  </div>
                </span>
                {activeTab === 'templates' && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></span>
                )}
              </button>
              <button
                className={`px-2 sm:px-4 md:px-6 py-3 font-medium text-sm md:text-base lg:text-lg flex-1 relative transition-all duration-200 cursor-pointer ${
                  activeTab === 'info'
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('info')}
              >
                <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="h-5 w-5 mb-1 sm:mb-0 sm:mr-1.5"
                  />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="whitespace-nowrap">ID Maker</span>
                    <span className="text-xs opacity-75 -mt-0.5 hidden sm:block">
                      Customize your badge
                    </span>
                  </div>
                </span>
                {activeTab === 'info' && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></span>
                )}
              </button>
              <button
                className={`px-2 sm:px-4 md:px-6 py-3 font-medium text-sm md:text-base lg:text-lg flex-1 relative transition-all duration-200 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveTab('upload');
                  setShowUploadSection(true);
                }}
              >
                <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center">
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="h-5 w-5 mb-1 sm:mb-0 sm:mr-1.5"
                  />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="whitespace-nowrap">Upload</span>
                    <span className="text-xs opacity-75 -mt-0.5 hidden sm:block">
                      Your own design
                    </span>
                  </div>
                </span>
                {activeTab === 'upload' && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></span>
                )}
              </button>
            </div>

            <div className="hidden md:flex bg-green-700 py-2.5 px-4 rounded-t-md ml-auto items-center">
              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mr-2"></div>
              <p className="text-xs font-medium text-white">
                Display is an approximate preview. Final printed badge may vary.
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-200 w-full"></div>

          {/* Mobile preview notice */}
          <div className="md:hidden bg-green-700/90 py-2 px-3 text-center">
            <p className="text-xs font-medium text-white flex items-center justify-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5 inline-block"></span>
              Preview is approximate
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="col-span-2 space-y-6">
            {activeTab === 'templates' && (
              <BadgeTemplates
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                templates={templates}
                selectedTemplate={template}
                setSelectedTemplate={setTemplate}
                onSelectTemplate={handleTemplateSelection}
                aiGeneratedTemplates={aiGeneratedTemplates}
                setAiGeneratedTemplates={setAiGeneratedTemplates}
                onBackgroundGenerate={handleBackgroundGeneration} // Add this new prop
              />
            )}

            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3 mb-8">
                  <h2 className="text-xl font-bold">UPLOAD YOUR OWN DESIGN</h2>
                  <p className="text-sm text-gray-600">
                    Upload your custom badge designs and use them as templates.
                  </p>
                </div>

                <UploadBadgeDesign
                  showBackside={showBackside}
                  setShowBackside={setShowBackside}
                  customFrontBadge={customFrontBadge}
                  customBackBadge={customBackBadge}
                  handleCustomFrontBadgeUpload={handleCustomFrontBadgeUpload}
                  handleCustomBackBadgeUpload={handleCustomBackBadgeUpload}
                  removeCustomFrontBadge={removeCustomFrontBadge}
                  removeCustomBackBadge={removeCustomBackBadge}
                />

                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Tips for Custom Designs
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-blue-700">
                    <li className="flex items-start">
                      <ChevronLeftIcon
                        className="h-5 w-5 mr-1.5 text-blue-700"
                        fontSize="small"
                      />
                      Use high-resolution images (at least 300 DPI) for the best
                      print quality. Supported formats: JPG, PNG, SVG, PDF (max
                      5MB)
                    </li>
                    <li className="flex items-start">
                      <ChevronLeftIcon
                        className="h-5 w-5 mr-1.5 text-blue-700"
                        fontSize="small"
                      />
                      Make sure your design includes all necessary information
                    </li>
                    <li className="flex items-start">
                      <ChevronLeftIcon
                        className="h-5 w-5 mr-1.5 text-blue-700"
                        fontSize="small"
                      />
                      Allow for a 1/8 inch (3mm) bleed around the edges if you
                      have elements that extend to the edge
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-3">
                  {/* Mobile controls - stacked layout with improved visual cues */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <ToggleButtonGroup
                      value={viewingSide}
                      exclusive
                      onChange={(e, newValue) => {
                        if (newValue !== null) {
                          setViewingSide(newValue);
                        }
                      }}
                      aria-label="Badge side"
                      className="shadow-sm w-full sm:w-auto"
                      color="primary"
                      size="small"
                    >
                      <ToggleButton
                        value="front"
                        aria-label="front side"
                        style={{ minWidth: '120px', padding: '8px 16px' }}
                      >
                        <CreditCardIcon fontSize="small" sx={{ mr: 1 }} />
                        Front Side
                      </ToggleButton>
                      {showBackside && (
                        <ToggleButton
                          value="back"
                          aria-label="back side"
                          style={{ minWidth: '120px', padding: '8px 16px' }}
                        >
                          <FlipToBackIcon fontSize="small" sx={{ mr: 1 }} />
                          Back Side
                        </ToggleButton>
                      )}
                    </ToggleButtonGroup>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={showBackside}
                          onChange={() => {
                            setShowBackside(!showBackside);
                            if (!showBackside) setViewingSide('front');
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <div className="flex items-center text-gray-800 text-sm">
                          <LoopIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Include backside
                        </div>
                      }
                      className="px-3 py-0.5 rounded-md border border-gray-200 w-full sm:w-auto justify-center bg-gray-50 hover:bg-gray-100 transition-colors ml-0"
                    />
                  </div>

                  {/* Layout controls with improved mobile handling */}
                  <div className="flex items-center w-full md:w-auto">
                    <ToggleButtonGroup
                      value={orientation}
                      exclusive
                      onChange={(e, newValue) => {
                        if (newValue !== null) {
                          setOrientation(newValue);
                        }
                      }}
                      aria-label="Badge orientation"
                      className="w-full md:w-auto"
                      color="primary"
                      size="small"
                    >
                      <ToggleButton
                        value="portrait"
                        aria-label="portrait orientation"
                        style={{ minWidth: '100px', padding: '8px 16px' }}
                      >
                        <FontAwesomeIcon
                          icon={faPortrait}
                          className="h-4 w-4 mr-1.5"
                        />
                        <span className="text-sm font-medium">Portrait</span>
                      </ToggleButton>
                      <ToggleButton
                        value="landscape"
                        aria-label="landscape orientation"
                        style={{ minWidth: '100px', padding: '8px 16px' }}
                      >
                        <FontAwesomeIcon
                          icon={faTable}
                          className="h-4 w-4 mr-1.5"
                        />
                        <span className="text-sm font-medium">Landscape</span>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                </div>

                {/* Additional mobile helper text - shows on small screens only */}
                <div className="block md:hidden bg-blue-50 text-blue-700 p-2 rounded-md text-xs border border-blue-100 mb-4">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <strong>Quick Tip:</strong> Use the buttons above to
                      switch between sides and change your badge orientation.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <BadgeInfoMenu
                    infoSections={infoSections}
                    activeInfoSection={activeInfoSection}
                    setActiveInfoSection={setActiveInfoSection}
                    isDrawerOpen={isDrawerOpen}
                    setIsDrawerOpen={setIsDrawerOpen}
                  />

                  <div className="flex-1">
                    {activeInfoSection === 'card' && (
                      <CardInformationSection
                        viewingSide={viewingSide}
                        name={name}
                        title={title}
                        company={company}
                        idNumber={idNumber}
                        backText={backText}
                        showBackside={showBackside}
                        openDrawer={openDrawer}
                      />
                    )}

                    {activeInfoSection === 'text' && (
                      <div>
                        <div className="border-l-4 border-blue-500 pl-3 mb-4">
                          <h2 className="text-gray-900 text-xl font-bold">
                            TEXT OPTIONS
                          </h2>
                          <p className="text-sm text-gray-900">
                            Customize the text appearance on your badge.
                          </p>
                        </div>

                        <TextOptionsEditor
                          fontFamily={fontFamily}
                          setFontFamily={setFontFamily}
                          nameSize={nameSize}
                          setNameSize={setNameSize}
                          titleSize={titleSize}
                          setTitleSize={setTitleSize}
                          idSize={idSize}
                          setIdSize={setIdSize}
                          nameColor={nameColor}
                          setNameColor={setNameColor}
                          titleColor={titleColor}
                          setTitleColor={setTitleColor}
                          idColor={idColor}
                          setIdColor={setIdColor}
                          name={name}
                          title={title}
                          idNumber={idNumber}
                          fontOptions={fontOptions}
                        />
                      </div>
                    )}

                    {activeInfoSection === 'images' && (
                      <div>
                        <div className="border-l-4 border-blue-500 pl-3 mb-4">
                          <h2 className="text-xl font-bold">IMAGES OPTIONS</h2>
                          <p className="text-sm text-gray-600">
                            Manage the images for your badge, including photo
                            and logo.
                          </p>
                        </div>

                        <UploadBadgeDesign
                          showBackside={showBackside}
                          setShowBackside={setShowBackside}
                          showUploadSection={showUploadSection}
                          setShowUploadSection={setShowUploadSection}
                          customFrontBadge={customFrontBadge}
                          customBackBadge={customBackBadge}
                          handleCustomFrontBadgeUpload={
                            handleCustomFrontBadgeUpload
                          }
                          handleCustomBackBadgeUpload={
                            handleCustomBackBadgeUpload
                          }
                          removeCustomFrontBadge={removeCustomFrontBadge}
                          removeCustomBackBadge={removeCustomBackBadge}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <EmployeeImageEditor
                            photo={photo.url}
                            setPhoto={(newUrl) =>
                              setPhoto({ ...photo, url: newUrl })
                            }
                            photoBorderStyle={photoBorderStyle}
                            handlePhotoUpload={handlePhotoUpload}
                            samplePhotos={samplePhotos}
                            selectSamplePhoto={selectSamplePhoto}
                          />

                          <EmployeePhoto
                            photoUrl={photo.url}
                            onPhotoChange={(newUrl) =>
                              setPhoto({ ...photo, url: newUrl })
                            }
                            photoBorderStyle={photoBorderStyle}
                            setPhotoBorderStyle={setPhotoBorderStyle}
                            photoBorderColor={photoBorderColor}
                            setPhotoBorderColor={setPhotoBorderColor}
                            borderVisible={photo.borderVisible}
                            setBorderVisible={(val) =>
                              setPhoto({ ...photo, borderVisible: val })
                            }
                            photoSize={photo.size}
                            setPhotoSize={(newSize) =>
                              setPhoto({ ...photo, size: newSize })
                            }
                          />

                          <LogoUploader
                            logoUrl={logo}
                            onLogoChange={setLogo}
                            logoSize={logoSize}
                            setLogoSize={setLogoSize}
                          />
                        </div>
                      </div>
                    )}

                    {activeInfoSection === 'security' && (
                      <div>
                        <div className="border-l-4 border-blue-500 pl-3 mb-4">
                          <h2 className="text-xl font-bold">
                            SECURITY OPTIONS
                          </h2>
                          <p className="text-sm text-gray-600">
                            Configure security features for your badge.
                          </p>
                        </div>

                        <SecurityOptionsEditor
                          showQR={showQR}
                          setShowQR={setShowQR}
                          qrValue={qrValue}
                          setQrValue={setQrValue}
                          qrSide={qrSide}
                          setQrSide={setQrSide}
                          qrSize={qrSize}
                          setQrSize={setQrSize}
                          qrDraggable={qrDraggable}
                          setQrDraggable={setQrDraggable}
                          showBarcode={showBarcode}
                          setShowBarcode={setShowBarcode}
                          barcodeValue={barcodeValue}
                          setBarcodeValue={setBarcodeValue}
                          barcodeFormat={barcodeFormat}
                          setBarcodeFormat={setBarcodeFormat}
                          barcodeSide={barcodeSide}
                          setBarcodeSide={setBarcodeSide}
                          barcodeWidth={barcodeWidth}
                          setBarcodeWidth={setBarcodeWidth}
                          barcodeHeight={barcodeHeight}
                          setBarcodeHeight={setBarcodeHeight}
                          barcodeDraggable={barcodeDraggable}
                          setBarcodeDraggable={setBarcodeDraggable}
                        />
                      </div>
                    )}

                    {activeInfoSection === 'shape' && (
                      <div>
                        <div className="border-l-4 border-blue-500 pl-3 mb-4">
                          <h2 className="text-xl font-bold">SHAPE OPTIONS</h2>
                          <p className="text-sm text-gray-600">
                            Customize the shape and appearance of your badge.
                          </p>
                        </div>

                        <ShapeOptionsEditor
                          photo={photo.url}
                          photoBorderStyle={photoBorderStyle}
                          setPhotoBorderStyle={setPhotoBorderStyle}
                          borderColor={borderColor}
                          setBorderColor={setBorderColor}
                          orientation={orientation}
                          setOrientation={setOrientation}
                          getBadgeBackground={getBadgeBackground}
                          getTextColorForTemplate={getTextColorForTemplate}
                          textColor={textColor}
                        />

                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">
                            Background Options
                          </h3>
                          <BackgroundImageUploader
                            backgroundType={backgroundType}
                            setBackgroundType={setBackgroundType}
                            backgroundColor={backgroundColor}
                            setBackgroundColor={setBackgroundColor}
                            backgroundGradient={backgroundGradient}
                            setBackgroundGradient={setBackgroundGradient}
                            backgroundImage={backgroundImage}
                            setBackgroundImage={setBackgroundImage}
                          />
                        </div>
                      </div>
                    )}

                    {activeInfoSection === 'accessories' && (
                      <div>
                        <div className="border-l-4 border-blue-500 pl-3 mb-4">
                          <h2 className="text-xl font-bold">
                            BADGE ACCESSORIES
                          </h2>
                        </div>

                        <AccessoriesEditor
                          accessories={getDisplayAccessories()}
                          selectedAccessories={selectedAccessories}
                          toggleAccessory={toggleAccessory}
                          pricingData={pricingData}
                          accessoryQuantities={accessoryQuantities}
                          updateAccessoryQuantity={updateAccessoryQuantity}
                          isEditMode={isEditMode}
                          updateAccessoryText={updateAccessoryText}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <BadgePreview
            viewingSide={viewingSide}
            setViewingSide={setViewingSide}
            showBackside={showBackside}
            frontBadgeRef={frontBadgeRef}
            backBadgeRef={backBadgeRef}
            orientation={orientation}
            getBadgeBackground={getBadgeBackground}
            getTextColorForTemplate={getTextColorForTemplate}
            textColor={textColor}
            hasBorder={hasBorder}
            borderColor={borderColor}
            fontFamily={fontFamily}
            logo={logo}
            logoSize={logoSize}
            template={template}
            company={company}
            photo={photo}
            photoBorderStyle={photoBorderStyle}
            photoBorderColor={photoBorderColor}
            nameSize={nameSize}
            nameColor={nameColor}
            name={name}
            titleSize={titleSize}
            titleColor={titleColor}
            title={title}
            idSize={idSize}
            idColor={idColor}
            idNumber={idNumber}
            showQR={showQR}
            qrSide={qrSide}
            qrValue={qrValue}
            qrSize={qrSize}
            qrDraggable={qrDraggable}
            frontQrPosition={frontQrPosition}
            backQrPosition={backQrPosition}
            onFrontQrPositionChange={handleFrontQrPositionChange}
            onBackQrPositionChange={handleBackQrPositionChange}
            showBarcode={showBarcode}
            barcodeValue={barcodeValue}
            barcodeFormat={barcodeFormat}
            barcodeSide={barcodeSide}
            barcodeWidth={barcodeWidth}
            barcodeHeight={barcodeHeight}
            barcodeDraggable={barcodeDraggable}
            frontBarcodePosition={frontBarcodePosition}
            backBarcodePosition={backBarcodePosition}
            onFrontBarcodePositionChange={handleFrontBarcodePositionChange}
            onBackBarcodePositionChange={handleBackBarcodePositionChange}
            backText={backText}
            downloadBadge={downloadBadge}
            addToCart={addToCart}
            customFrontBadge={customFrontBadge}
            customBackBadge={customBackBadge}
            onTextClick={handleTextClick}
          />

          <BadgePreview
            viewingSide={viewingSide}
            setViewingSide={setViewingSide}
            showBackside={showBackside}
            frontBadgeRef={frontBadgeRef}
            backBadgeRef={backBadgeRef}
            orientation={orientation}
            getBadgeBackground={getBadgeBackground}
            getTextColorForTemplate={getTextColorForTemplate}
            textColor={textColor}
            hasBorder={hasBorder}
            borderColor={borderColor}
            fontFamily={fontFamily}
            logo={logo}
            logoSize={logoSize}
            template={template}
            company={company}
            photo={photo}
            photoBorderStyle={photoBorderStyle}
            photoBorderColor={photoBorderColor}
            nameSize={nameSize}
            nameColor={nameColor}
            name={name}
            titleSize={titleSize}
            titleColor={titleColor}
            title={title}
            idSize={idSize}
            idColor={idColor}
            idNumber={idNumber}
            showQR={showQR}
            qrSide={qrSide}
            qrValue={qrValue}
            qrSize={qrSize}
            qrDraggable={qrDraggable}
            frontQrPosition={frontQrPosition}
            backQrPosition={backQrPosition}
            onFrontQrPositionChange={handleFrontQrPositionChange}
            onBackQrPositionChange={handleBackQrPositionChange}
            showBarcode={showBarcode}
            barcodeValue={barcodeValue}
            barcodeFormat={barcodeFormat}
            barcodeSide={barcodeSide}
            barcodeWidth={barcodeWidth}
            barcodeHeight={barcodeHeight}
            barcodeDraggable={barcodeDraggable}
            frontBarcodePosition={frontBarcodePosition}
            backBarcodePosition={backBarcodePosition}
            onFrontBarcodePositionChange={handleFrontBarcodePositionChange}
            onBackBarcodePositionChange={handleBackBarcodePositionChange}
            backText={backText}
            downloadBadge={downloadBadge}
            isMobile={true}
            customFrontBadge={customFrontBadge}
            customBackBadge={customBackBadge}
            onTextClick={handleTextClick}
          />
        </div>
      </div>
      <div className="h-40"></div>
      <div className="h-16"></div>

      <FooterDesigner
        badgeInfo={{ name, title, company, idNumber }}
        quantity={quantity}
        accessories={accessories}
        selectedAccessories={selectedAccessories}
        template={selectedTemplateObj?.name || template}
        fontFamily={fontFamily}
        showQR={showQR}
        showBackside={showBackside}
        orientation={orientation}
        pricingData={pricingData}
        totalPrice={totalPrice}
        onQuantityChange={handleQuantityChange}
        addToCart={addToCart}
      />

      <CardOptionsDrawer
        isOpen={isDrawerOpen && drawerContent === 'card'}
        onClose={() => setIsDrawerOpen(false)}
        viewingSide={viewingSide}
        setViewingSide={setViewingSide}
        name={name}
        setName={setName}
        title={title}
        setTitle={setTitle}
        company={company}
        setCompany={setCompany}
        idNumber={idNumber}
        setIdNumber={setIdNumber}
        backText={backText}
        setBackText={setBackText}
        showBackside={showBackside}
        setShowBackside={setShowBackside}
      />

      <TextOptionsDrawer
        isOpen={isDrawerOpen && drawerContent === 'text'}
        onClose={() => setIsDrawerOpen(false)}
        fieldType={viewingSide === 'front' ? 'name' : 'backText'}
        text={viewingSide === 'front' ? name : backText}
        updateText={(text) =>
          viewingSide === 'front' ? setName(text) : setBackText(text)
        }
        fontFamily={fontFamily}
        updateFontFamily={setFontFamily}
        fontSize={nameSize}
        updateFontSize={setNameSize}
        fontColor={nameColor}
        updateFontColor={setNameColor}
        fontOptions={fontOptions}
      />
    </ThemeProvider>
  );
};

export default BadgeEditor;
