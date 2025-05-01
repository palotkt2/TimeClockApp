'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues
const ProductsAccessories = dynamic(
  () => import('../../components/ProductCategories/ProductsAccessories'),
  { ssr: false }
);

const ProductsPage = () => {
  return <ProductsAccessories />;
};

export default ProductsPage;
