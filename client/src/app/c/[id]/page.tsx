import { Metadata } from 'next';
import { ContentClient } from './ContentClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ContentMetadata {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  contentType: string;
  creator: {
    displayName: string;
  };
}

async function getContentData(id: string): Promise<ContentMetadata | null> {
  try {
    const response = await fetch(`${API_URL}/api/buyer/content/${id}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const content = await getContentData(id);

  if (!content) {
    return {
      title: 'Content Not Found | VeloLink',
      description: 'This content is not available.',
    };
  }

  // Calculate buyer price (110% of base price)
  const buyerPrice = (content.price * 1.1).toFixed(2);

  // Use thumbnail URL or fallback
  const imageUrl =
    content.thumbnailUrl || '/assets/logo_images/Brand_icon(white).png';

  // Compose the description with price
  const metaDescription = content.description
    ? `${content.description.substring(0, 150)}... - $${buyerPrice}`
    : `${content.contentType} by ${content.creator.displayName} - $${buyerPrice}`;

  return {
    title: `${content.title} | VeloLink`,
    description: metaDescription,
    openGraph: {
      title: content.title,
      description: metaDescription,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_CLIENT_URL || 'https://velolink.com'}/c/${id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
      siteName: 'VeloLink',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: metaDescription,
      images: [imageUrl],
    },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContentClient id={id} />;
}
