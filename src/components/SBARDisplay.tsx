'use client';

import { HandoverNote, Patient, formatNhsNumber, calculateAge } from '@/lib/types';

interface SBARDisplayProps {
  note: HandoverNote;
  patient?: Patient;
  showPatientHeader?: boolean;
}

export default function SBARDisplay({ note, patient, showPatientHeader = true }: SBARDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden print:shadow-none print:rounded-none">
      {showPatientHeader && patient && (
        <div className="bg-blue-900 text-white p-4 print:bg-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">
                {patient.lastName}, {patient.firstName}
              </h2>
              <p className="text-blue-200 print:text-gray-300">
                NHS: {formatNhsNumber(patient.nhsNumber)} | DOB: {formatDate(patient.dateOfBirth)} (Age {calculateAge(patient.dateOfBirth)})
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Ward {patient.ward} | Bed {patient.bedNumber}</p>
              <p className="text-blue-200 print:text-gray-300 text-sm">{patient.consultant}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 border-b print:bg-white">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">Handover by:</span>{' '}
            <span className="font-medium">{note.createdBy}</span>
          </div>
          <div>
            <span className="text-gray-500">Shift:</span>{' '}
            <span className="font-medium">{note.shiftType} - {formatDate(note.shiftDate)}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>{' '}
            <span className="font-medium">{formatDateTime(note.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold">S</span>
            Situation
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">{note.situation}</p>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
            <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold">B</span>
            Background
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">{note.background}</p>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-amber-700 mb-2 flex items-center">
            <span className="bg-amber-100 text-amber-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold">A</span>
            Assessment
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">{note.assessment}</p>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center">
            <span className="bg-red-100 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold">R</span>
            Recommendation
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">{note.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
