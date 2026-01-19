'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SBARForm from '@/components/SBARForm';
import { Patient } from '@/lib/types';

export default function NewHandoverPage() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${params.patientId}`);
        if (!res.ok) throw new Error('Patient not found');
        const data = await res.json();

        if (!data.isActive) {
          throw new Error('Cannot create handover for discharged patient');
        }

        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (params.patientId) {
      fetchPatient();
    }
  }, [params.patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Patient not found'}
        </div>
        <Link href="/patients" className="text-blue-600 hover:text-blue-700">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/patients/${patient.id}`}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Patient
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Handover Note</h1>
        <p className="text-gray-500">Document SBAR handover for this patient</p>
      </div>

      <SBARForm patient={patient} />
    </div>
  );
}
