'use client';

import { useParams, useRouter } from 'next/navigation';
import SBARForm from '@/components/SBARForm';
import { usePatient, useHandoverNotes } from '@/lib/useData';

export default function NewHandoverClient() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const { patient, loading: patientLoading } = usePatient(patientId);
  const { notes: handovers, loading: handoversLoading } = useHandoverNotes(patientId);

  const loading = patientLoading || handoversLoading;

  // Get the most recent handover for this patient
  const previousHandover = handovers.length > 0
    ? handovers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading...</div>
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

  if (!patient.isActive) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Cannot create handover for discharged patient
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
