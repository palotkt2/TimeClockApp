import { NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/db';

export async function GET(request, { params }) {
  try {
    // Use destructuring after awaiting params (for future Next.js compatibility)
    const barcode = params.barcode;

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode parameter is required' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Query the latest entry for this barcode
    const entry = await db.get(
      'SELECT * FROM barcode_entries WHERE barcode = ? ORDER BY timestamp DESC LIMIT 1',
      [barcode]
    );

    if (!entry) {
      // Return 404 if no entry found - this is expected for first-time users
      return NextResponse.json(
        { message: 'No previous entries found for this barcode' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve entry' },
      { status: 500 }
    );
  }
}
