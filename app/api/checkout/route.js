import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'fast_id_badges',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(request) {
  try {
    // Get user authentication from Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    let userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.split(' ')[1];
    }

    // Fallback to cookies if no Authorization header
    if (!userId) {
      const cookieStore = cookies();
      const userIdCookie = cookieStore.get('userId');

      if (userIdCookie) {
        userId = userIdCookie.value;
      }
    }

    // Get checkout data from request
    const checkoutData = await request.json();

    // Extract customer and order info from the new payload structure
    const { customer, orderInfo, items } = checkoutData;

    // Use userId from the payload if available and not already set from auth header
    if (!userId && customer && customer.userId) {
      userId = customer.userId;
    }

    // Create order in database directly
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generate a unique orderId based on current timestamp and a random string
      const uniqueOrderId = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}`;

      // Always create a new order, including the unique orderId
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (orderId, userId, first_name, email, address, city, postal_code, country, subtotal, tax, total, status, orderDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          uniqueOrderId, // Add unique orderId as the first parameter
          userId || null,
          customer.name ||
            `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          customer.email,
          customer.address,
          customer.city,
          customer.postalCode,
          customer.country,
          orderInfo?.subtotal || calculateTotal(items),
          orderInfo?.tax || 0,
          orderInfo?.total || calculateTotal(items),
          orderInfo?.status || 'pending',
          orderInfo?.orderDate ||
            new Date().toISOString().slice(0, 19).replace('T', ' '),
        ]
      );

      const orderId = orderResult.insertId;
      if (!orderId || isNaN(parseInt(orderId))) {
        throw new Error('Failed to get a valid order ID');
      }

      // Console log order ID and other order info for debugging
      console.log(`Created new order with ID: ${orderId}`);
      console.log('Order details:', {
        user: userId,
        items: items.length,
        total: orderInfo?.total || calculateTotal(items),
      });

      // Use correct column names in order_items table (match your database schema)
      for (const item of items) {
        console.log(
          `Inserting item "${item.name}" with ID ${
            item.productId || 'null'
          } for order ${orderId}`
        );

        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url, badge_type, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            orderId, // Must be a valid number from insertId
            item.productId || null,
            item.name,
            item.price,
            item.quantity,
            item.imageUrl || item.image || null,
            item.badgeType || null,
            item.size || null,
          ]
        );
      }

      await connection.commit();

      // Add a unique timestamp to the response to ensure frontend treats it as unique
      return NextResponse.json(
        {
          success: true,
          orderId: orderId,
          orderReference: uniqueOrderId, // Add the unique orderId to response
          message: 'Order placed successfully',
          timestamp: Date.now(),
        },
        { status: 201 }
      );
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in checkout process:', error);
    return NextResponse.json(
      { error: `Checkout failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to calculate order total if not provided
function calculateTotal(items) {
  return items
    .reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + itemPrice * quantity;
    }, 0)
    .toFixed(2);
}
