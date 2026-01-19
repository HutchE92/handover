'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HandoverNote, Patient, getNewsScoreColor, getResusStatusColor, formatNhsNumber, calculateAge } from '@/lib/types';

interface HandoverWithPatient extends HandoverNote {
  patient?: Patient;
}

interface PatientWithLatestHandover extends Patient {
  latestHandover?: HandoverNote;
}

const WARDS = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);
const BEDS_PER_WARD = 28;

export default function HandoverListPage() {
  const [handovers, setHandovers] = useState<HandoverWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [filterHighNews, setFilterHighNews] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [handoversRes, patientsRes] = await Promise.all([
          fetch('/api/handover'),
          fetch('/api/patients')
        ]);

        if (!handoversRes.ok || !patientsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const handoversData = await handoversRes.json();
        const patientsData = await patientsRes.json();

        const patientsList: Patient[] = patientsData.patients || [];
        const handoversList: HandoverNote[] = handoversData.handoverNotes || [];

        // Merge patient data into handovers
        const handoversWithPatients = handoversList.map(h => ({
          ...h,
          patient: patientsList.find(p => p.id === h.patientId)
        }));

        setHandovers(handoversWithPatients);
        setPatients(patientsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get patients for selected ward with their latest handover
  const wardPatients: PatientWithLatestHandover[] = patients
    .filter(p => p.ward === selectedWard && p.isActive)
    .map(patient => {
      const patientHandovers = handovers
        .filter(h => h.patientId === patient.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return {
        ...patient,
        latestHandover: patientHandovers[0]
      };
    })
    .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true }));

  // Calculate ward statistics
  const emptyBeds = BEDS_PER_WARD - wardPatients.length;
  const highNewsCount = wardPatients.filter(p => p.earlyWarningScore !== null && p.earlyWarningScore >= 5).length;

  // Filter patients based on high NEWS filter
  const displayedPatients = filterHighNews
    ? wardPatients.filter(p => p.earlyWarningScore !== null && p.earlyWarningScore >= 5)
    : wardPatients;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading handovers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ward Handover</h1>
          <p className="text-gray-500">Select a ward to view patient handover information</p>
        </div>
      </div>

      {/* Ward Selector */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 print:hidden">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Ward</label>
        <div className="flex flex-wrap gap-2">
          {WARDS.map(ward => (
            <button
              key={ward}
              onClick={() => {
                setSelectedWard(ward);
                setFilterHighNews(false);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedWard === ward
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ward.replace('Ward ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Content */}
      {!selectedWard ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a ward to begin</h3>
          <p className="text-gray-500">Choose a ward number above to view patients and their handover information</p>
        </div>
      ) : wardPatients.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients in {selectedWard}</h3>
          <p className="text-gray-500 mb-4">There are no active patients assigned to this ward</p>
          <Link
            href="/patients/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            + Add New Patient
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ward Header */}
          <div className="bg-blue-600 text-white rounded-lg p-4 print:bg-white print:text-black print:border print:border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedWard}</h2>
                <p className="text-sm text-blue-100 print:text-gray-500 hidden print:block">
                  Printed: {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{wardPatients.length}</div>
                  <div className="text-xs text-blue-100 print:text-gray-500">Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{emptyBeds}</div>
                  <div className="text-xs text-blue-100 print:text-gray-500">Empty Beds</div>
                </div>
                <button
                  onClick={() => highNewsCount > 0 && setFilterHighNews(!filterHighNews)}
                  disabled={highNewsCount === 0}
                  className={`text-center px-3 py-2 rounded-lg transition-colors ${
                    highNewsCount > 0
                      ? filterHighNews
                        ? 'bg-red-700 border-2 border-white cursor-pointer'
                        : 'bg-red-600 border-2 border-red-400 cursor-pointer hover:bg-red-700'
                      : ''
                  }`}
                >
                  <div className="text-2xl font-bold text-white">{highNewsCount}</div>
                  <div className="text-xs text-white">High NEWS</div>
                </button>
                <button
                  onClick={() => window.print()}
                  className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors print:hidden"
                >
                  Print Ward List
                </button>
              </div>
            </div>
          </div>

          {/* Filter indicator */}
          {filterHighNews && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-red-700 font-medium">
                Showing {displayedPatients.length} patient{displayedPatients.length !== 1 ? 's' : ''} with high NEWS score (5+)
              </span>
              <button
                onClick={() => setFilterHighNews(false)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Show all patients
              </button>
            </div>
          )}

          {/* Patient List with SBAR */}
          <div className="space-y-3 print:space-y-2">
            {displayedPatients.map(patient => (
              <div
                key={patient.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden print:break-inside-avoid print:shadow-none"
              >
                {/* Patient Details + SBAR Row */}
                <div className="grid grid-cols-5 divide-x divide-gray-200">
                  {/* Patient Details Column */}
                  <div className="p-3 bg-gray-50">
                    <div className="space-y-2">
                      <div>
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 text-lg"
                        >
                          {patient.lastName}, {patient.firstName}
                        </Link>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bed</div>
                        <div className="font-medium text-blue-600">{patient.bedNumber}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">NHS</div>
                        <div className="text-sm">{formatNhsNumber(patient.nhsNumber)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Age</div>
                        <div className="text-sm">{calculateAge(patient.dateOfBirth)} ({new Date(patient.dateOfBirth).toLocaleDateString()})</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Diagnosis</div>
                        <div className="text-sm">{patient.diagnosis}</div>
                      </div>
                      {patient.allergies && (
                        <div>
                          <div className="text-xs text-gray-500">Allergies</div>
                          <div className="text-sm text-red-600 font-medium">{patient.allergies}</div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResusStatusColor(patient.resuscitationStatus)}`}>
                          {patient.resuscitationStatus}
                        </span>
                        {patient.earlyWarningScore !== null && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNewsScoreColor(patient.earlyWarningScore)}`}>
                            NEWS: {patient.earlyWarningScore}
                          </span>
                        )}
                      </div>
                      <div className="pt-2 flex gap-2 print:hidden">
                        <Link
                          href={`/handover/new/${patient.id}`}
                          className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          + Handover
                        </Link>
                        <Link
                          href={`/patients/${patient.id}#handover-history`}
                          className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                        >
                          History
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* SBAR Columns */}
                  {patient.latestHandover ? (
                    <>
                      {/* Situation */}
                      <Link href={`/handover/${patient.latestHandover.id}`} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                          <span className="text-xs font-semibold text-blue-700">Situation</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.situation}</p>
                      </Link>

                      {/* Background */}
                      <Link href={`/handover/${patient.latestHandover.id}`} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                          <span className="text-xs font-semibold text-green-700">Background</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.background}</p>
                      </Link>

                      {/* Assessment */}
                      <Link href={`/handover/${patient.latestHandover.id}`} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                          <span className="text-xs font-semibold text-amber-700">Assessment</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.assessment}</p>
                      </Link>

                      {/* Recommendation */}
                      <Link href={`/handover/${patient.latestHandover.id}`} className="p-3 hover:bg-gray-50 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-100 text-red-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                          <span className="text-xs font-semibold text-red-700">Recommendation</span>
                        </div>
                        <p className="text-sm text-gray-700 flex-1">{patient.latestHandover.recommendation}</p>
                        <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-200">
                          <div className="text-xs text-gray-600 font-medium">{patient.latestHandover.createdBy}</div>
                          <div className="text-xs text-gray-500">{patient.latestHandover.shiftType} • {new Date(patient.latestHandover.shiftDate).toLocaleDateString()}</div>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="col-span-4 p-4 flex items-center justify-center text-gray-500 text-sm">
                      No handover notes yet.{' '}
                      <Link href={`/handover/new/${patient.id}`} className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                        Create one now
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
