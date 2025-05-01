'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Just get the orderId from URL parameters if available
    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    // Clear cart data from localStorage
    localStorage.removeItem('badgeCart');

    // Dispatch event to update cart UI if needed
    if (typeof window !== 'undefined') {
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          Order completed successfully!
        </h1>
        <p className="text-lg mb-8">
          Thank you for your purchase. We have received your order and will
          contact you soon.
        </p>
        <p className="text-md mb-8">
          You can view the status of your order in your dashboard.
          {orderId && (
            <span>
              {' '}
              Your order ID is: <strong>{orderId}</strong>
            </span>
          )}
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/account/users"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            View my orders
          </Link>
          <Link
            href="/badges"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
