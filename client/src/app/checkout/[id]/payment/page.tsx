import { PaymentClient } from './PaymentClient';

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentClient id={id} />;
}
