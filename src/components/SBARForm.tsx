'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patient, ShiftType, HandoverNote } from '@/lib/types';

interface SBARFormProps {
  patient: Patient;
  previousHandover?: HandoverNote | null;
}

const SBAR_GUIDANCE = {
  situation: [
    "What is the current issue or concern?",
    "Why are you handing over this patient?",
    "What has changed recently?"
  ],
  background: [
    "Relevant medical history",
    "Current medications and treatments",
    "Recent test results or investigations",
    "Significant events during this admission"
  ],
  assessment: [
    "Current vital signs and observations",
    "Physical assessment findings",
    "Current clinical status",
    "Pain levels and symptom control"
  ],
  recommendation: [
    "What actions are needed?",
    "What to monitor or escalate?",
    "Outstanding tasks or investigations",
    "Planned discharge or transfer information"
  ]
};

export default function SBARForm({ patient, previousHandover }: SBARFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitialFormData = () => ({
    createdBy: '',
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: 'Day' as ShiftType,
    situation: previousHandover?.situation || '',
    background: previousHandover?.background || '',
    assessment: previousHandover?.assessment || '',
    recommendation: previousHandover?.recommendation || '',
  });

  const [formData, setFormData] = useState(getInitialFormData);

  const handleClearData = () => {
    setFormData({
      createdBy: formData.createdBy, // Keep the user's name
      shiftDate: new Date().toISOString().split('T')[0],
      shiftType: 'Day' as ShiftType,
      situation: '',
      background: '',
      assessment: '',
      recommendation: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: patient.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create handover note');
      }

      const savedNote = await response.json();
      router.push(`/handover/${savedNote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderGuidance = (section: keyof typeof SBAR_GUIDANCE) => (
    <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
      {SBAR_GUIDANCE[section].map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-blue-900">
              Patient: {patient.lastName}, {patient.firstName}
            </h3>
            <p className="text-sm text-blue-700">
              Ward {patient.ward} | Bed {patient.bedNumber} | {patient.diagnosis}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearData}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-blue-100 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Data
          </button>
        </div>
        {previousHandover && (
          <p className="text-xs text-blue-600 mt-2">
            Pre-populated from previous handover ({new Date(previousHandover.createdAt).toLocaleDateString()})
          </p>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Handover Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="createdBy"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              required
              placeholder="e.g., Nurse Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="shiftDate" className="block text-sm font-medium text-gray-700 mb-1">
              Shift Date *
            </label>
            <input
              type="date"
              id="shiftDate"
              name="shiftDate"
              value={formData.shiftDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700 mb-1">
              Shift Type *
            </label>
            <select
              id="shiftType"
              name="shiftType"
              value={formData.shiftType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
              <option value="Long Day">Long Day</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          <span className="text-blue-600">S</span>BAR - Situation
        </h2>
        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-gray-700 mb-1">
            Current situation and reason for handover *
          </label>
          {renderGuidance('situation')}
          <textarea
            id="situation"
            name="situation"
            value={formData.situation}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the current situation..."
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          S<span className="text-blue-600">B</span>AR - Background
        </h2>
        <div>
          <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
            Relevant history and context *
          </label>
          {renderGuidance('background')}
          <textarea
            id="background"
            name="background"
            value={formData.background}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Provide relevant background information..."
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          SB<span className="text-blue-600">A</span>R - Assessment
        </h2>
        <div>
          <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-1">
            Clinical assessment and current status *
          </label>
          {renderGuidance('assessment')}
          <textarea
            id="assessment"
            name="assessment"
            value={formData.assessment}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Document your clinical assessment..."
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          SBA<span className="text-blue-600">R</span> - Recommendation
        </h2>
        <div>
          <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 mb-1">
            Actions needed and plan *
          </label>
          {renderGuidance('recommendation')}
          <textarea
            id="recommendation"
            name="recommendation"
            value={formData.recommendation}
            onChange={handleChange}
            required
            rows={4}
            placeholder="List recommendations and outstanding tasks..."
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
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
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Handover Note'}
        </button>
      </div>
    </form>
  );
}
