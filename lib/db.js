import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Create a singleton for db connection
let db = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: './barcode_entries.db',
      driver: sqlite3.Database,
    });

    // Initialize the database schema if needed
    await db.exec(`
      CREATE TABLE IF NOT EXISTS barcode_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  return db;
}

// Update the initialization function to add the 'action' column if it doesn't exist
export async function initDB() {
  const db = await getDB();

  // Create the barcode_entries table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS barcode_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      photo TEXT
    );
  `);

  // Check if the action column exists, if not add it
  const tableInfo = await db.all('PRAGMA table_info(barcode_entries)');
  const actionColumnExists = tableInfo.some(
    (column) => column.name === 'action'
  );

  if (!actionColumnExists) {
    // Add the action column to the existing table
    await db.exec(
      `ALTER TABLE barcode_entries ADD COLUMN action TEXT DEFAULT 'Entrada';`
    );
    console.log("Added 'action' column to barcode_entries table");
  }

  return db;
}

export async function closeDB() {
  if (db) {
    await db.close();
    db = null;
  }
}
