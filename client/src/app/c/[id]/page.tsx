import { ContentClient } from './ContentClient';

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentClient id={id} />;
}
