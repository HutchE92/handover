'use client';

import { useState } from 'react';
import { Patient, ReferralSpecialty, ReferralPriority, REFERRAL_SPECIALTIES } from '@/lib/types';

interface SpecialtyReferralModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    specialty: ReferralSpecialty;
    priority: ReferralPriority;
    reasonForReferral: string;
    createdBy: string;
  }) => void;
}

const PRIORITIES: ReferralPriority[] = ['High', 'Medium', 'Low'];

export default function SpecialtyReferralModal({
  patient,
  isOpen,
  onClose,
  onSubmit
}: SpecialtyReferralModalProps) {
  const [specialty, setSpecialty] = useState<ReferralSpecialty | ''>('');
  const [priority, setPriority] = useState<ReferralPriority | ''>('');
  const [reasonForReferral, setReasonForReferral] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!createdBy.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!specialty) {
      setError('Please select a specialty');
      return;
    }
    if (!priority) {
      setError('Please select a priority');
      return;
    }
    if (!reasonForReferral.trim()) {
      setError('Please provide a reason for referral');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ specialty, priority, reasonForReferral, createdBy });
      setSpecialty('');
      setPriority('');
      setReasonForReferral('');
      setCreatedBy('');
      onClose();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Refer to Speciality</h2>
              <button onClick={onClose} className="text-white hover:text-teal-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-teal-100 text-sm mt-1">
              {patient.lastName}, {patient.firstName} — {patient.ward}, Bed {patient.bedNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="e.g., Dr. Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referring to *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as ReferralSpecialty)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">Select a speciality...</option>
                {REFERRAL_SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <label
                    key={p}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      priority === p
                        ? p === 'High' ? 'bg-red-100 border-red-400 text-red-800'
                        : p === 'Medium' ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-green-100 border-green-400 text-green-800'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      className="sr-only"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            {/* Reason for Referral */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Referral *
              </label>
              <textarea
                value={reasonForReferral}
                onChange={(e) => setReasonForReferral(e.target.value)}
                rows={5}
                placeholder="Describe the reason for referral, relevant clinical findings, and any specific questions for the receiving team..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Referral'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
