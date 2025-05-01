import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'fast_id_badges',
};

// Secure password hashing function using crypto
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');

    // Use scrypt for secure password hashing
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // Store both the salt and the hashed password
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

export async function POST(request) {
  let connection;

  try {
    // Parse request body
    const { firstName, lastName, email, password } = await request.json();

    console.log('Registration attempt:', { firstName, lastName, email });

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Ensure the users table exists with the role column
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password using crypto
    const hashedPassword = await hashPassword(password);

    // Insert user into database with correct column names and the 'user' role
    const [result] = await connection.execute(
      `INSERT INTO users (first_name, last_name, email, password, role) 
       VALUES (?, ?, ?, ?, 'user')`,
      [firstName, lastName, email, hashedPassword]
    );

    console.log('User registered successfully:', result.insertId);

    // Return success response
    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: result.insertId,
        role: 'user',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error details:', error);

    // Check for specific database errors
    let errorMessage = 'Error registering user';
    let statusCode = 500;

    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Email already registered';
      statusCode = 409;
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database setup issue';
      statusCode = 500;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Database connection error';
      statusCode = 500;
    }

    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: statusCode }
    );
  } finally {
    // Close the connection in the finally block to ensure it always happens
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}
