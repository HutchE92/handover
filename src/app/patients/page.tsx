'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PatientCard from '@/components/PatientCard';
import { usePatients, useWards } from '@/lib/useData';

export default function PatientsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { patients, loading } = usePatients(!showInactive);
  const { wards } = useWards();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesWard = selectedWard === 'all' || patient.ward === selectedWard;
      const matchesSearch = searchTerm === '' ||
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.nhsNumber.includes(searchTerm) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesWard && matchesSearch;
    });
  }, [patients, selectedWard, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage and view all patients</p>
        </div>
        <Link
          href="/patients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          + Add New Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, NHS number, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Wards</option>
              {wards.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>

          {/* Show Inactive Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show discharged patients
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Patient Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500 mb-4">
            {patients.length === 0
              ? 'Get started by adding your first patient'
              : 'Try adjusting your search or filters'}
          </p>
          {patients.length === 0 && (
            <Link
              href="/patients/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              + Add New Patient
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div key={patient.id} className={!patient.isActive ? 'opacity-60' : ''}>
              <PatientCard patient={patient} />
              {!patient.isActive && (
                <div className="mt-1 text-center text-sm text-gray-500">
                  (Discharged)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
