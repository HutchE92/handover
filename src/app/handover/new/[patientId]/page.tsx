'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SBARForm from '@/components/SBARForm';
import { Patient, HandoverNote } from '@/lib/types';

export default function NewHandoverPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [previousHandover, setPreviousHandover] = useState<HandoverNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch patient and handovers in parallel
        const [patientRes, handoversRes] = await Promise.all([
          fetch(`/api/patients/${params.patientId}`),
          fetch('/api/handover')
        ]);

        if (!patientRes.ok) throw new Error('Patient not found');
        const patientData = await patientRes.json();

        if (!patientData.isActive) {
          throw new Error('Cannot create handover for discharged patient');
        }

        setPatient(patientData);

        // Find the most recent handover for this patient
        if (handoversRes.ok) {
          const handoversData = await handoversRes.json();
          const patientHandovers = (handoversData.handoverNotes || [])
            .filter((h: HandoverNote) => h.patientId === params.patientId)
            .sort((a: HandoverNote, b: HandoverNote) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

          if (patientHandovers.length > 0) {
            setPreviousHandover(patientHandovers[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (params.patientId) {
      fetchData();
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
        <h1 className="text-2xl font-bold text-gray-900">Create Handover Note</h1>
        <p className="text-gray-500">Document SBAR handover for this patient</p>
      </div>

      <SBARForm patient={patient} previousHandover={previousHandover} />
    </div>
  );
}
