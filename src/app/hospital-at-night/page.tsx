'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import {
  HospitalAtNightWithPatient,
  HaNReviewRole,
  HaNReviewStatus,
  HaNReviewDate,
  HaNPriority,
  HaNComment,
  HaNReviewType,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  HospitalAtNightEntry
} from '@/lib/types';
import { usePatients, useHospitalAtNight } from '@/lib/useData';
import * as storage from '@/lib/localStorage';

type TabType = 'dashboard' | 'patients';
type SortOption = 'priority' | 'oldest' | 'newest';
const ROLES: HaNReviewRole[] = ['FY1', 'SHO', 'SpR', 'Discharge', 'Nurse'];
const REVIEW_TYPES: HaNReviewType[] = ['Scheduled', 'Ad-hoc'];
const PRIORITY_ORDER: Record<HaNPriority, number> = { High: 0, Medium: 1, Low: 2 };

// Completion modal for multiple dates
interface CompletionModalProps {
  isOpen: boolean;
  reviewDates: HaNReviewDate[];
  onClose: () => void;
  onCompleteAll: () => void;
  onCompleteToday: () => void;
}

function CompletionModal({ isOpen, reviewDates, onClose, onCompleteAll, onCompleteToday }: CompletionModalProps) {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todaysDate = reviewDates.find(rd => rd.date === today);
  const futureDates = reviewDates.filter(rd => rd.date > today && !rd.completedAt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Review</h3>
          <p className="text-gray-600 mb-4">
            This patient has multiple review dates scheduled. Would you like to:
          </p>
          <div className="space-y-3">
            <button
              onClick={onCompleteToday}
              className="w-full px-4 py-3 bg-purple-100 text-purple-800 rounded-lg text-left hover:bg-purple-200 transition-colors"
            >
              <div className="font-medium">Complete today&apos;s review only</div>
              <div className="text-sm text-purple-600">
                {todaysDate ? `Mark ${new Date(todaysDate.date).toLocaleDateString()} as complete` : 'Mark current review as complete'}
                {futureDates.length > 0 && ` (${futureDates.length} future review${futureDates.length > 1 ? 's' : ''} will remain pending)`}
              </div>
            </button>
            <button
              onClick={onCompleteAll}
              className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg text-left hover:bg-green-200 transition-colors"
            >
              <div className="font-medium">Complete all reviews</div>
              <div className="text-sm text-green-600">
                Mark all {reviewDates.length} scheduled dates as complete
              </div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Comment Modal
interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string; createdBy: string }) => void;
}

