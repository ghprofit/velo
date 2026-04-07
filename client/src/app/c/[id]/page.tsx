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
  console.log(`[CONTENT_PAGE] SSR Fetching content data for ID: ${id} from ${API_URL}`);
  try {
    const response = await fetch(`${API_URL}/api/buyer/content/${id}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.warn(`[CONTENT_PAGE] ❌ SSR Fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[CONTENT_PAGE] ✅ SSR Fetch successful for: ${data.title}`);
    return data;
  } catch (err: any) {
    console.error(`[CONTENT_PAGE] ❌ SSR Fetch error:`, err.message);
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

  // Calculate buyer price (115% of base price)
  const buyerPrice = (content.price * 1.15).toFixed(2);

  // Use thumbnail directly (crawler-friendly) if available, otherwise fallback to default logo
  const imageUrl = content.thumbnailUrl
    ? content.thumbnailUrl
    : 'https://velolink-content.s3.eu-north-1.amazonaws.com/Secondary_Logo(white).svg';

  // Compose the description with price (newline between truncated text and price)
  const metaDescription = content.description
    ? `${content.description.substring(0, 150)}...\nUnlock my Velolink for $${buyerPrice}`
    : `Unlock my Velolink for $${buyerPrice}`;

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