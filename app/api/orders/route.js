import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fast_id_badges',
  // Add connection timeout to fail faster if DB is unreachable
  connectTimeout: 10000,
};

export async function GET(request) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Log connection attempt
    console.log(`Attempting to connect to database at ${dbConfig.host}`);

    let connection;
    try {
      // Attempt database connection
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connection successful');

      // Fetch orders with JOIN to users table
      console.log(`Fetching orders for user ID: ${userId}`);
      const [orders] = await connection.execute(
        `SELECT o.*, u.first_name, u.last_name 
         FROM orders o 
         JOIN users u ON o.userId = u.id 
         WHERE o.userId = ? 
         ORDER BY o.orderDate DESC`,
        [userId]
      );

      // Check if we got any orders
      if (orders.length === 0) {
        console.log('No orders found for this user');
      } else {
        console.log(`Found ${orders.length} orders`);
      }

      // Process each order - ensure we use orderDate for date information
      for (const order of orders) {
        // Set order number from orderId column
        order.orderNumber = order.orderId
          ? `ORD-${order.orderId}`
          : `Order #${order.id}`;

        // Debug the raw orderDate value
        console.log(
          `Raw orderDate for order ${order.orderNumber}:`,
          order.orderDate
        );

        // Format the date for display if needed
        try {
          if (order.orderDate) {
            // Format date differently based on what we received from MySQL
            let dateObj;

            // Log detailed info about the date format
            console.log(`OrderDate type: ${typeof order.orderDate}`);

            // Handle timestamp format (number)
            if (typeof order.orderDate === 'number') {
              console.log('Timestamp format detected');
              // Convert timestamp to milliseconds if needed (MySQL timestamps might be in seconds)
              const timestamp =
                order.orderDate.toString().length === 10
                  ? order.orderDate * 1000 // Convert seconds to milliseconds
                  : order.orderDate; // Already in milliseconds

              dateObj = new Date(timestamp);
              console.log('Timestamp converted to date:', dateObj);
            }
            // MySQL dates often come as objects with special properties
            else if (order.orderDate instanceof Date) {
              dateObj = order.orderDate;
              console.log('Date instance detected');
            }
            // Handle string format
            else if (typeof order.orderDate === 'string') {
              console.log('String date format detected');

              // Try MySQL format YYYY-MM-DD HH:MM:SS
              if (
                /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(order.orderDate)
              ) {
                // MySQL format needs special handling in some browsers
                const [datePart, timePart] = order.orderDate.split(' ');
                dateObj = new Date(`${datePart}T${timePart}`);
                console.log(
                  'MySQL datetime format detected, parsed as:',
                  dateObj
                );
              } else {
                // Standard ISO or other string formats
                dateObj = new Date(order.orderDate);
                console.log(
                  'Standard date string detected, parsed as:',
                  dateObj
                );
              }
            }
            // Handle other object formats from MySQL
            else {
              console.log('Complex orderDate format:', order.orderDate);

              // Check if it has date components we can extract
              if (
                order.orderDate.getFullYear &&
                typeof order.orderDate.getFullYear === 'function'
              ) {
                // It has Date methods, use it directly
                dateObj = new Date(
                  order.orderDate.getFullYear(),
                  order.orderDate.getMonth(),
                  order.orderDate.getDate(),
                  order.orderDate.getHours() || 0,
                  order.orderDate.getMinutes() || 0,
                  order.orderDate.getSeconds() || 0
                );
              } else {
                // Try a string conversion as last resort
                const dateStr = order.orderDate.toString();
                console.log('Converting to string:', dateStr);
                dateObj = new Date(dateStr);
              }
            }

            // Validate the date and create formatted versions
            if (dateObj && !isNaN(dateObj.getTime())) {
              console.log('Valid date created:', dateObj);

              // Store formatted date in multiple formats
              order.formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              // Also store ISO string for reliable frontend formatting if needed
              order.isoDate = dateObj.toISOString();

              // Store timestamp for direct comparison
              order.timestamp = dateObj.getTime();

              console.log('Formatted date:', order.formattedDate);
            } else {
              console.warn(
                `Invalid date conversion for order ${order.id}:`,
                order.orderDate
              );
              order.formattedDate = 'Date not available';
              // Set status property to indicate date issue
              order.dateStatus = 'invalid';
            }
          } else {
            console.warn(`No orderDate found for order ${order.id}`);
            order.formattedDate = 'Date not available';
            order.dateStatus = 'missing';
          }
        } catch (dateError) {
          console.error(
            `Error processing date for order ${order.id}:`,
            dateError
          );
          order.formattedDate = 'Date not available';
          order.dateStatus = 'error';
        }

        // Fetch order items from order_items table for this order
        const [orderItems] = await connection.execute(
          `SELECT * FROM order_items WHERE order_id = ?`,
          [order.id]
        );

        if (orderItems.length > 0) {
          // Add items array to the order
          order.items = orderItems.map((item) => ({
            ...item,
            quantity: item.quantity || 1, // Ensure quantity is set, default to 1
            product_name: item.name || 'Product', // Ensure product_name is set for display
          }));

          console.log(`Found ${orderItems.length} items for order ${order.id}`);
        } else {
          console.log(`No items found for order ${order.id}`);
          order.items = [];
        }

        // Set a description for the order using item quantities and names
        if (order.items.length > 0) {
          order.description = `${order.items.length} item(s): ${order.items
            .map(
              (item) =>
                `${item.quantity || 1} × ${
                  item.name || item.product_name || 'Unknown product'
                }`
            )
            .join(', ')}`;
        } else {
          order.description = 'No items available';
        }
      }

      // Close the connection
      await connection.end();
      return NextResponse.json(orders);
    } catch (dbError) {
      // Log specific database error
      console.error('Database operation failed:', dbError);
      if (connection) await connection.end().catch(console.error);

      // No fallback to mock data - return database error directly
      return NextResponse.json(
        {
          error: `Database error: ${
            dbError.message || 'Unknown database error'
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in orders API:', error);

    // Return detailed error
    return NextResponse.json(
      { error: `Failed to fetch orders: ${error.message}` },
      { status: 500 }
    );
  }
}
