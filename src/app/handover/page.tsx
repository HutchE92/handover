'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HandoverNote, Patient, getNewsScoreColor, getResusStatusColor, formatNhsNumber, calculateAge, HaNPriority, HaNReviewRole, HaNReviewDate, HospitalAtNightEntry, HaNComment, HaNReviewType } from '@/lib/types';
import HospitalAtNightModal from '@/components/HospitalAtNightModal';
import { v4 as uuidv4 } from 'uuid';

interface HandoverWithPatient extends HandoverNote {
  patient?: Patient;
}

interface PatientWithLatestHandover extends Patient {
  latestHandover?: HandoverNote;
}

const WARDS = Array.from({ length: 20 }, (_, i) => `Ward ${i + 1}`);
const BEDS_PER_WARD = 28;

// OOH Review Card Modal Component
function OohReviewModal({
  entry,
  patient,
  isOpen,
  onClose,
  onStatusChange,
  onAddComment
}: {
  entry: HospitalAtNightEntry;
  patient?: Patient;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (entryId: string, status: 'Pending' | 'Complete') => void;
  onAddComment: (entryId: string, comment: HaNComment) => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (!commentText.trim() || !commentAuthor.trim()) return;
    const newComment: HaNComment = {
      id: uuidv4(),
      text: commentText.trim(),
      createdBy: commentAuthor.trim(),
      createdAt: new Date().toISOString()
    };
    onAddComment(entry.id, newComment);
    setCommentText('');
    setCommentAuthor('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">OOH Review Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Patient Info */}
          {patient && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-bold text-gray-900">{patient.lastName}, {patient.firstName}</div>
              <div className="text-sm text-gray-600">
                {patient.ward} - Bed {patient.bedNumber} | NHS: {formatNhsNumber(patient.nhsNumber)}
              </div>
            </div>
          )}

          {/* Priority & Status */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(entry.priority)}`}>
              {entry.priority} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              entry.reviewStatus === 'Pending'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
              {entry.reviewStatus}
            </span>
          </div>

          {/* Assigned Roles */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Assigned To</div>
            <div className="flex flex-wrap gap-1">
              {entry.assignedRoles.map(role => (
                <span key={role} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Review Dates */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Review Dates</div>
            <div className="flex flex-wrap gap-2">
              {entry.reviewDates.map((rd, idx) => (
                <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                  rd.completedAt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {new Date(rd.date).toLocaleDateString()}
                  {rd.completedAt && ' ✓'}
                </span>
              ))}
            </div>
          </div>

          {/* Reason for Review */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Reason for Review</div>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{entry.reasonForReview}</p>
          </div>

          {/* Comments Section */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Comments ({entry.comments?.length || 0})</div>
            {entry.comments && entry.comments.length > 0 ? (
              <div className="space-y-2 mb-3">
                {entry.comments
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(comment.createdAt).toLocaleString()} - {comment.createdBy}
                      </div>
                      <div className="text-gray-800">{comment.text}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No comments yet</p>
            )}
            {/* Add Comment Form */}
            <div className="space-y-2 border-t pt-3">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || !commentAuthor.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            Created by {entry.createdBy} on {new Date(entry.createdAt).toLocaleString()}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            {entry.reviewStatus === 'Pending' ? (
              <button
                onClick={() => onStatusChange(entry.id, 'Complete')}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Mark Complete
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(entry.id, 'Pending')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
              >
                Reopen Review
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HandoverListPage() {
  const [handovers, setHandovers] = useState<HandoverWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [oohEntries, setOohEntries] = useState<HospitalAtNightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [defaultWard, setDefaultWard] = useState<string>('');
  const [filterHighNews, setFilterHighNews] = useState(false);
  const [hanModalPatient, setHanModalPatient] = useState<PatientWithLatestHandover | null>(null);
  const [selectedOohEntry, setSelectedOohEntry] = useState<HospitalAtNightEntry | null>(null);

  const handleHaNSubmit = async (data: {
    reviewDates: HaNReviewDate[];
    priority: HaNPriority;
    assignedRoles: HaNReviewRole[];
    reasonForReview: string;
    createdBy: string;
    reviewType: HaNReviewType;
  }) => {
    if (!hanModalPatient) return;

    const response = await fetch('/api/hospital-at-night', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: hanModalPatient.id,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit');
    }

    setHanModalPatient(null);
    // Refresh OOH entries after creating a new one
    const oohRes = await fetch('/api/hospital-at-night');
    if (oohRes.ok) {
      const oohData = await oohRes.json();
      setOohEntries((oohData.entries || []).map((e: HospitalAtNightEntry) => ({
        ...e,
        comments: e.comments || []
      })));
    }
  };

  // Handle OOH status change
  const handleOohStatusChange = async (entryId: string, status: 'Pending' | 'Complete') => {
    try {
      const response = await fetch(`/api/hospital-at-night/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus: status,
          statusChangedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setOohEntries(prev => prev.map(e => e.id === entryId ? { ...updated, comments: updated.comments || [] } : e));
        if (selectedOohEntry?.id === entryId) {
          setSelectedOohEntry({ ...updated, comments: updated.comments || [] });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle adding comment to OOH entry
  const handleOohAddComment = async (entryId: string, comment: HaNComment) => {
    const entry = oohEntries.find(e => e.id === entryId);
    if (!entry) return;

    const updatedComments = [...(entry.comments || []), comment];

    try {
      const response = await fetch(`/api/hospital-at-night/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updatedComments })
      });

      if (response.ok) {
        const updated = await response.json();
        setOohEntries(prev => prev.map(e => e.id === entryId ? { ...updated, comments: updated.comments || [] } : e));
        if (selectedOohEntry?.id === entryId) {
          setSelectedOohEntry({ ...updated, comments: updated.comments || [] });
        }
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Helper to get pending OOH entry for a patient
  const getPendingOohEntry = (patientId: string): HospitalAtNightEntry | undefined => {
    return oohEntries.find(e => e.patientId === patientId && e.reviewStatus === 'Pending');
  };

  // Load default ward from localStorage on mount
  useEffect(() => {
    const savedDefaultWard = localStorage.getItem('defaultWard');
    if (savedDefaultWard) {
      setDefaultWard(savedDefaultWard);
      setSelectedWard(savedDefaultWard);
    }
  }, []);

  // Save default ward to localStorage when it changes
  const handleSetDefaultWard = (ward: string) => {
    setDefaultWard(ward);
    if (ward) {
      localStorage.setItem('defaultWard', ward);
      setSelectedWard(ward);
    } else {
      localStorage.removeItem('defaultWard');
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [handoversRes, patientsRes, oohRes] = await Promise.all([
          fetch('/api/handover'),
          fetch('/api/patients'),
          fetch('/api/hospital-at-night')
        ]);

        if (!handoversRes.ok || !patientsRes.ok || !oohRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const handoversData = await handoversRes.json();
        const patientsData = await patientsRes.json();
        const oohData = await oohRes.json();

        const patientsList: Patient[] = patientsData.patients || [];
        const handoversList: HandoverNote[] = handoversData.handoverNotes || [];
        const oohList: HospitalAtNightEntry[] = (oohData.entries || []).map((e: HospitalAtNightEntry) => ({
          ...e,
          comments: e.comments || []
        }));

        // Merge patient data into handovers
        const handoversWithPatients = handoversList.map(h => ({
          ...h,
          patient: patientsList.find(p => p.id === h.patientId)
        }));

        setHandovers(handoversWithPatients);
        setPatients(patientsList);
        setOohEntries(oohList);
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
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Default Ward:</label>
          <select
            value={defaultWard}
            onChange={(e) => handleSetDefaultWard(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {WARDS.map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
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
                      {/* Active OOH Review Indicator */}
                      {getPendingOohEntry(patient.id) && (
                        <button
                          onClick={() => setSelectedOohEntry(getPendingOohEntry(patient.id)!)}
                          className="mt-2 flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded text-xs font-medium hover:bg-purple-200 transition-colors print:hidden"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Active OOH Review
                        </button>
                      )}
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
                      <Link href={`/handover/new/${patient.id}`} className="p-3 hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                          <span className="text-xs font-semibold text-blue-700">Situation</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.situation}</p>
                      </Link>

                      {/* Background */}
                      <Link href={`/handover/new/${patient.id}`} className="p-3 hover:bg-green-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                          <span className="text-xs font-semibold text-green-700">Background</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.background}</p>
                      </Link>

                      {/* Assessment */}
                      <Link href={`/handover/new/${patient.id}`} className="p-3 hover:bg-amber-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                          <span className="text-xs font-semibold text-amber-700">Assessment</span>
                        </div>
                        <p className="text-sm text-gray-700">{patient.latestHandover.assessment}</p>
                      </Link>

                      {/* Recommendation */}
                      <div className="p-3 flex flex-col">
                        <Link href={`/handover/new/${patient.id}`} className="hover:bg-red-50 cursor-pointer transition-colors flex-1 -m-3 p-3 mb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-100 text-red-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                            <span className="text-xs font-semibold text-red-700">Recommendation</span>
                          </div>
                          <p className="text-sm text-gray-700">{patient.latestHandover.recommendation}</p>
                        </Link>
                        <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-200">
                          <div className="text-xs text-gray-600 font-medium">{patient.latestHandover.createdBy}</div>
                          <div className="text-xs text-gray-500">{patient.latestHandover.shiftType} • {new Date(patient.latestHandover.shiftDate).toLocaleDateString()}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setHanModalPatient(patient);
                          }}
                          className="mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded border border-purple-300 text-xs font-medium hover:bg-purple-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Refer to OOH
                        </button>
                      </div>
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

      {/* Hospital at Night Modal */}
      {hanModalPatient && (
        <HospitalAtNightModal
          patient={hanModalPatient}
          isOpen={true}
          onClose={() => setHanModalPatient(null)}
          onSubmit={handleHaNSubmit}
        />
      )}

      {/* OOH Review Details Modal */}
      {selectedOohEntry && (
        <OohReviewModal
          entry={selectedOohEntry}
          patient={patients.find(p => p.id === selectedOohEntry.patientId)}
          isOpen={true}
          onClose={() => setSelectedOohEntry(null)}
          onStatusChange={handleOohStatusChange}
          onAddComment={handleOohAddComment}
        />
      )}
    </div>
  );
}
