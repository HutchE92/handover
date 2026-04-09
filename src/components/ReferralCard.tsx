'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SpecialtyReferralWithPatient,
  ReferralPriority,
  ReferralStatus,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  getResusStatusColor,
} from '@/lib/types';

export function ReferralCard({
  referral,
  onStatusChange,
  onAddComment,
  onMarkCommentSeen,
}: {
  referral: SpecialtyReferralWithPatient;
  onStatusChange: (id: string, status: ReferralStatus) => void;
  onAddComment: (id: string, comment: { text: string; createdBy: string }) => void;
  onMarkCommentSeen: (referralId: string, commentId: string) => void;
}) {
  const [showHandover, setShowHandover] = useState(false);
  const [showCommentsFeed, setShowCommentsFeed] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentBy, setNewCommentBy] = useState('');
  const [newCommentError, setNewCommentError] = useState<string | null>(null);

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

  const patient = referral.patient;
  const handover = referral.latestHandover;
  const commentCount = referral.comments?.length || 0;
  const sortedComments = [...(referral.comments || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleSubmitComment = () => {
    if (!newCommentBy.trim()) { setNewCommentError('Please enter your name'); return; }
    if (!newCommentText.trim()) { setNewCommentError('Please enter a comment'); return; }
    setNewCommentError(null);
    onAddComment(referral.id, { text: newCommentText.trim(), createdBy: newCommentBy.trim() });
    setNewCommentText('');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Patient header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            {patient ? (
              <Link
                href={`/patients/${referral.patientId}`}
                className="font-semibold text-gray-900 hover:text-teal-600 hover:underline transition-colors"
              >
                {patient.lastName}, {patient.firstName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">Unknown Patient</span>
            )}
            {patient && (
              <span className="text-sm text-gray-500 ml-2">
                {patient.ward} · Bed {patient.bedNumber}
                {' · '}NHS {formatNhsNumber(patient.nhsNumber)}
                {' · '}Age {calculateAge(patient.dateOfBirth)}
              </span>
            )}
          </div>
        </div>
        {patient && (
          <div className="flex items-center gap-2">
            {patient.earlyWarningScore !== null && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getNewsScoreColor(patient.earlyWarningScore)}`}>
                NEWS {patient.earlyWarningScore}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getResusStatusColor(patient.resuscitationStatus)}`}>
              {patient.resuscitationStatus}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Priority + Status + Specialty row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-md text-sm font-bold border-2 shadow-sm ${priorityColors[referral.priority]}`}>
            {referral.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${statusColors[referral.status]}`}>
            {referral.status}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
            {referral.specialty}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(referral.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for Referral</div>
          <p className="text-sm text-gray-800">{referral.reasonForReferral}</p>
          <div className="text-xs text-gray-400 mt-2">Referred by {referral.createdBy}</div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-600 mr-1">Outcome:</span>
            {(['Pending', 'Accepted', 'Declined', 'Cancelled'] as ReferralStatus[]).map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(referral.id, s)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  referral.status === s
                    ? statusColors[s]
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
            {referral.updatedAt && referral.updatedAt !== referral.createdAt && (
              <span className="text-xs text-gray-400 ml-1">
                Updated: {new Date(referral.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setShowCommentsFeed(!showCommentsFeed)}
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {showCommentsFeed ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Comments
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {commentCount} Comment{commentCount !== 1 ? 's' : ''}
                </>
              )}
            </button>

            <button
              onClick={() => setShowHandover(!showHandover)}
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {showHandover ? (
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
        </div>
      </div>

      {/* Comments feed */}
      {showCommentsFeed && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Comments{commentCount > 0 ? ` (${commentCount})` : ''}
          </h4>
          <div className="space-y-3 mb-4">
            {sortedComments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet — be the first to add one below.</p>
            ) : (
              sortedComments.map(c => (
                <div key={c.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{c.createdBy}</span>
                    <div className="text-right ml-3 shrink-0">
                      <div className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="mt-1">
                        {c.seenAt ? (
                          <span className="text-xs text-green-600 font-medium">
                            Marked as seen at {new Date(c.seenAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <button
                            onClick={() => onMarkCommentSeen(referral.id, c.id)}
                            className="text-xs text-gray-400 hover:text-teal-600 underline transition-colors"
                          >
                            Mark as seen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add a comment</p>
            {newCommentError && <p className="text-xs text-red-600">{newCommentError}</p>}
            <div className="flex gap-3">
              <div className="w-40 shrink-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={newCommentBy}
                  onChange={e => { setNewCommentBy(e.target.value); setNewCommentError(null); }}
                  placeholder="e.g., Dr. Smith"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Comment *</label>
                <textarea
                  value={newCommentText}
                  onChange={e => { setNewCommentText(e.target.value); setNewCommentError(null); }}
                  rows={2}
                  placeholder="Enter your comment..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 font-medium"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover — SBAR 4-column layout */}
      {showHandover && handover && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Latest Handover</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                <span className="text-xs font-semibold text-blue-700">Situation</span>
              </div>
              <p className="text-sm text-gray-700">{handover.situation}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                <span className="text-xs font-semibold text-green-700">Background</span>
              </div>
              <p className="text-sm text-gray-700">{handover.background}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                <span className="text-xs font-semibold text-amber-700">Assessment</span>
              </div>
              <p className="text-sm text-gray-700">{handover.assessment}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-100 text-red-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">R</span>
                <span className="text-xs font-semibold text-red-700">Recommendation</span>
              </div>
              <p className="text-sm text-gray-700">{handover.recommendation}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            By {handover.createdBy} on {new Date(handover.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
      {showHandover && !handover && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500 italic">No handover notes available for this patient</p>
        </div>
      )}
    </div>
  );
}
