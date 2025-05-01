import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

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
  let connection;

  try {
    // Get user authentication from Authorization header
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

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Usuario no autenticado. Por favor inicie sesión',
          redirectUrl: '/account/login',
        },
        { status: 401 }
      );
    }

    // Log the database configuration without sensitive data
    console.log(
      `Connecting to database: ${
        process.env.DB_NAME || 'fast_id_badges'
      } on host: ${process.env.DB_HOST || 'localhost'}`
    );

    // Connect to database with enhanced error handling
    try {
      connection = await mysql.createConnection(dbConfig);
      // Test connection by querying the users table structure
      const [tableCheck] = await connection.query('SHOW COLUMNS FROM users');
      console.log(
        `Successfully connected to database, found ${tableCheck.length} columns in users table`
      );
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      return NextResponse.json(
        {
          error: `Database connection failed: ${dbError.message}. Please check .env configuration.`,
        },
        { status: 500 }
      );
    }

    // Improved query to specifically ensure email is returned
    const [users] = await connection.execute(
      `SELECT id, first_name, last_name, email, address, city, postal_code,
       country, role, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Format user data and ensure email is always included
    const user = users[0];
    if (!user.email) {
      console.warn(`User ${userId} has no email in the database`);
    }

    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email || '', // Ensure email is never undefined
      address: user.address || '',
      city: user.city || '',
      postalCode: user.postal_code || '',
      country: user.country || '',
      phone: '', // Removed phone column reference
      role: user.role || 'customer',
      createdAt: user.created_at,
    };

    // Close database connection
    await connection.end();

    // Return user data
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);

    // Close database connection if it's open
    if (connection) {
      await connection.end().catch(console.error);
    }

    return NextResponse.json(
      { error: `Failed to fetch user profile: ${error.message}` },
      { status: 500 }
    );
  }
}
