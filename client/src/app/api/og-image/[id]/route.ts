// app/api/og-image/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch the original content metadata
    const response = await fetch(`${API_URL}/api/buyer/content/${id}`);
    if (!response.ok) {
      return new NextResponse('Content not found', { status: 404 });
    }
    
    const content = await response.json();
    const thumbnailUrl = content.thumbnailUrl;
    
    if (!thumbnailUrl) {
      return new NextResponse('No thumbnail available', { status: 404 });
    }

    // Fetch the original image
    const imageResponse = await fetch(thumbnailUrl);
    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Import sharp for image processing
    const sharp = (await import('sharp')).default;
    
    // Apply blur effect
    const blurredImage = await sharp(Buffer.from(imageBuffer))
      .blur(10) // Adjust blur intensity (higher = more blur)
      .jpeg({ quality: 80 })
      .toBuffer();

    return new NextResponse(new Uint8Array(blurredImage), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error processing OG image:', error);
    return new NextResponse('Error processing image', { status: 500 });
  }
}