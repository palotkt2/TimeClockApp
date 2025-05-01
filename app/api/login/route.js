import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'fast_id_badges',
};

// Improved password verification function that handles different hash formats
const verifyPassword = (password, hashedPassword) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Verifying password...');

      // Check if hash contains a salt (format: "salt:hash")
      if (hashedPassword.includes(':')) {
        const [salt, key] = hashedPassword.split(':');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) {
            console.error('Error in scrypt verification:', err);
            reject(err);
            return;
          }

          const hashMatch = key === derivedKey.toString('hex');
          console.log('Password match result:', hashMatch);
          resolve(hashMatch);
        });
      } else {
        // Fallback for passwords stored in a different format
        // This is a simple direct comparison as a last resort
        console.warn(
          'Password hash is in unexpected format, using direct comparison'
        );
        resolve(
          crypto.timingSafeEqual(
            Buffer.from(
              crypto.createHash('sha256').update(password).digest('hex')
            ),
            Buffer.from(hashedPassword)
          )
        );
      }
    } catch (error) {
      console.error('Password verification error:', error);
      // If there's an error in verification logic, return false instead of failing
      resolve(false);
    }
  });
};

export async function POST(request) {
  let connection;

  try {
    // Parse request body
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create database connection with extended timeout
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 10000, // 10 second timeout
    });

    console.log('Connected to database');

    // Test database connection
    await connection.execute('SELECT 1');
    console.log('Database connection verified');

    // Find user by email - print SQL to help debug
    const userQuery =
      'SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?';
    console.log('Executing query:', userQuery, [email]);

    const [users] = await connection.execute(userQuery, [email]);

    console.log('Query result count:', users.length);

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
    });

    // Print password hash format for debugging (never do this in production)
    console.log(
      'Password hash format:',
      user.password?.substring(0, 10) + '...'
    );

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User authenticated successfully:', user.id);

    // Return user data (excluding password)
    return NextResponse.json(
      {
        message: 'Login successful',
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json(
      {
        message: 'Authentication failed',
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    // Close the connection
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}
