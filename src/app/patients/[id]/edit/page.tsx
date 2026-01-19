import EditPatientClient from './EditPatientClient';

// Provide a placeholder for static export - actual data loaded client-side
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function EditPatientPage() {
  return <EditPatientClient />;
}
