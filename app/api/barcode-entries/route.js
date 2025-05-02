import { NextResponse } from 'next/server';
import { getDB, initDB } from '../../../lib/db';

// Make sure to initialize the database with the updated schema
export async function GET(request) {
  try {
    await initDB(); // Ensure the DB is initialized with all columns
    const db = await getDB();
    const entries = await db.all(
      'SELECT * FROM barcode_entries ORDER BY timestamp DESC'
    );
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve entries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Ensure the DB is initialized with all columns before proceeding
    await initDB();

    const db = await getDB();
    const { barcode, timestamp, photo, action } = await request.json();

    // Validate the required fields
    if (!barcode || !timestamp) {
      return NextResponse.json(
        { error: 'Barcode and timestamp are required' },
        { status: 400 }
      );
    }

    // Include the action field in the INSERT statement
    const result = await db.run(
      'INSERT INTO barcode_entries (barcode, timestamp, photo, action) VALUES (?, ?, ?, ?)',
      [barcode, timestamp, photo, action || 'Entrada'] // Default to 'Entrada' if no action provided
    );

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: 'Entry recorded successfully',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save entry', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const db = await getDB();
    await db.run('DELETE FROM barcode_entries');

    return NextResponse.json({
      success: true,
      message: 'All entries deleted successfully',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    );
  }
}
