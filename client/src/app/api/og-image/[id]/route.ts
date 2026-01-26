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

    // Target OG image dimensions
    const width = 1200;
    const height = 630;

    // Prepare truncated description and buyer price
    const description = content.description
      ? String(content.description).substring(0, 150) + '...'
      : '';
    const buyerPrice = (Number(content.price) * 1.1).toFixed(2);

    // Create an SVG overlay with two lines: description and bold price
    const svg = `<?xml version="1.0" encoding="utf-8"?>
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .overlay { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        .desc { font-size: 44px; fill: #ffffff; font-weight: 500; }
        .price { font-size: 56px; fill: #ffffff; font-weight: 800; }
        .bg { fill: rgba(0,0,0,0.4); }
      </style>
      <rect x="0" y="${height - 220}" width="${width}" height="220" class="bg" />
      <g class="overlay">
        <text x="60" y="${height - 110}" class="desc">${escapeXml(description)}</text>
        <text x="60" y="${height - 40}" class="price">Unlock my Velolink for $${escapeXml(buyerPrice)}</text>
      </g>
    </svg>`;

    // Process image: resize -> blur -> composite SVG overlay
    const processed = await sharp(Buffer.from(imageBuffer))
      .resize(width, height, { fit: 'cover' })
      .blur(10)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 80 })
      .toBuffer();

    return new NextResponse(new Uint8Array(processed), {
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