import NewHandoverClient from './NewHandoverClient';

// Provide a placeholder for static export - actual data loaded client-side
export async function generateStaticParams() {
  return [{ patientId: 'placeholder' }];
}

export default function NewHandoverPage() {
  return <NewHandoverClient />;
}
