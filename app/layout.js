import { CartProvider } from '../context/CartContext';
import { Inter } from 'next/font/google';

// Configure the font with the same options as before
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
