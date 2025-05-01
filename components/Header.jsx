'use client';

import React, { useState, useRef, useEffect, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItemText,
  Divider,
  ListItemIcon,
  Box,
  ListItemButton,
  Collapse,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Tooltip, // Added missing Tooltip import
} from '@mui/material';
import {
  FaPhoneAlt,
  FaIdCard,
  FaUser,
  FaBars,
  FaTag,
  FaUserTag,
  FaCreditCard,
  FaInfoCircle,
  FaDollarSign,
  FaAngleDown,
  FaAngleUp,
  FaTools,
} from 'react-icons/fa';
import styles from './Header.module.css';
import ProductMenu from './ProductMenu';
import CartButton from './CartButton';
import SearchBar from './SearchBar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchors, setMenuAnchors] = useState({});
  const [logoData, setLogoData] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('1-888-960-2123'); // Default as fallback

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        if (!baseUrl) {
          console.error(
            'NEXT_PUBLIC_STRAPI_API_URL is not defined in environment variables'
          );
          setLogoLoading(false);
          return;
        }

        const endpoint = '/api/headers';
        const queryParams = new URLSearchParams({
          'populate[media][populate]': '*',
          'populate[phone][populate]': '*',
        });

        const fullUrl = `${baseUrl}${endpoint}?${queryParams}`;
        console.log('Fetching header data from:', fullUrl);

        const response = await fetch(fullUrl);
        console.log('Header response status:', response.status);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Header API response:', result);

        // Extract data from response
        const data = result.data || [];

        // Find logo data (usually in the first item or with name "Logo Section")
        const logoItem =
          data.find((item) => item.name === 'Logo Section') || data[0];
        if (logoItem && logoItem.media?.picture) {
          setLogoData(logoItem.media.picture);
          console.log('Logo data:', logoItem.media.picture);
        } else {
          console.warn('No logo media found in response');
        }

        // Find phone data (in item with name "Phone")
        const phoneItem = data.find((item) => item.name === 'Phone');
        if (phoneItem && phoneItem.phone && phoneItem.phone.phone) {
          setPhoneNumber(phoneItem.phone.phone);
          console.log('Phone data:', phoneItem.phone.phone);
        } else {
          console.warn('No phone data found in response');
        }
      } catch (err) {
        console.error('Failed to fetch header data:', err);
        setLogoError(err.message);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        if (!baseUrl) {
          console.error(
            'NEXT_PUBLIC_STRAPI_API_URL is not defined in environment variables'
          );
          setLoading(false);
          return;
        }

        const endpoint = '/api/sections';
        const queryParams = new URLSearchParams({
          populate: 'links',
        });

        const response = await fetch(`${baseUrl}${endpoint}?${queryParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch menu data');
        }

        const data = await response.json();
        if (data && data.data) {
          setMenuSections(data.data);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileProducts = () => {
    setMobileProductsOpen(!mobileProductsOpen);
  };

  const defaultProductItems = [
    {
      name: 'ID Badges',
      icon: <FaIdCard className="mr-2 text-gray-500" />,
      href: '/badges',
    },
    {
      name: 'Event Badges',
      icon: <FaUserTag className="mr-2 text-gray-500" />,
      href: '/event-badges',
    },
    {
      name: 'Name Tags',
      icon: <FaTag className="mr-2 text-gray-500" />,
      href: '/name-tags',
    },
    {
      name: 'Access Cards',
      icon: <FaCreditCard className="mr-2 text-gray-500" />,
      href: '/access-cards',
    },
    {
      name: 'Accessories',
      icon: <FaTools className="mr-2 text-gray-500" />,
      href: '/accessories',
    },
  ];

  const getProductItems = () => {
    if (loading || menuSections.length === 0) {
      return defaultProductItems;
    }

    const productsSection = menuSections.find(
      (section) =>
        section.attributes?.heading === 'PRODUCTS' ||
        section.heading === 'PRODUCTS' ||
        section.attributes?.heading === 'PRODUCT' ||
        section.heading === 'PRODUCT'
    );

    if (productsSection) {
      const links = productsSection.links || productsSection.attributes?.links;

      if (links && links.length > 0) {
        return links.map((link) => ({
          name: link.name,
          icon: getIconForLink(link.name),
          href: link.url,
          description: link.description,
        }));
      }
    }

    return defaultProductItems;
  };

  const getIconForLink = (name) => {
    const iconMap = {
      'ID Badges': <FaIdCard className="mr-2 text-gray-500" />,
      'Event Badges': <FaUserTag className="mr-2 text-gray-500" />,
      'Name Tags': <FaTag className="mr-2 text-gray-500" />,
      'Access Cards': <FaCreditCard className="mr-2 text-gray-500" />,
      Accessories: <FaTools className="mr-2 text-gray-500" />,
      'How It Works': <FaInfoCircle className="mr-2 text-gray-500" />,
      Pricing: <FaDollarSign className="mr-2 text-gray-500" />,
      'ID Badge Maker': <FaIdCard className="mr-2 text-gray-500" />,
    };

    return iconMap[name] || <FaInfoCircle className="mr-2 text-gray-500" />;
  };

  const handleMenuClick = (sectionId, event) => {
    setMenuAnchors((prev) => ({
      ...prev,
      [sectionId]: event.currentTarget,
    }));
  };

  const handleMenuClose = (sectionId) => {
    setMenuAnchors((prev) => ({
      ...prev,
      [sectionId]: null,
    }));
  };

  const getMobileMenuSections = () => {
    if (loading || menuSections.length === 0) {
      return null;
    }

    return menuSections.map((section) => {
      const heading = section.attributes?.heading || section.heading;

      if (heading !== 'PRODUCTS' && heading !== 'PRODUCT') {
        const links = section.links || section.attributes?.links;

        if (links && links.length > 0) {
          return (
            <div key={section.id}>
              {links.map((link, idx) => (
                <Fragment key={idx}>
                  <ListItemButton component="a" href={link.url}>
                    <ListItemIcon>{getIconForLink(link.name)}</ListItemIcon>
                    <ListItemText
                      primary={link.name}
                      secondary={link.description ? link.description : null}
                    />
                  </ListItemButton>
                  <Divider />
                </Fragment>
              ))}
            </div>
          );
        }
      }
      return null;
    });
  };

  const renderDesktopMenuItems = () => {
    if (loading) {
      return (
        <>
          <Button color="inherit" className={styles.buttonBase} disabled>
            Loading...
          </Button>
        </>
      );
    }

    return menuSections.map((section) => {
      const sectionId = section.id;
      const sectionHeading = section.attributes?.heading || section.heading;
      const links = section.attributes?.links || section.links || [];

      if (sectionHeading === 'PRODUCTS' || sectionHeading === 'PRODUCT') {
        return null;
      }

      if (links.length === 1) {
        const link = links[0];
        return (
          <Button
            key={sectionId}
            color="inherit"
            href={link.url}
            startIcon={getIconForLink(link.name)}
            className={styles.buttonBase}
          >
            {link.name}
          </Button>
        );
      }

      if (links.length > 1) {
        const openState = Boolean(menuAnchors[sectionId]);
        const menuId = `menu-${sectionId}`;

        return (
          <React.Fragment key={sectionId}>
            <Button
              color="inherit"
              id={`${menuId}-button`}
              aria-controls={openState ? menuId : undefined}
              aria-haspopup="true"
              aria-expanded={openState ? 'true' : undefined}
              onClick={(e) => handleMenuClick(sectionId, e)}
              endIcon={<FaAngleDown />}
              className={styles.buttonBase}
            >
              {sectionHeading}
            </Button>
            <Menu
              id={menuId}
              anchorEl={menuAnchors[sectionId]}
              open={openState}
              onClose={() => handleMenuClose(sectionId)}
              MenuListProps={{
                'aria-labelledby': `${menuId}-button`,
              }}
            >
              {links.map((link, idx) => (
                <MenuItem
                  key={idx}
                  component={Link}
                  href={link.url}
                  onClick={() => handleMenuClose(sectionId)}
                >
                  <ListItemIcon>{getIconForLink(link.name)}</ListItemIcon>
                  <ListItemText
                    primary={link.name}
                    secondary={link.description ? link.description : null}
                  />
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        );
      }

      return null;
    });
  };

  const productItems = getProductItems();

  return (
    <>
      <AppBar color="default" elevation={0} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Link href="/" className="flex items-center">
            {logoLoading ? (
              // Show skeleton or default during loading - responsive size
              <Box
                sx={{
                  width: { xs: '150px', sm: '180px', md: '230px' },
                  height: { xs: '35px', sm: '40px', md: '50px' },
                  bgcolor: 'grey.200',
                }}
                className="animate-pulse"
              />
            ) : logoError || !logoData ? (
              // Fallback to default logo if error or no data - responsive size
              <Box sx={{ maxWidth: { xs: '150px', sm: '180px', md: '230px' } }}>
                <Image
                  src="/images/logo_fast_id.svg"
                  alt="Company Logo"
                  width={230}
                  height={(230 * 80) / 250} // Maintain aspect ratio
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
            ) : (
              // Display the fetched logo with responsive sizing
              <Box sx={{ maxWidth: { xs: '150px', sm: '180px', md: '230px' } }}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${logoData.url}`}
                  alt={logoData.alternativeText || 'Miller Square Logo'}
                  width={Math.min(logoData.width || 230, 230)}
                  height={
                    logoData.height
                      ? (Math.min(logoData.width, 230) * logoData.height) /
                        logoData.width
                      : 50
                  }
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
            )}
          </Link>
          <div className={styles.flexGrow} />
          <div className={styles.desktopMenu}>
            <ProductMenu />
            {renderDesktopMenuItems()}
            <Button
              component="a"
              href={`tel:${phoneNumber}`}
              color="primary"
              variant="outlined"
              startIcon={<FaPhoneAlt />}
              className={styles.phoneButton}
            >
              {phoneNumber}
            </Button>
          </div>
          <SearchBar />
          {!isDesktop && (
            <Tooltip title="Call">
              <IconButton
                color="inherit"
                href={`tel:${phoneNumber}`}
                aria-label="call"
                className={`${styles.iconButton} ${styles.mobileOnly}`}
              >
                <FaPhoneAlt />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              href="/account"
              aria-label="account"
              className={styles.iconButton}
            >
              <FaUser />
            </IconButton>
          </Tooltip>
          <CartButton />
          <IconButton
            color="inherit"
            edge="end"
            onClick={toggleMobileMenu}
            aria-label="menu"
            className={`${styles.iconButton} ${styles.mobileMenuButton}`}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              marginLeft: '8px',
              fontSize: '1.25rem',
            }}
          >
            <FaBars />
          </IconButton>
        </Toolbar>
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          className="lg:hidden"
          slotProps={{
            paper: {
              className: styles.mobileDrawerPaper,
            },
          }}
        >
          <Box className={styles.drawerHeader}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleMobileMenu}>
              <FaBars />
            </IconButton>
          </Box>
          <List className={styles.drawerList}>
            <ListItemButton onClick={toggleMobileProducts}>
              <ListItemIcon>
                <FaIdCard />
              </ListItemIcon>
              <ListItemText primary="Products" />
              {mobileProductsOpen ? <FaAngleUp /> : <FaAngleDown />}
            </ListItemButton>
            <Collapse in={mobileProductsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {productItems.map((item, index) => (
                  <ListItemButton
                    key={index}
                    sx={{ pl: 4 }}
                    component="a"
                    href={item.href}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={item.description ? item.description : null}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Divider />
            {getMobileMenuSections()}
            <ListItemButton component="a" href="/account">
              <ListItemIcon>
                <FaUser />
              </ListItemIcon>
              <ListItemText primary="My Account" />
            </ListItemButton>
            <Divider />
            <ListItemButton component="a" href="/cart">
              <CartButton isMobileMenu={true} />
              <ListItemText primary="Shopping Cart" />
            </ListItemButton>
          </List>
          <SearchBar isMobile={true} />
        </Drawer>
      </AppBar>
      <Box className={styles.spacer} />
    </>
  );
}
