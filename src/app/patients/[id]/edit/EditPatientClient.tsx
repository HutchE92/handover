'use client';

import { useParams, useRouter } from 'next/navigation';
import PatientForm from '@/components/PatientForm';
import { usePatient } from '@/lib/useData';

export default function EditPatientClient() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const { patient, loading } = usePatient(patientId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading patient...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Patient not found
        </div>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
        <p className="text-gray-500">
          {patient.lastName}, {patient.firstName}
        </p>
      </div>

      <PatientForm patient={patient} mode="edit" />
    </div>
  );
}
