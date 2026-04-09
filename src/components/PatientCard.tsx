'use client';

import Link from 'next/link';
import { Patient, getNewsScoreColor, getResusStatusColor, formatNhsNumber, calculateAge } from '@/lib/types';

interface PatientCardProps {
  patient: Patient;
  showActions?: boolean;
}

export default function PatientCard({ patient, showActions = true }: PatientCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {patient.lastName}, {patient.firstName}
          </h3>
          <p className="text-sm text-gray-500">
            NHS: {formatNhsNumber(patient.nhsNumber)} | Age: {calculateAge(patient.dateOfBirth)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResusStatusColor(patient.resuscitationStatus)}`}>
            {patient.resuscitationStatus}
          </span>
          {patient.earlyWarningScore !== null && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNewsScoreColor(patient.earlyWarningScore)}`}>
              NEWS: {patient.earlyWarningScore}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Ward:</span>{' '}
          <span className="font-medium">{patient.ward}</span>
        </div>
        <div>
          <span className="text-gray-500">Bed:</span>{' '}
          <span className="font-medium">{patient.bedNumber}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Diagnosis:</span>{' '}
          <span className="font-medium">{patient.diagnosis}</span>
        </div>
        {patient.allergies && (
          <div className="col-span-2">
            <span className="text-red-600 font-medium">Allergies:</span>{' '}
            <span className="text-red-700">{patient.allergies}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex space-x-2 pt-3 border-t border-gray-100">
          <Link
            href={`/patients/${patient.id}`}
            className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/handover/new/${patient.id}`}
            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create Handover
          </Link>
        </div>
      )}
    </div>
  );
}
