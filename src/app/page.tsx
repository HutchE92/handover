'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PatientCard from '@/components/PatientCard';
import { Patient, HandoverNote, getNewsScoreColor } from '@/lib/types';
import { usePatients, useHandoverNotes } from '@/lib/useData';

export default function Dashboard() {
  const { patients, loading: patientsLoading } = usePatients(true);
  const { notes: handovers, loading: handoversLoading } = useHandoverNotes();
  const [stats, setStats] = useState({
    totalPatients: 0,
    highNewsCount: 0,
    todayHandovers: 0,
    wards: [] as string[]
  });
  const [recentHandovers, setRecentHandovers] = useState<(HandoverNote & { patient?: Patient })[]>([]);

  useEffect(() => {
    if (!patientsLoading && !handoversLoading) {
      const today = new Date().toISOString().split('T')[0];
      const highNewsCount = patients.filter(p => p.earlyWarningScore !== null && p.earlyWarningScore >= 5).length;
      const todayHandovers = handovers.filter(h => h.shiftDate === today).length;
      const wards = [...new Set(patients.map(p => p.ward))];

      setStats({
        totalPatients: patients.length,
        highNewsCount,
        todayHandovers,
        wards
      });

      // Get recent handovers with patient info
      const recent = handovers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(h => ({
          ...h,
          patient: patients.find(p => p.id === h.patientId)
        }));

      setRecentHandovers(recent);
    }
  }, [patients, handovers, patientsLoading, handoversLoading]);

  const loading = patientsLoading || handoversLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  // Get patients with high NEWS scores (priority patients)
  const priorityPatients = patients
    .filter(p => p.earlyWarningScore !== null && p.earlyWarningScore >= 5)
    .sort((a, b) => (b.earlyWarningScore || 0) - (a.earlyWarningScore || 0));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Nursing Handover Dashboard</h1>
        <p className="text-blue-100">
          SBAR-based shift handover management system
        </p>
        <p className="text-blue-200 text-sm mt-2">
          Demo mode - Data stored in browser localStorage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{stats.totalPatients}</div>
          <div className="text-sm text-gray-500">Active Patients</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-3xl font-bold text-amber-600">{stats.highNewsCount}</div>
          <div className="text-sm text-gray-500">High NEWS Score</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{stats.todayHandovers}</div>
          <div className="text-sm text-gray-500">Today&apos;s Handovers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">{stats.wards.length}</div>
          <div className="text-sm text-gray-500">Active Wards</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/patients/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            + Add New Patient
          </Link>
          <Link
            href="/patients"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            View All Patients
          </Link>
          <Link
            href="/handover"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            View All Handovers
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Patients */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Priority Patients
              <span className="ml-2 text-sm font-normal text-gray-500">(NEWS ≥ 5)</span>
            </h2>
          </div>
          <div className="p-4">
            {priorityPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients with high NEWS scores</p>
            ) : (
              <div className="space-y-3">
                {priorityPatients.slice(0, 5).map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {patient.lastName}, {patient.firstName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.ward} - Bed {patient.bedNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNewsScoreColor(patient.earlyWarningScore)}`}>
                        NEWS: {patient.earlyWarningScore}
                      </span>
                      <Link
                        href={`/handover/new/${patient.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Handover
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Handovers */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Handovers</h2>
          </div>
          <div className="p-4">
            {recentHandovers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No handovers recorded yet</p>
            ) : (
              <div className="space-y-3">
                {recentHandovers.map(handover => (
                  <Link
                    key={handover.id}
                    href={`/handover/${handover.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {handover.patient
                            ? `${handover.patient.lastName}, ${handover.patient.firstName}`
                            : 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {handover.shiftType} shift • {new Date(handover.shiftDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        by {handover.createdBy}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      {patients.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
            <Link href="/patients" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.slice(0, 6).map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {patients.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first patient</p>
          <Link
            href="/patients/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            + Add New Patient
          </Link>
        </div>
      )}
    </div>
  );
}
