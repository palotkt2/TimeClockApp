import { NextResponse } from 'next/server';

// This is a mock database - in a real app, you would fetch from your actual database
const products = [
  {
    id: '1',
    name: 'Standard ID Badge',
    description:
      'Professional ID badge with customizable color and text options. Perfect for office environments and corporate settings.',
    price: 12.99,
    image: '/images/id-badge.jpg',
    colors: ['Blue', 'Black', 'Red', 'Green', 'White', 'Clear'],
    sizes: ['Standard', 'Large'],
    rating: 4.5,
    badgeType: 'ID Badge',
  },
  {
    id: '2',
    name: 'Access Card Holder',
    description:
      'Durable access card holder compatible with RFID and proximity cards. Protects cards from damage while maintaining full functionality.',
    price: 8.99,
    image: '/images/access-cards.jpg',
    colors: ['Clear', 'Black', 'Blue', 'Red'],
    rating: 4.7,
    badgeType: 'Card Holder',
  },
  {
    id: '3',
    name: 'Badge Reel',
    description:
      'Retractable badge reel with strong clip and durable cord. Easy to use and built to last.',
    price: 6.99,
    image: '/images/badge-reel.jpg',
    colors: ['Black', 'White', 'Blue', 'Silver'],
    rating: 4.3,
    badgeType: 'Accessory',
  },
];

export async function GET(request, { params }) {
  const { id } = params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const product = products.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
