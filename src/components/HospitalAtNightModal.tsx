'use client';

import { useState } from 'react';
import { Patient, HaNPriority, HaNReviewRole, HaNReviewDate, HaNReviewType, HaNSpecialty } from '@/lib/types';

interface HospitalAtNightModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reviewDates: HaNReviewDate[];
    priority: HaNPriority;
    assignedRoles: HaNReviewRole[];
    reasonForReview: string;
    createdBy: string;
    reviewType: HaNReviewType;
    specialty: HaNSpecialty;
  }) => void;
}

const PRIORITIES: HaNPriority[] = ['High', 'Medium', 'Low'];
const ROLES: HaNReviewRole[] = ['FY1', 'SHO', 'SpR', 'Discharge', 'Nurse'];
const REVIEW_TYPES: HaNReviewType[] = ['Scheduled', 'Ad-hoc'];
const SPECIALTIES: HaNSpecialty[] = ['Medicine', 'T+O', 'General Surgery'];

export default function HospitalAtNightModal({
  patient,
  isOpen,
  onClose,
  onSubmit
}: HospitalAtNightModalProps) {
  const [reviewDates, setReviewDates] = useState<HaNReviewDate[]>([
    { date: new Date().toISOString().split('T')[0] }
  ]);
  const [priority, setPriority] = useState<HaNPriority | ''>('');
  const [assignedRoles, setAssignedRoles] = useState<HaNReviewRole[]>([]);
  const [reasonForReview, setReasonForReview] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [specialty, setSpecialty] = useState<HaNSpecialty | ''>('');
  const [reviewType, setReviewType] = useState<HaNReviewType>('Scheduled');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReviewTypeChange = (type: HaNReviewType) => {
    setReviewType(type);
    // If selecting Ad-hoc, auto-set today's date
    if (type === 'Ad-hoc') {
      setReviewDates([{ date: new Date().toISOString().split('T')[0] }]);
    }
  };

  if (!isOpen) return null;

  const handleAddDate = () => {
    setReviewDates([...reviewDates, { date: '' }]);
  };

  const handleRemoveDate = (index: number) => {
    if (reviewDates.length > 1) {
      setReviewDates(reviewDates.filter((_, i) => i !== index));
    }
  };

  const handleDateChange = (index: number, value: string) => {
    const updated = [...reviewDates];
    updated[index] = { ...updated[index], date: value };
    setReviewDates(updated);
  };

  const handleRoleToggle = (role: HaNReviewRole) => {
    if (assignedRoles.includes(role)) {
      setAssignedRoles(assignedRoles.filter(r => r !== role));
    } else {
      setAssignedRoles([...assignedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!priority) {
      setError('Please select a priority');
      return;
    }
    if (assignedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }
    if (!reasonForReview.trim()) {
      setError('Please provide a reason for review');
      return;
    }
    if (!createdBy.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!specialty) {
      setError('Please select a specialty');
      return;
    }
    const validDates = reviewDates.filter(d => d.date);
    if (validDates.length === 0) {
      setError('Please add at least one review date');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        reviewDates: validDates,
        priority,
        assignedRoles,
        reasonForReview,
        createdBy,
        reviewType,
        specialty
      });
      // Reset form
      setReviewDates([{ date: new Date().toISOString().split('T')[0] }]);
      setPriority('');
      setAssignedRoles([]);
      setReasonForReview('');
      setReviewType('Scheduled');
      setSpecialty('');
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
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Hospital Out Of Hours</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              {patient.lastName}, {patient.firstName} - {patient.ward}, Bed {patient.bedNumber}
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
                placeholder="e.g., Nurse Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty *
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <label
                    key={s}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      specialty === s
                        ? 'bg-purple-100 border-purple-400 text-purple-800'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="specialty"
                      value={s}
                      checked={specialty === s}
                      onChange={() => setSpecialty(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Review Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review *
              </label>
              <div className="flex flex-wrap gap-2">
                {REVIEW_TYPES.map(type => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      reviewType === type
                        ? type === 'Scheduled'
                          ? 'bg-blue-100 border-blue-400 text-blue-800'
                          : 'bg-orange-100 border-orange-400 text-orange-800'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewType"
                      value={type}
                      checked={reviewType === type}
                      onChange={() => handleReviewTypeChange(type)}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Review Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date(s) to be Reviewed *
              </label>
              <div className="space-y-2">
                {reviewDates.map((rd, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={rd.date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {reviewDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddDate}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add another date
              </button>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map(p => (
                  <label
                    key={p}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      priority === p
                        ? p === 'High' ? 'bg-red-100 border-red-400 text-red-800'
                        : p === 'Medium' ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : p === 'Low' ? 'bg-green-100 border-green-400 text-green-800'
                        : 'bg-blue-100 border-blue-400 text-blue-800'
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

            {/* Assigned Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To be Reviewed By *
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => (
                  <label
                    key={role}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      assignedRoles.includes(role)
                        ? 'bg-purple-100 border-purple-400 text-purple-800'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={assignedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="sr-only"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            {/* Reason for Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Review *
              </label>
              <textarea
                value={reasonForReview}
                onChange={(e) => setReasonForReview(e.target.value)}
                rows={4}
                placeholder="Describe the reason for review and any specific concerns..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
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
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
