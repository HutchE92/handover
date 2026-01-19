import HandoverDetailClient from './HandoverDetailClient';

// Provide a placeholder for static export - actual data loaded client-side
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function HandoverDetailPage() {
  return <HandoverDetailClient />;
}
