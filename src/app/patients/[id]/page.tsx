'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Patient,
  HandoverNote,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  getResusStatusColor
} from '@/lib/types';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [handovers, setHandovers] = useState<HandoverNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discharging, setDischarging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientRes, handoversRes] = await Promise.all([
          fetch(`/api/patients/${params.id}`),
          fetch(`/api/handover?patientId=${params.id}`)
        ]);

        if (!patientRes.ok) {
          throw new Error('Patient not found');
        }

        const patientData = await patientRes.json();
        const handoversData = await handoversRes.json();

        setPatient(patientData);
        setHandovers(handoversData.handoverNotes || []);
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

  const handleDischarge = async () => {
    if (!patient || !confirm('Are you sure you want to discharge this patient?')) {
      return;
    }

    setDischarging(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discharge' })
      });

      if (!res.ok) throw new Error('Failed to discharge patient');

      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discharge patient');
      setDischarging(false);
    }
  };

  const handleDelete = async () => {
    if (!patient || !confirm('Are you sure you want to permanently delete this patient? This action cannot be undone and will also delete all associated handover notes.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete patient');

      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading patient details...</div>
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
        <Link href="/patients" className="text-gray-500 hover:text-gray-700">
          ← Back to Patients
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.lastName}, {patient.firstName}
              </h1>
              {!patient.isActive && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                  Discharged
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>NHS: {formatNhsNumber(patient.nhsNumber)}</span>
              <span>Age: {calculateAge(patient.dateOfBirth)}</span>
              <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResusStatusColor(patient.resuscitationStatus)}`}>
              {patient.resuscitationStatus}
            </span>
            {patient.earlyWarningScore !== null && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNewsScoreColor(patient.earlyWarningScore)}`}>
                NEWS: {patient.earlyWarningScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {patient.isActive && (
          <>
            <Link
              href={`/handover/new/${patient.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Handover
            </Link>
            <Link
              href={`/patients/${patient.id}/edit`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Edit Patient
            </Link>
            <button
              onClick={handleDischarge}
              disabled={discharging}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-md font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {discharging ? 'Discharging...' : 'Discharge Patient'}
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Patient'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Details */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ward Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Ward</dt>
              <dd className="font-medium text-gray-900">{patient.ward}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Bed Number</dt>
              <dd className="font-medium text-gray-900">{patient.bedNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Consultant</dt>
              <dd className="font-medium text-gray-900">{patient.consultant}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Admission Date</dt>
              <dd className="font-medium text-gray-900">
                {new Date(patient.admissionDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Clinical Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-gray-500 mb-1">Diagnosis</dt>
              <dd className="font-medium text-gray-900">{patient.diagnosis}</dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Allergies</dt>
              <dd className={`font-medium ${patient.allergies ? 'text-red-600' : 'text-gray-900'}`}>
                {patient.allergies || 'NKDA (No Known Drug Allergies)'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Resuscitation Status</dt>
              <dd className="font-medium text-gray-900">{patient.resuscitationStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">NEWS Score</dt>
              <dd className="font-medium text-gray-900">
                {patient.earlyWarningScore !== null ? patient.earlyWarningScore : 'Not recorded'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Handover History */}
      <div id="handover-history" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Handover History</h2>
            {patient.isActive && (
              <Link
                href={`/handover/new/${patient.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + New Handover
              </Link>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {handovers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No handover notes recorded yet</p>
          ) : (
            handovers
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(handover => (
                <div key={handover.id} className="flex">
                  {/* Date/Author Column */}
                  <div className="w-48 flex-shrink-0 p-4 bg-gray-50 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(handover.shiftDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {handover.shiftType} Shift
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      By: <span className="font-medium">{handover.createdBy}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(handover.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <Link
                      href={`/handover/${handover.id}`}
                      className="inline-block mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Full →
                    </Link>
                  </div>

                  {/* SBAR Content Columns */}
                  <div className="flex-1 grid grid-cols-4 divide-x divide-gray-200">
                    {/* Situation */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                        <span className="text-xs font-semibold text-blue-700">Situation</span>
                      </div>
                      <p className="text-sm text-gray-700">{handover.situation}</p>
                    </div>

                    {/* Background */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                        <span className="text-xs font-semibold text-green-700">Background</span>
                      </div>
                      <p className="text-sm text-gray-700">{handover.background}</p>
                    </div>

                    {/* Assessment */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-100 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                        <span className="text-xs font-semibold text-amber-700">Assessment</span>
                      </div>
                      <p className="text-sm text-gray-700">{handover.assessment}</p>
                    </div>

                    {/* Recommendation */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-100 text-red-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                        <span className="text-xs font-semibold text-red-700">Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-700">{handover.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
