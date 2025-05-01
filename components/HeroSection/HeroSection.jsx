'use client';

import Image from 'next/image';
import React from 'react';
import { Fade, IconButton, Box, Stack } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useSwipeable } from 'react-swipeable';
// Import API_URL from config
import { API_URL } from '../../app/config';

export default function HeroSection() {
  const [heroData, setHeroData] = React.useState(null);
  const [buttons, setButtons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [pictures, setPictures] = React.useState([]);

  React.useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Simplified API endpoint construction
        const endpoint = `${
          API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL
        }/informations?filters[documentId][$eq]=r6l0rdr6fqtnqjc84ws9f1d0&populate[hero][populate]=*`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Get the banner component (contains title, subtitle, etc.)
        const bannerComponent =
          data.data[0]?.hero?.find(
            (item) => item.__component === 'banners.banners'
          ) || null;

        // Get all button components
        const buttonComponents =
          data.data[0]?.hero?.filter(
            (item) => item.__component === 'banners.buttons'
          ) || [];

        setHeroData(bannerComponent);
        setButtons(buttonComponents);

        // Process images: if picture is an array, use it; otherwise create an array with the single image
        let imageArray = [];
        if (bannerComponent?.picture) {
          if (Array.isArray(bannerComponent.picture)) {
            imageArray = bannerComponent.picture;
          } else {
            imageArray = [bannerComponent.picture];
          }
        }

        setPictures(imageArray);
      } catch (err) {
        console.error('Error fetching hero data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentImageIndex((prev) => (prev + 1) % pictures.length);
    },
    onSwipedRight: () => {
      setCurrentImageIndex((prev) =>
        prev === 0 ? pictures.length - 1 : prev - 1
      );
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
    delta: 10,
    swipeDuration: 500,
  });

  // Image slider auto-rotation with MUI fade effect
  React.useEffect(() => {
    if (pictures.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % pictures.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [pictures]);

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-[#0a4275] to-[#1565c0] text-white py-20">
        <div className="container mx-auto px-8 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-r from-[#0a4275] to-[#1565c0] text-white py-20">
        <div className="container mx-auto px-8 text-center">
          <p>Error loading content: {error}</p>
        </div>
      </section>
    );
  }

  // Button style classes
  const getButtonClass = (style) => {
    switch (style) {
      case 'secondary':
        return 'bg-gradient-to-r from-[#b91c1c] to-[#dc2626] hover:from-[#9b1c1c] hover:to-[#c92626] text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 border border-white';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-[#065388] to-[#0c6cb7] hover:from-[#054677] hover:to-[#0a5a9e] text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 border border-white';
    }
  };

  // ImageSlider component with MUI fade transition
  const ImageSlider = () => {
    if (pictures.length === 0) {
      return null;
    }

    return (
      <Box
        {...swipeHandlers}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 320, sm: 350, md: 400, lg: 480 },
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 6,
          mx: 'auto',
          maxWidth: { xs: '90%', md: '100%' },
          touchAction: 'pan-y',
        }}
      >
        {pictures.map((pic, index) => (
          <Fade
            key={index}
            in={index === currentImageIndex}
            timeout={{ enter: 800, exit: 500 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${pic.url}`}
                alt={pic.alternativeText || `Image ${index + 1}`}
                fill
                className="object-contain sm:object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 90vw, 50vw"
                quality={85}
              />
            </Box>
          </Fade>
        ))}

        {/* Navigation dots with MUI styling - adjusted for better mobile visibility */}
        <Stack
          direction="row"
          spacing={2} // Increased spacing for touch targets
          sx={{
            position: 'absolute',
            bottom: { xs: 12, sm: 16 }, // Slightly higher on mobile
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 10,
            padding: { xs: '8px 12px', sm: '6px 10px' }, // Larger touch area
          }}
        >
          {pictures.map((_, index) => (
            <FiberManualRecordIcon
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              sx={{
                fontSize: { xs: 16, sm: 12 }, // Larger on mobile for better touch targets
                color:
                  index === currentImageIndex
                    ? 'white'
                    : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'rgba(255,255,255,0.8)',
                },
              }}
            />
          ))}
        </Stack>

        {/* Left/Right navigation arrows with MUI components - enlarged for mobile */}
        {pictures.length > 1 && (
          <>
            <IconButton
              onClick={() => {
                setCurrentImageIndex((prev) =>
                  prev === 0 ? pictures.length - 1 : prev - 1
                );
              }}
              sx={{
                position: 'absolute',
                left: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.4)', // Darker for better visibility
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.6)',
                },
                zIndex: 10,
                padding: { xs: 1.5, sm: 1.5 }, // Larger touch target on mobile
                display: { xs: 'flex' }, // Ensure it's always visible
                width: { xs: 36, sm: 40 }, // Larger size on mobile
                height: { xs: 36, sm: 40 }, // Larger size on mobile
              }}
              aria-label="Previous image"
              size="large" // Larger size for mobile
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => {
                setCurrentImageIndex((prev) => (prev + 1) % pictures.length);
              }}
              sx={{
                position: 'absolute',
                right: { xs: 4, sm: 8 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.4)', // Darker for better visibility
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.6)',
                },
                zIndex: 10,
                padding: { xs: 1.5, sm: 1.5 }, // Larger touch target on mobile
                display: { xs: 'flex' }, // Ensure it's always visible
                width: { xs: 36, sm: 40 }, // Larger size on mobile
                height: { xs: 36, sm: 40 }, // Larger size on mobile
              }}
              aria-label="Next image"
              size="large" // Larger size for mobile
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    );
  };

  return (
    <section className="bg-gradient-to-r from-[#0a4275] to-[#1565c0] text-white py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center">
        {/* Text content - stacked on mobile, side-by-side on desktop */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
          {heroData?.tittle && (
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {heroData.tittle}
            </h1>
          )}
          {heroData?.subtitle && (
            <p className="text-xl mb-8">{heroData.subtitle}</p>
          )}
          {heroData?.subtitle2 && (
            <p className="text-lg italic mb-8">{heroData.subtitle2}</p>
          )}
          {buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              {buttons.map((button) => (
                <a
                  key={button.id}
                  href={`/${button.url}`}
                  className={getButtonClass(button.style)}
                >
                  {button.tittle}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Image slider - full width on mobile */}
        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <ImageSlider />
        </div>
      </div>
    </section>
  );
}
