import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'fast_id_badges',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute SQL queries
export async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// User-related database functions
export async function getUserById(userId) {
  return executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
}

export async function updateUserCheckoutInfo(userId, checkoutData) {
  const { address, city, postalCode, country } = checkoutData;
  return executeQuery(
    'UPDATE users SET address = ?, city = ?, postal_code = ?, country = ? WHERE id = ?',
    [address, city, postalCode, country, userId]
  );
}