function AddCommentModal({ isOpen, onClose, onSubmit }: AddCommentModalProps) {
  const [text, setText] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter a comment');
      return;
    }
    if (!createdBy.trim()) {
      setError('Please enter your name');
      return;
    }
    onSubmit({ text: text.trim(), createdBy: createdBy.trim() });
    setText('');
    setCreatedBy('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add Comment</h3>
          <div className="text-sm text-gray-500 mb-4">
            {new Date().toLocaleString()}
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="e.g., Dr. Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Enter your comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View All Comments Modal
interface ViewAllCommentsModalProps {
  isOpen: boolean;
  comments: HaNComment[];
  onClose: () => void;
}

function ViewAllCommentsModal({ isOpen, comments, onClose }: ViewAllCommentsModalProps) {
  if (!isOpen) return null;

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">All Comments ({comments.length})</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {sortedComments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              sortedComments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 text-sm">{comment.createdBy}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalAtNightPage() {
  const { patients, loading: patientsLoading } = usePatients(true);
  const { entries: rawEntries, loading: entriesLoading, refresh: refreshEntries } = useHospitalAtNight();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Filters
  const [roleFilter, setRoleFilter] = useState<HaNReviewRole[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<HaNReviewStatus[]>([]);
  const [wardFilter, setWardFilter] = useState<string[]>([]);
  const [reviewTypeFilter, setReviewTypeFilter] = useState<HaNReviewType[]>([]);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('priority');

  // Toggle states for showing handovers
  const [expandedHandovers, setExpandedHandovers] = useState<Set<string>>(new Set());

  const loading = patientsLoading || entriesLoading;

  // Merge patient data into entries
  const entries: HospitalAtNightWithPatient[] = rawEntries.map(entry => ({
    ...entry,
    patient: patients.find(p => p.id === entry.patientId),
    latestHandover: storage.getLatestHandoverForPatient(entry.patientId)
  }));

  const handleStatusChange = useCallback((entryId: string, newStatus: HaNReviewStatus, completeTodayOnly?: boolean) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    let updatedReviewDates = entry.reviewDates;
    let finalStatus = newStatus;

    if (newStatus === 'Complete' && completeTodayOnly) {
      // Mark only today's (or earliest incomplete) date as complete
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      updatedReviewDates = entry.reviewDates.map(rd => {
        if (rd.date <= today && !rd.completedAt) {
          return { ...rd, completedAt: now };
        }
        return rd;
      });

      // Check if there are still pending dates
      const hasPendingDates = updatedReviewDates.some(rd => !rd.completedAt);
      finalStatus = hasPendingDates ? 'Pending' : 'Complete';
    } else if (newStatus === 'Complete') {
      // Mark all dates as complete
      const now = new Date().toISOString();
      updatedReviewDates = entry.reviewDates.map(rd => ({
        ...rd,
        completedAt: rd.completedAt || now
      }));
    } else {
      // Revert to pending - clear all completedAt
      updatedReviewDates = entry.reviewDates.map(rd => ({
        ...rd,
        completedAt: undefined
      }));
    }

    storage.updateHospitalAtNightEntry(entryId, {
      reviewStatus: finalStatus,
      reviewDates: updatedReviewDates,
      statusChangedAt: finalStatus === 'Complete' ? new Date().toISOString() : null
    });
    refreshEntries();
  }, [entries, refreshEntries]);

  const handleReassign = useCallback((entryId: string, newRoles: HaNReviewRole[]) => {
    storage.updateHospitalAtNightEntry(entryId, { assignedRoles: newRoles });
    refreshEntries();
  }, [refreshEntries]);

  const toggleHandover = (entryId: string) => {
    const newExpanded = new Set(expandedHandovers);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedHandovers(newExpanded);
  };

  const handleAddComment = useCallback((entryId: string, comment: { text: string; createdBy: string }) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const newComment: HaNComment = {
      id: uuidv4(),
      text: comment.text,
      createdBy: comment.createdBy,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(entry.comments || []), newComment];
    storage.updateHospitalAtNightEntry(entryId, { comments: updatedComments });
    refreshEntries();
  }, [entries, refreshEntries]);

  // Get unique wards from entries - sort numerically
  const availableWards = [...new Set(entries.map(e => e.patient?.ward).filter(Boolean))]
    .sort((a, b) => {
      // Extract numbers from ward names like "Ward 1", "Ward 10", etc.
      const matchA = (a as string).match(/\d+/);
      const matchB = (b as string).match(/\d+/);
      const numA = matchA ? parseInt(matchA[0], 10) : NaN;
      const numB = matchB ? parseInt(matchB[0], 10) : NaN;
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return (a as string).localeCompare(b as string);
    }) as string[];

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Role filter
    if (roleFilter.length > 0) {
      if (!entry.assignedRoles.some(role => roleFilter.includes(role))) {
        return false;
      }
    }
    // Date filter
    if (dateFilter) {
      if (!entry.reviewDates.some(rd => rd.date === dateFilter)) {
        return false;
      }
    }
    // Status filter
    if (statusFilter.length > 0) {
      if (!statusFilter.includes(entry.reviewStatus)) {
        return false;
      }
    }
    // Ward filter
    if (wardFilter.length > 0) {
      if (!entry.patient?.ward || !wardFilter.includes(entry.patient.ward)) {
        return false;
      }
    }
    // Review type filter
    if (reviewTypeFilter.length > 0) {
      if (!reviewTypeFilter.includes(entry.reviewType || 'Scheduled')) {
        return false;
      }
    }
    return true;
  });

  // Sort filtered entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortOption) {
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Dashboard stats
  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.reviewStatus === 'Pending').length,
    complete: entries.filter(e => e.reviewStatus === 'Complete').length,
    byRole: ROLES.reduce((acc, role) => {
      acc[role] = entries.filter(e =>
        e.assignedRoles.includes(role) && e.reviewStatus === 'Pending'
      ).length;
      return acc;
    }, {} as Record<HaNReviewRole, number>)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Hospital Out Of Hours
          </h1>
          <p className="text-gray-500">Manage out-of-hours patient reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'patients'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patients
            </button>
          </nav>
          {activeTab === 'patients' && (
            <div className="bg-white rounded-lg border border-purple-200 shadow-sm px-5 py-2 text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patients for Review</div>
              <div className="text-2xl font-bold text-purple-600">{filteredEntries.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Total Patients</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Waiting to be Seen</div>
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Reviews Complete</div>
              <div className="text-3xl font-bold text-green-600">{stats.complete}</div>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* By Role */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Reviews by Role</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setRoleFilter([role]);
                    setStatusFilter(['Pending']);
                    setActiveTab('patients');
                  }}
                  className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100 hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
                >
                  <div className="text-2xl font-bold text-purple-700">{stats.byRole[role]}</div>
                  <div className="text-sm text-purple-600">{role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick View of High Priority */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">High Priority Patients</h3>
            {entries.filter(e => e.priority === 'High' && e.reviewStatus === 'Pending').length === 0 ? (
              <p className="text-gray-500 text-sm">No high priority patients pending</p>
            ) : (
              <div className="space-y-2">
                {entries
                  .filter(e => e.priority === 'High' && e.reviewStatus === 'Pending')
                  .map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {entry.patient?.lastName}, {entry.patient?.firstName}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {entry.patient?.ward} - Bed {entry.patient?.bedNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          High
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.assignedRoles.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          {/* Filters - Sticky */}
          <div className="sticky top-0 z-10 bg-gray-100 py-4 -mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="bg-blue-50 rounded-lg shadow border border-blue-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-6 items-start">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                    <div className="flex flex-wrap gap-1">
                      {ROLES.map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            if (roleFilter.includes(role)) {
                              setRoleFilter(roleFilter.filter(r => r !== role));
                            } else {
                              setRoleFilter([...roleFilter, role]);
                            }
                          }}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            roleFilter.includes(role)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Review</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <div className="flex gap-1">
                      {(['Pending', 'Complete'] as HaNReviewStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            if (statusFilter.includes(status)) {
                              setStatusFilter(statusFilter.filter(s => s !== status));
                            } else {
                              setStatusFilter([...statusFilter, status]);
                            }
                          }}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            statusFilter.includes(status)
                              ? status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ward Filter - Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ward</label>
                    <button
                      onClick={() => setShowWardDropdown(!showWardDropdown)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 ${
                        wardFilter.length > 0
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {wardFilter.length === 0 ? 'All Wards' : `${wardFilter.length} selected`}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Ward Dropdown Popup */}
                    {showWardDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowWardDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[280px] max-h-[320px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Select Wards</span>
                            <button
                              onClick={() => setWardFilter([])}
                              className="text-xs text-purple-600 hover:text-purple-700"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {availableWards.map(ward => (
                              <label
                                key={ward}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                                  wardFilter.includes(ward)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={wardFilter.includes(ward)}
                                  onChange={() => {
                                    if (wardFilter.includes(ward)) {
                                      setWardFilter(wardFilter.filter(w => w !== ward));
                                    } else {
                                      setWardFilter([...wardFilter, ward]);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{ward}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => setShowWardDropdown(false)}
                              className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Review Type Filter - next to Ward filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Review Type</label>
                    <div className="flex gap-1">
                      {REVIEW_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            if (reviewTypeFilter.includes(type)) {
                              setReviewTypeFilter(reviewTypeFilter.filter(t => t !== type));
                            } else {
                              setReviewTypeFilter([...reviewTypeFilter, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            reviewTypeFilter.includes(type)
                              ? type === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters - Right Side */}
                {(roleFilter.length > 0 || dateFilter || statusFilter.length > 0 || wardFilter.length > 0 || reviewTypeFilter.length > 0) && (
                  <button
                    onClick={() => {
                      setRoleFilter([]);
                      setDateFilter('');
                      setStatusFilter([]);
                      setWardFilter([]);
                      setReviewTypeFilter([]);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md font-medium transition-colors"
                    title="Clear all filters"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSortOption('priority')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sortOption === 'priority'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setSortOption('oldest')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sortOption === 'oldest'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Oldest First
              </button>
              <button
                onClick={() => setSortOption('newest')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sortOption === 'newest'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Newest First
              </button>
            </div>
          </div>

          {/* Patient List */}
          <div className="space-y-3">
            {sortedEntries.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No patients match the current filters</p>
              </div>
            ) : (
              sortedEntries.map(entry => (
                <PatientCard
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedHandovers.has(entry.id)}
                  onToggleHandover={() => toggleHandover(entry.id)}
                  onStatusChange={handleStatusChange}
                  onReassign={handleReassign}
                  onAddComment={(comment) => handleAddComment(entry.id, comment)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Patient Card Component
interface PatientCardProps {
  entry: HospitalAtNightWithPatient;
  isExpanded: boolean;
  onToggleHandover: () => void;
  onStatusChange: (entryId: string, status: HaNReviewStatus, completeTodayOnly?: boolean) => void;
  onReassign: (entryId: string, roles: HaNReviewRole[]) => void;
  onAddComment: (comment: { text: string; createdBy: string }) => void;
}

function PatientCard({
  entry,
  isExpanded,
  onToggleHandover,
  onStatusChange,
  onReassign,
  onAddComment
}: PatientCardProps) {
  const [showReassign, setShowReassign] = useState(false);
  const [newRoles, setNewRoles] = useState<HaNReviewRole[]>(entry.assignedRoles);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [showAllCommentsModal, setShowAllCommentsModal] = useState(false);

  // Get comments sorted newest first
  const comments = entry.comments || [];
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const displayedComments = sortedComments.slice(0, 3);
  const hiddenCommentsCount = comments.length - 3;

  // Check if entry has multiple dates with at least one incomplete
  const hasMultipleDates = entry.reviewDates.length > 1;
  const hasIncompleteFutureDates = entry.reviewDates.some(rd => !rd.completedAt && rd.date > new Date().toISOString().split('T')[0]);

  const handleStatusSelect = (newStatus: HaNReviewStatus) => {
    if (newStatus === 'Complete' && hasMultipleDates && hasIncompleteFutureDates) {
      setShowCompletionModal(true);
    } else {
      onStatusChange(entry.id, newStatus);
    }
  };

  const priorityColors: Record<string, string> = {
    High: 'bg-red-500 text-white border-red-600',
    Medium: 'bg-amber-500 text-white border-amber-600',
    Low: 'bg-green-500 text-white border-green-600'
  };

  return (
    <>
      <CompletionModal
        isOpen={showCompletionModal}
        reviewDates={entry.reviewDates}
        onClose={() => setShowCompletionModal(false)}
        onCompleteAll={() => {
          onStatusChange(entry.id, 'Complete');
          setShowCompletionModal(false);
        }}
        onCompleteToday={() => {
          onStatusChange(entry.id, 'Complete', true);
          setShowCompletionModal(false);
        }}
      />
      <AddCommentModal
        isOpen={showAddCommentModal}
        onClose={() => setShowAddCommentModal(false)}
        onSubmit={onAddComment}
      />
      <ViewAllCommentsModal
        isOpen={showAllCommentsModal}
        comments={comments}
        onClose={() => setShowAllCommentsModal(false)}
      />
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Review Date Banner */}
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex flex-wrap items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {/* Review Type Indicator - appears before Review Date(s): */}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            entry.reviewType === 'Ad-hoc'
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {entry.reviewType || 'Scheduled'}
          </span>
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

        <div className="p-4">
          <div className="flex gap-4">
            {/* Patient Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={`/patients/${entry.patientId}`}
                  className="font-bold text-gray-900 text-lg hover:text-purple-600 hover:underline transition-colors"
                >
                  {entry.patient?.lastName}, {entry.patient?.firstName}
                </Link>
                <span className={`px-3 py-1 rounded-md text-sm font-bold border-2 shadow-sm ${priorityColors[entry.priority]}`}>
                  {entry.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                <div>
                  <span className="text-gray-400">Ward:</span> {entry.patient?.ward}
                </div>
                <div>
                  <span className="text-gray-400">Bed:</span> {entry.patient?.bedNumber}
                </div>
                <div>
                  <span className="text-gray-400">NHS:</span> {entry.patient ? formatNhsNumber(entry.patient.nhsNumber) : '-'}
                </div>
                <div>
                  <span className="text-gray-400">Age:</span> {entry.patient ? calculateAge(entry.patient.dateOfBirth) : '-'}
                </div>
              </div>

              {/* Review Details */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
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
              </div>

              {/* Show Handover Toggle */}
              <button
                onClick={onToggleHandover}
                className="mt-3 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {isExpanded ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Handover
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show Handover
                  </>
                )}
              </button>
            </div>

            {/* Comments Column */}
            <div className="w-56 border-l border-gray-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase">Comments</h4>
                {comments.length > 0 && (
                  <button
                    onClick={() => setShowAllCommentsModal(true)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {comments.length}
                    {hiddenCommentsCount > 0 && (
                      <span className="text-gray-400">(+{hiddenCommentsCount} more)</span>
                    )}
                  </button>
                )}
              </div>

              {/* Display up to 3 comments */}
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {displayedComments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet</p>
                ) : (
                  displayedComments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded p-2 text-xs border border-gray-100">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-medium text-gray-700 truncate">{comment.createdBy}</span>
                        <span className="text-gray-400 whitespace-nowrap">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Button */}
              <button
                onClick={() => setShowAddCommentModal(true)}
                className="w-full px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Comment
              </button>
            </div>

            {/* Outcome Column */}
            <div className="w-48 border-l border-gray-200 pl-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Outcome</h4>

              {/* Review Status */}
              <div className="mb-3">
                <label className="text-xs text-gray-400">Review Status</label>
                {/* Show combined status for partial completion */}
                {entry.reviewDates.some(rd => rd.completedAt) && entry.reviewDates.some(rd => !rd.completedAt) ? (
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-green-50 border border-green-300 text-green-700 rounded text-xs font-medium">
                        Complete
                      </span>
                      <span className="text-gray-400">&</span>
                      <span className="px-2 py-1 bg-amber-50 border border-amber-300 text-amber-700 rounded text-xs font-medium">
                        Pending
                      </span>
                    </div>
                    <button
                      onClick={() => handleStatusSelect('Complete')}
                      className="w-full mt-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                    >
                      Complete remaining
                    </button>
                  </div>
                ) : (
                  <select
                    value={entry.reviewStatus}
                    onChange={(e) => handleStatusSelect(e.target.value as HaNReviewStatus)}
                    className={`w-full mt-1 px-2 py-1.5 rounded-md border text-sm font-medium ${
                      entry.reviewStatus === 'Complete'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-amber-50 border-amber-300 text-amber-700'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                  </select>
                )}
                {entry.statusChangedAt && entry.reviewStatus === 'Complete' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Completed: {new Date(entry.statusChangedAt).toLocaleString()}
                  </p>
                )}
              </div>

            {/* Reassign Button */}
            <div>
              {!showReassign ? (
                <button
                  onClick={() => setShowReassign(true)}
                  className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Reassign
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          if (newRoles.includes(role)) {
                            setNewRoles(newRoles.filter(r => r !== role));
                          } else {
                            setNewRoles([...newRoles, role]);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          newRoles.includes(role)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        onReassign(entry.id, newRoles);
                        setShowReassign(false);
                      }}
                      className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setNewRoles(entry.assignedRoles);
                        setShowReassign(false);
                      }}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Handover */}
        {isExpanded && entry.latestHandover && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Latest Handover</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                  <span className="text-xs font-semibold text-blue-700">Situation</span>
                </div>
                <p className="text-sm text-gray-700">{entry.latestHandover.situation}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-100 text-green-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                  <span className="text-xs font-semibold text-green-700">Background</span>
                </div>
                <p className="text-sm text-gray-700">{entry.latestHandover.background}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-100 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                  <span className="text-xs font-semibold text-amber-700">Assessment</span>
                </div>
                <p className="text-sm text-gray-700">{entry.latestHandover.assessment}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                  <span className="text-xs font-semibold text-red-700">Recommendation</span>
                </div>
                <p className="text-sm text-gray-700">{entry.latestHandover.recommendation}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              By {entry.latestHandover.createdBy} on {new Date(entry.latestHandover.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {isExpanded && !entry.latestHandover && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 italic">No handover notes available for this patient</p>
          </div>
        )}
      </div>
    </>
  );
}
