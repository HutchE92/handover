'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SBARDisplay from '@/components/SBARDisplay';
import { HandoverNote, Patient } from '@/lib/types';

export default function HandoverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [handover, setHandover] = useState<HandoverNote | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const handoverRes = await fetch(`/api/handover/${params.id}`);
        if (!handoverRes.ok) throw new Error('Handover note not found');

        const handoverData = await handoverRes.json();
        setHandover(handoverData);

        // Fetch patient data
        if (handoverData.patientId) {
          const patientRes = await fetch(`/api/patients/${handoverData.patientId}`);
          if (patientRes.ok) {
            const patientData = await patientRes.json();
            setPatient(patientData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!handover || !confirm('Are you sure you want to delete this handover note? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/handover/${handover.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete handover note');

      router.push('/handover');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading handover note...</div>
      </div>
    );
  }

  if (error || !handover) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Handover note not found'}
        </div>
        <Link href="/handover" className="text-blue-600 hover:text-blue-700">
          ← Back to Handovers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - hidden when printing */}
      <div className="print:hidden flex items-center gap-4">
        <Link
          href="/handover"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Handovers
        </Link>
        {patient && (
          <>
            <span className="text-gray-300">|</span>
            <Link
              href={`/patients/${patient.id}`}
              className="text-gray-500 hover:text-gray-700"
            >
              View Patient
            </Link>
          </>
        )}
      </div>

      {/* Action Buttons - hidden when printing */}
      <div className="print:hidden flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Handover Note</h1>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Print
          </button>
          {patient && patient.isActive && (
            <Link
              href={`/handover/new/${patient.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              New Handover
            </Link>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* SBAR Display */}
      <SBARDisplay note={handover} patient={patient || undefined} />

      {/* Quick Links - hidden when printing */}
      {patient && (
        <div className="print:hidden bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Links</h3>
          <div className="flex gap-3">
            <Link
              href={`/patients/${patient.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Patient Details
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href={`/patients/${patient.id}/edit`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Edit Patient
            </Link>
            {patient.isActive && (
              <>
                <span className="text-gray-300">|</span>
                <Link
                  href={`/handover/new/${patient.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Create New Handover
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
