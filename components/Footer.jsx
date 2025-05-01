'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  FaCcAmex,
  FaCcVisa,
  FaCcMastercard,
  FaChevronDown,
} from 'react-icons/fa';

export default function Footer() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we're on client-side and get window width
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch footer data
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        console.log('Base URL:', baseUrl);

        const endpoint = '/api/informations';
        const queryParams = new URLSearchParams({
          'filters[documentId][$eq]': 'r46tvfw9mq7zvzw4pm4bntd6',
          'populate[footer][populate]': '*',
        });

        const fullUrl = `${baseUrl}${endpoint}?${queryParams}`;
        console.log('Fetching from:', fullUrl);

        const response = await fetch(fullUrl);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw API response:', result);

        // Get the first item from data array (similar to ShippingBenefits)
        const data = result.data?.[0] || null;

        if (data) {
          console.log('Data found:', data);

          // Get footer from attributes (similar to how ShippingBenefits gets hero)
          let footerSections = [];

          if (data.attributes?.footer) {
            footerSections = data.attributes.footer;
            console.log('Footer sections from attributes:', footerSections);
          } else if (data.footer) {
            footerSections = data.footer;
            console.log('Footer sections direct access:', footerSections);
          }

          // Group sections by their titles directly (don't try to find by name)
          if (footerSections && footerSections.length > 0) {
            const sections = {};

            // Map the sections by tittle for easy access
            footerSections.forEach((section) => {
              if (section.__component === 'footer.section1' && section.tittle) {
                sections[section.tittle] = section;
              }
            });

            console.log('Organized sections:', sections);
            setFooterData(sections);
          } else {
            console.error('No footer sections found');
            setFooterData(null);
          }
        } else {
          console.error('No data found in API response');
          setFooterData(null);
        }
      } catch (err) {
        console.error('Failed to fetch footer data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Don't render the footer content on the badges page
  if (pathname === '/badges') {
    return <footer style={{ display: 'none' }}></footer>;
  }

  // Show loading indicator when data is being fetched
  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-8 text-center">
          <p>Loading footer information...</p>
        </div>
      </footer>
    );
  }

  // If there's an error or no data, show error in development, return null in production
  if (error || !footerData) {
    console.error('Footer error or no data:', error);
    if (process.env.NODE_ENV === 'development') {
      return (
        <footer className="bg-red-800 text-white py-12">
          <div className="container mx-auto px-8 text-center">
            <p>Error loading footer: {error || 'No data available'}</p>
          </div>
        </footer>
      );
    }
    return null;
  }

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          {footerData['Miller Square'] && (
            <div className="md:col-span-1 flex flex-col">
              <h4 className="text-xl font-bold mb-4">
                {footerData['Miller Square'].tittle}
              </h4>
              {footerData['Miller Square'].subtitle && (
                <p className="text-gray-300">
                  {footerData['Miller Square'].subtitle}
                </p>
              )}
            </div>
          )}

          {/* Products */}
          {footerData['Products'] && (
            <div className="md:col-span-1 flex flex-col">
              <h4
                className="font-semibold mb-4 cursor-pointer md:cursor-default flex justify-between items-center"
                onClick={() => toggleSection('Products')}
              >
                {footerData['Products'].tittle}
                <FaChevronDown
                  className={`md:hidden transition-transform ${
                    openSection === 'Products' ? 'transform rotate-180' : ''
                  }`}
                />
              </h4>
              <ul
                className={`space-y-2 ${
                  openSection === 'Products' || (isClient && windowWidth >= 768)
                    ? 'block'
                    : 'hidden'
                }`}
              >
                {footerData['Products'].FooterLink?.map((link) => (
                  <li key={link.id}>
                    <a
                      href={
                        link.url
                          ? link.url.startsWith('http')
                            ? link.url
                            : link.url.includes('@')
                            ? `mailto:${link.url}`
                            : link.url.match(/^\d/)
                            ? `tel:${link.url}`
                            : `${link.url}`
                          : '#'
                      }
                      className="text-gray-300 hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {footerData['Resources'] && (
            <div className="md:col-span-1 flex flex-col">
              <h4
                className="font-semibold mb-4 cursor-pointer md:cursor-default flex justify-between items-center"
                onClick={() => toggleSection('Resources')}
              >
                {footerData['Resources'].tittle}
                <FaChevronDown
                  className={`md:hidden transition-transform ${
                    openSection === 'Resources' ? 'transform rotate-180' : ''
                  }`}
                />
              </h4>
              <ul
                className={`space-y-2 ${
                  openSection === 'Resources' ||
                  (isClient && windowWidth >= 768)
                    ? 'block'
                    : 'hidden'
                }`}
              >
                {footerData['Resources'].FooterLink?.map((link) => (
                  <li key={link.id}>
                    <a
                      href={
                        link.url
                          ? link.url.startsWith('http')
                            ? link.url
                            : link.url.includes('@')
                            ? `mailto:${link.url}`
                            : link.url.match(/^\d/)
                            ? `tel:${link.url}`
                            : `${link.url}`
                          : '#'
                      }
                      className="text-gray-300 hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {footerData['Contact'] && (
            <div className="md:col-span-1 flex flex-col">
              <h4
                className="font-semibold mb-4 cursor-pointer md:cursor-default flex justify-between items-center"
                onClick={() => toggleSection('Contact')}
              >
                {footerData['Contact'].tittle}
                <FaChevronDown
                  className={`md:hidden transition-transform ${
                    openSection === 'Contact' ? 'transform rotate-180' : ''
                  }`}
                />
              </h4>
              <ul
                className={`space-y-2 ${
                  openSection === 'Contact' || (isClient && windowWidth >= 768)
                    ? 'block'
                    : 'hidden'
                }`}
              >
                {footerData['Contact'].FooterLink?.map((link) => (
                  <li key={link.id} className="text-gray-300">
                    <a
                      href={
                        link.url.startsWith('http')
                          ? link.url
                          : link.url.includes('@')
                          ? `mailto:${link.url}`
                          : link.url.match(/^\d/)
                          ? `tel:${link.url}`
                          : `#${link.url}`
                      }
                      className="hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
                <li className="flex space-x-4 mt-2">
                  <FaCcAmex className="text-4xl text-blue-500" />
                  <FaCcVisa className="text-4xl text-blue-500" />
                  <FaCcMastercard className="text-4xl text-blue-500" />
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()}{' '}
            {footerData['Miller Square']?.tittle || 'Company'}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
