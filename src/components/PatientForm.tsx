'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Patient, ResuscitationStatus, validateNhsNumber } from '@/lib/types';
import * as storage from '@/lib/localStorage';

interface PatientFormProps {
  patient?: Patient;
  mode: 'create' | 'edit';
}

export default function PatientForm({ patient, mode }: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nhsNumber: patient?.nhsNumber || '',
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    ward: patient?.ward || '',
    bedNumber: patient?.bedNumber || '',
    consultant: patient?.consultant || '',
    admissionDate: patient?.admissionDate || new Date().toISOString().split('T')[0],
    diagnosis: patient?.diagnosis || '',
    allergies: patient?.allergies || '',
    resuscitationStatus: (patient?.resuscitationStatus || 'Not Discussed') as ResuscitationStatus,
    earlyWarningScore: patient?.earlyWarningScore?.toString() || '',
  });

  const formatNhsNumberInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    // Format as XXX XXXX XXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'nhsNumber') {
      const formatted = formatNhsNumberInput(value);
      setFormData(prev => ({ ...prev, nhsNumber: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate NHS number
    if (!validateNhsNumber(formData.nhsNumber)) {
      setError('NHS number must be 10 digits');
      setLoading(false);
      return;
    }

    try {
      const now = new Date().toISOString();

      if (mode === 'create') {
        const newPatient: Patient = {
          id: uuidv4(),
          nhsNumber: formData.nhsNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          ward: formData.ward,
          bedNumber: formData.bedNumber,
          consultant: formData.consultant,
          admissionDate: formData.admissionDate,
          diagnosis: formData.diagnosis,
          allergies: formData.allergies,
          resuscitationStatus: formData.resuscitationStatus,
          earlyWarningScore: formData.earlyWarningScore ? parseInt(formData.earlyWarningScore, 10) : null,
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        storage.createPatient(newPatient);
        router.push(`/patients/${newPatient.id}`);
      } else if (patient) {
        const updatedPatient = storage.updatePatient(patient.id, {
          nhsNumber: formData.nhsNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          ward: formData.ward,
          bedNumber: formData.bedNumber,
          consultant: formData.consultant,
          admissionDate: formData.admissionDate,
          diagnosis: formData.diagnosis,
          allergies: formData.allergies,
          resuscitationStatus: formData.resuscitationStatus,
          earlyWarningScore: formData.earlyWarningScore ? parseInt(formData.earlyWarningScore, 10) : null,
        });
        if (updatedPatient) {
          router.push(`/patients/${updatedPatient.id}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nhsNumber" className="block text-sm font-medium text-gray-700 mb-1">
              NHS Number *
            </label>
            <input
              type="text"
              id="nhsNumber"
              name="nhsNumber"
              value={formData.nhsNumber}
              onChange={handleChange}
              required
              placeholder="000 0000 000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ward Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
              Ward *
            </label>
            <select
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a ward</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={`Ward ${num}`}>Ward {num}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Bed Number *
            </label>
            <input
              type="text"
              id="bedNumber"
              name="bedNumber"
              value={formData.bedNumber}
              onChange={handleChange}
              required
              placeholder="e.g., 12"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="consultant" className="block text-sm font-medium text-gray-700 mb-1">
              Consultant *
            </label>
            <input
              type="text"
              id="consultant"
              name="consultant"
              value={formData.consultant}
              onChange={handleChange}
              required
              placeholder="e.g., Dr Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">
              Admission Date *
            </label>
            <input
              type="date"
              id="admissionDate"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Clinical Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Primary diagnosis and relevant conditions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <input
              type="text"
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any known allergies or NKDA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resuscitationStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Resuscitation Status *
              </label>
              <select
                id="resuscitationStatus"
                name="resuscitationStatus"
                value={formData.resuscitationStatus}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Full">Full Resuscitation</option>
                <option value="DNACPR">DNACPR</option>
                <option value="Not Discussed">Not Discussed</option>
              </select>
            </div>

            <div>
              <label htmlFor="earlyWarningScore" className="block text-sm font-medium text-gray-700 mb-1">
                NEWS Score
              </label>
              <input
                type="number"
                id="earlyWarningScore"
                name="earlyWarningScore"
                value={formData.earlyWarningScore}
                onChange={handleChange}
                min="0"
                max="20"
                placeholder="0-20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Add Patient' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
