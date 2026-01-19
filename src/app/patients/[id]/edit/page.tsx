'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PatientForm from '@/components/PatientForm';
import { Patient } from '@/lib/types';

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${params.id}`);
        if (!res.ok) throw new Error('Patient not found');
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPatient();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading patient...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Patient not found'}
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
