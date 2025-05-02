import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
    }

    const db = await getDB();
    await db.run('DELETE FROM barcode_entries WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: `Entry ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
    }

    const db = await getDB();
    const entry = await db.get('SELECT * FROM barcode_entries WHERE id = ?', [
      id,
    ]);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve entry' },
      { status: 500 }
    );
  }
}
