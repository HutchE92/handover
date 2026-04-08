'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HospitalAtNightEntry,
  HaNPriority,
  SpecialtyReferral,
  ReferralStatus,
  ReferralPriority,
  PatientTask,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  getResusStatusColor
} from '@/lib/types';
import { usePatient, useHandoverNotes, useHospitalAtNightByPatient, useSpecialtyReferralsByPatient, useTasksByPatient } from '@/lib/useData';
import * as storage from '@/lib/localStorage';
import { useState } from 'react';
import { usePatientId } from '@/lib/useRouteParams';

export default function PatientDetailClient() {
  const router = useRouter();
  const patientId = usePatientId();

  const { patient, loading: patientLoading } = usePatient(patientId);
  const { notes: handovers, loading: handoversLoading } = useHandoverNotes(patientId);
  const { entries: oohEntries, loading: oohLoading } = useHospitalAtNightByPatient(patientId);
  const { referrals: referralEntries, loading: referralsLoading } = useSpecialtyReferralsByPatient(patientId);
  const { tasks: taskEntries, loading: tasksLoading } = useTasksByPatient(patientId);

  const [discharging, setDischarging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showActiveTasks, setShowActiveTasks] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [showHandoverHistory, setShowHandoverHistory] = useState(false);
  const [showOohHistory, setShowOohHistory] = useState(false);
  const [showReferralHistory, setShowReferralHistory] = useState(false);
  const [referralCommentsEntry, setReferralCommentsEntry] = useState<SpecialtyReferral | null>(null);

  const loading = patientLoading || handoversLoading || oohLoading || referralsLoading || tasksLoading;

  const handleDischarge = () => {
    if (!patient || !confirm('Are you sure you want to discharge this patient?')) {
      return;
    }

    setDischarging(true);
    storage.dischargePatient(patient.id);
    router.push('/patients');
  };

  const handleDelete = () => {
    if (!patient || !confirm('Are you sure you want to permanently delete this patient? This action cannot be undone and will also delete all associated handover notes.')) {
      return;
    }

    setDeleting(true);
    storage.deletePatient(patient.id);
    router.push('/patients');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Patient not found
        </div>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Back
        </button>
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

      {/* Active Tasks */}
      {(() => {
        const activeTasks = taskEntries.filter(t => t.status === 'New' || t.status === 'In Progress');
        return (
          <div id="active-tasks" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowActiveTasks(!showActiveTasks)}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${showActiveTasks ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Active Tasks
                  <span className="text-sm font-normal text-gray-500">({activeTasks.length})</span>
                </button>
                <a href="/tasks" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View All Tasks →
                </a>
              </div>
            </div>
            {showActiveTasks && (
              <div className="divide-y divide-gray-200">
                {activeTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active tasks</p>
                ) : (
                  activeTasks
                    .sort((a, b) => {
                      const p: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
                      return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
                    })
                    .map(task => <PatientTaskCard key={task.id} task={task} />)
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Task History */}
      {(() => {
        const completedTasks = taskEntries.filter(t => t.status === 'Complete');
        return (
          <div id="task-history" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowTaskHistory(!showTaskHistory)}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${showTaskHistory ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Task History
                  <span className="text-sm font-normal text-gray-500">({completedTasks.length})</span>
                </button>
              </div>
            </div>
            {showTaskHistory && (
              <div className="divide-y divide-gray-200">
                {completedTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No completed tasks</p>
                ) : (
                  completedTasks
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map(task => <PatientTaskCard key={task.id} task={task} />)
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Handover History */}
      <div id="handover-history" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowHandoverHistory(!showHandoverHistory)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transition-transform ${showHandoverHistory ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Handover History
              <span className="text-sm font-normal text-gray-500">({handovers.length})</span>
            </button>
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
        {showHandoverHistory && (
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
        )}
      </div>

      {/* Out of Hours History */}
      <div id="ooh-history" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowOohHistory(!showOohHistory)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transition-transform ${showOohHistory ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Out of Hours History
              <span className="text-sm font-normal text-gray-500">({oohEntries.length})</span>
            </button>
            <Link
              href="/hospital-at-night"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All Out of Hours →
            </Link>
          </div>
        </div>
        {showOohHistory && (
          <div className="divide-y divide-gray-200">
            {oohEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No out of hours reviews recorded yet</p>
            ) : (
              oohEntries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(entry => (
                  <OohEntryCard key={entry.id} entry={entry} />
                ))
            )}
          </div>
        )}
      </div>

      {/* Referral History */}
      <div id="referral-history" className="bg-white rounded-lg shadow border border-gray-200 scroll-mt-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowReferralHistory(!showReferralHistory)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transition-transform ${showReferralHistory ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Referral History
              <span className="text-sm font-normal text-gray-500">({referralEntries.length})</span>
            </button>
            <Link href="/referrals" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
              View All Referrals →
            </Link>
          </div>
        </div>
        {showReferralHistory && (
          <div className="divide-y divide-gray-200">
            {referralEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No specialty referrals recorded yet</p>
            ) : (
              referralEntries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(entry => (
                  <ReferralHistoryCard
                    key={entry.id}
                    entry={entry}
                    onViewComments={() => setReferralCommentsEntry(entry)}
                  />
                ))
            )}
          </div>
        )}
      </div>

      {/* Referral comments modal */}
      {referralCommentsEntry && (
        <ReferralCommentsModal
          entry={referralCommentsEntry}
          onClose={() => setReferralCommentsEntry(null)}
        />
      )}
    </div>
  );
}

// Patient Task Card Component (read-only view for patient detail page)
function PatientTaskCard({ task }: { task: PatientTask }) {
  const priorityColors: Record<string, string> = {
    High: 'bg-red-500 text-white border-red-600',
    Medium: 'bg-amber-500 text-white border-amber-600',
    Low: 'bg-green-500 text-white border-green-600',
  };
  const statusColors: Record<string, string> = {
    New: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-300',
    Complete: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border-2 ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[task.status]}`}>
          {task.status}
        </span>
        <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5">
          {task.assignedTo.join(', ')}
        </span>
        {(task.dueDate || task.dueTime) && (
          <span className="text-xs text-gray-500">
            Due: {task.dueDate && new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{task.dueTime && ` at ${task.dueTime}`}
          </span>
        )}
        {task.comments && task.comments.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{task.taskDetails}</p>
      <div className="text-xs text-gray-400 mt-1">Created by {task.createdBy} on {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
  );
}

// Referral History Card Component
function ReferralHistoryCard({ entry, onViewComments }: { entry: SpecialtyReferral; onViewComments: () => void }) {
  const priorityColors: Record<ReferralPriority, string> = {
    High: 'bg-red-500 text-white border-red-600',
    Medium: 'bg-amber-500 text-white border-amber-600',
    Low: 'bg-green-500 text-white border-green-600',
  };
  const statusColors: Record<ReferralStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    Accepted: 'bg-green-100 text-green-800 border-green-300',
    Declined: 'bg-red-100 text-red-800 border-red-300',
    Cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">
          {new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200`}>
          {entry.specialty}
        </span>
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border-2 ${priorityColors[entry.priority]}`}>
          {entry.priority}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[entry.status]}`}>
          {entry.status}
        </span>
        {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
          <span className="text-xs text-gray-400">
            {new Date(entry.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button
          onClick={onViewComments}
          className="ml-auto flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {entry.comments?.length || 0} comment{(entry.comments?.length || 0) !== 1 ? 's' : ''}
        </button>
      </div>
      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{entry.reasonForReferral}</p>
      <div className="text-xs text-gray-400 mt-1">Referred by {entry.createdBy}</div>
    </div>
  );
}

// Referral Comments Modal
function ReferralCommentsModal({ entry, onClose }: { entry: SpecialtyReferral; onClose: () => void }) {
  const sorted = [...(entry.comments || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Comments</h3>
              <p className="text-sm text-teal-700">{entry.specialty} referral</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {sorted.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              sorted.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 text-sm">{c.createdBy}</span>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Out of Hours Entry Card Component
interface OohEntryCardProps {
  entry: HospitalAtNightEntry;
}

function OohEntryCard({ entry }: OohEntryCardProps) {
  const priorityColors: Record<HaNPriority, string> = {
    High: 'bg-red-500 text-white border-red-600',
    Medium: 'bg-amber-500 text-white border-amber-600',
    Low: 'bg-green-500 text-white border-green-600'
  };

  return (
    <div className="p-4">
      {/* Review Date Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 mb-3 flex flex-wrap items-center gap-2">
        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-purple-700">Review Date(s):</span>
        {entry.reviewDates.map((rd, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              rd.completedAt
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            {new Date(rd.date).toLocaleDateString()}
            {rd.completedAt && ' ✓'}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-md text-sm font-bold border-2 shadow-sm ${priorityColors[entry.priority]}`}>
              {entry.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              entry.reviewStatus === 'Complete'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {entry.reviewStatus}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div>
              <span className="text-gray-400">Specialty:</span>{' '}
              <span className="font-medium">{entry.specialty}</span>
            </div>
            <div>
              <span className="text-gray-400">Assigned to:</span>{' '}
              <span className="font-medium">{entry.assignedRoles.join(', ')}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Reason:</span>
              <p className="text-gray-700 mt-1">{entry.reasonForReview}</p>
            </div>
            <div className="text-xs text-gray-400">
              Added by {entry.createdBy} on {new Date(entry.createdAt).toLocaleString()}
            </div>
            {entry.reviewStatus === 'Complete' && entry.statusChangedAt && (
              <div className="text-xs text-green-600">
                Completed: {new Date(entry.statusChangedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
