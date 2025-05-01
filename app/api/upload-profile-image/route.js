import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('profileImage');
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 2MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileName = `${userId}-${uniqueId}-${file.name.replace(/\s+/g, '-')}`;

    // Define public path for the file
    const publicPath = join(process.cwd(), 'public', 'uploads', 'profiles');

    // Ensure directory exists
    try {
      await fs.mkdir(publicPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    const filePath = join(publicPath, fileName);

    // Write the file to disk
    await writeFile(filePath, buffer);
    console.log('File saved at', filePath);

    // Generate URL for the file that can be accessed from the client
    const imageUrl = `/uploads/profiles/${fileName}`;

    // In a real application, you would also:
    // 1. Update the user's profile with the new image path in your database
    // 2. Delete the old profile image if it exists
    // 3. Potentially resize or optimize the image before saving

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload profile image' },
      { status: 500 }
    );
  }
}
