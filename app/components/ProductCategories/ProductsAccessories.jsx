'use client';

import React, { useState, useEffect } from 'react';

const ProductsAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically fetch your accessories data
    // For example:
    // fetchAccessories().then(data => {
    //   setAccessories(data);
    //   setLoading(false);
    // });

    // Placeholder data for demonstration
    const demoAccessories = [
      { id: 1, name: 'Lanyard', price: 9.99, image: '/images/lanyard.jpg' },
      {
        id: 2,
        name: 'Badge Holder',
        price: 4.99,
        image: '/images/badge-holder.jpg',
      },
      {
        id: 3,
        name: 'Retractable Reel',
        price: 7.99,
        image: '/images/reel.jpg',
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setAccessories(demoAccessories);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading accessories...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Badge Accessories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory) => (
          <div
            key={accessory.id}
            className="border rounded-lg overflow-hidden shadow-md"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {accessory.image ? (
                <img
                  src={accessory.image}
                  alt={accessory.name}
                  className="object-cover h-full w-full"
                />
              ) : (
                <span>No image available</span>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{accessory.name}</h2>
              <p className="text-gray-700 mt-2">
                ${accessory.price.toFixed(2)}
              </p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsAccessories;
