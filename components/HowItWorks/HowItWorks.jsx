import React, { useEffect, useState, useMemo } from 'react';
import { FaIdBadge, FaPrint } from 'react-icons/fa';
import { FaPalette } from 'react-icons/fa6';
import Image from 'next/image';
// Import API_URL from config
import { API_URL } from '../../app/config';

const HowItWorks = () => {
  // Style configurations with direct color values for SVGs
  const styles = {
    primary: {
      section: 'bg-gradient-to-r from-blue-50 to-blue-100',
      heading: 'text-gray-800',
      subheading: 'text-gray-700',
      iconColor: '#3b82f6', // Blue color for SVGs
      card: 'bg-white',
      cardText: 'text-gray-800',
      cardDesc: 'text-gray-600',
      shadow: 'shadow-sm hover:shadow-md',
    },
    secondary: {
      section: 'bg-gradient-to-r from-purple-50 to-purple-100',
      heading: 'text-gray-800',
      subheading: 'text-gray-700',
      iconColor: '#9333ea', // Purple color for SVGs
      card: 'bg-white',
      cardText: 'text-gray-800',
      cardDesc: 'text-purple-700',
      shadow: 'shadow-sm hover:shadow-md',
    },
    green: {
      section: 'bg-gradient-to-r from-green-50 to-green-100',
      heading: 'text-gray-800',
      subheading: 'text-gray-700',
      iconColor: '#16a34a', // Green color for SVGs
      card: 'bg-white',
      cardText: 'text-gray-800',
      cardDesc: 'text-green-700',
      shadow: 'shadow-sm hover:shadow-md',
    },
    black: {
      section: 'bg-gray-900',
      heading: 'text-white',
      subheading: 'text-gray-300',
      iconColor: '#e5e7eb', // Light gray color for SVGs
      card: 'bg-gray-800',
      cardText: 'text-white',
      cardDesc: 'text-gray-300',
      shadow: 'shadow-lg hover:shadow-xl border border-gray-700',
    },
    white: {
      section: 'bg-white',
      heading: 'text-gray-900',
      subheading: 'text-gray-700',
      iconColor: '#111827', // Dark gray color for SVGs
      card: 'bg-gray-50',
      cardText: 'text-gray-900',
      cardDesc: 'text-gray-700',
      shadow: 'shadow-sm hover:shadow-md border border-gray-100',
    },
  };

  const [howItWorksData, setHowItWorksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [styleKey, setStyleKey] = useState('primary');

  // Get the current style object based on the style key
  const currentStyle = useMemo(() => {
    return styles[styleKey] || styles.primary;
  }, [styleKey]);

  // Helper function to create icons with dynamic color
  const createIcon = (IconComponent) => {
    return (
      <IconComponent style={{ color: currentStyle.iconColor }} size={64} />
    );
  };

  // Update style when data changes
  useEffect(() => {
    if (howItWorksData?.hero?.[0]?.style) {
      const styleFromApi = howItWorksData.hero[0].style;
      if (styles[styleFromApi]) {
        setStyleKey(styleFromApi);
      }
    }
  }, [howItWorksData]);

  useEffect(() => {
    const fetchHowItWorksData = async () => {
      try {
        // Simplified endpoint construction using API_URL like in HeroSection
        const endpoint = `${
          API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL
        }/informations?filters[documentId][$eq]=dr8vjmjw0cbj6u3ns4thsoy6&populate[hero][populate]=*`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        // Use the first result
        const howItWorksSection = result.data?.[0] || null;

        console.log('How It Works Section:', howItWorksSection);
        setHowItWorksData(howItWorksSection);
      } catch (err) {
        console.error('Error fetching how it works data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHowItWorksData();
  }, []);

  // Display loading indicator when data is being fetched
  if (loading) {
    return (
      <section className={`py-16 ${styles.primary.section}`}>
        <div className="container mx-auto px-8 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  // Display error message if there's an error
  if (error) {
    return (
      <section className={`py-16 ${styles.primary.section}`}>
        <div className="container mx-auto px-8 text-center">
          <p>Error loading content: {error}</p>
        </div>
      </section>
    );
  }

  // Don't render the component if the data is not available or section is inactive
  if (!howItWorksData || howItWorksData?.active === false) return null;

  // Get titles directly from API without fallbacks
  const title = howItWorksData?.main_title;
  const subtitle = howItWorksData?.subtitle;

  // Get steps directly from API without fallbacks
  const steps =
    howItWorksData?.hero?.map((step) => ({
      title: step.icon_title,
      desc: step.icon_subtitle,
      icon: step.icon?.url ? (
        <div className="relative w-16 h-16 mx-auto">
          <Image
            src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${step.icon.url}`}
            alt={step.icon_title}
            width={64}
            height={64}
            layout="responsive"
          />
        </div>
      ) : (
        createIcon(FaIdBadge)
      ),
    })) || [];

  // If no data is available, don't render anything
  if (!title || !subtitle || !steps.length) return null;

  return (
    <section className={`py-16 ${currentStyle.section}`}>
      <div className="container mx-auto px-8">
        <div className={`text-center mb-12 ${currentStyle.heading}`}>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className={`text-lg mt-4 ${currentStyle.subheading}`}>
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-6 ${currentStyle.card} rounded-lg ${currentStyle.shadow} transition-shadow ${currentStyle.cardText}`}
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className={currentStyle.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
