'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PatientTaskWithPatient,
  TaskRole,
  TaskStatus,
  TaskComment,
  TASK_ROLES,
  ReferralPriority,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  getResusStatusColor,
} from '@/lib/types';

// ─── Task Add Comment Modal ───────────────────────────────────────────────────
export function TaskAddCommentModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string; createdBy: string }) => void;
}) {
  const [text, setText] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdBy.trim()) { setError('Please enter your name'); return; }
    if (!text.trim()) { setError('Please enter a comment'); return; }
    onSubmit({ text: text.trim(), createdBy: createdBy.trim() });
    setText(''); setCreatedBy(''); setError(null); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Add Comment</h3>
          <div className="text-sm text-gray-500 mb-4">{new Date().toLocaleString()}</div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)}
                placeholder="e.g., Nurse Jones"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
                placeholder="Enter your comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add Comment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Task View All Comments Modal ─────────────────────────────────────────────
export function TaskViewAllCommentsModal({ isOpen, comments, onClose, onMarkSeen, taskId }: {
  isOpen: boolean;
  comments: TaskComment[];
  onClose: () => void;
  onMarkSeen: (taskId: string, commentId: string) => void;
  taskId: string;
}) {
  if (!isOpen) return null;
  const sorted = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
            {sorted.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              sorted.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 text-sm">{c.createdBy}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{c.text}</p>
                  {c.seenAt ? (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Seen {new Date(c.seenAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <button onClick={() => onMarkSeen(taskId, c.id)}
                      className="text-xs text-gray-400 hover:text-indigo-600 underline transition-colors">
                      Mark as seen
                    </button>
                  )}
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

// ─── Task Card ────────────────────────────────────────────────────────────────
export function TaskCard({
  task,
  onStatusChange,
  onReassign,
  onAddComment,
  onMarkCommentSeen,
  isAssignedToMe,
  onToggleAssignedToMe,
}: {
  task: PatientTaskWithPatient;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onReassign: (id: string, roles: TaskRole[]) => void;
  onAddComment: (id: string, comment: { text: string; createdBy: string }) => void;
  onMarkCommentSeen: (taskId: string, commentId: string) => void;
  isAssignedToMe?: boolean;
  onToggleAssignedToMe?: (id: string) => void;
}) {
  const [showReassign, setShowReassign] = useState(false);
  const [newRoles, setNewRoles] = useState<TaskRole[]>(task.assignedTo);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  const patient = task.patient;
  const comments = task.comments || [];
  const previewComments = [...comments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const hiddenCount = comments.length - 3;

  const priorityColors: Record<ReferralPriority, string> = {
    High: 'bg-red-500 text-white border-red-600',
    Medium: 'bg-amber-500 text-white border-amber-600',
    Low: 'bg-green-500 text-white border-green-600',
  };

  const statusActiveColors: Record<TaskStatus, string> = {
    'New': 'bg-indigo-600 text-white border-indigo-600',
    'In Progress': 'bg-amber-500 text-white border-amber-500',
    'Complete': 'bg-green-600 text-white border-green-600',
  };

  const dueDateDisplay = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      <TaskAddCommentModal
        isOpen={showAddCommentModal}
        onClose={() => setShowAddCommentModal(false)}
        onSubmit={(comment) => onAddComment(task.id, comment)}
      />
      <TaskViewAllCommentsModal
        isOpen={showViewAllModal}
        comments={comments}
        onClose={() => setShowViewAllModal(false)}
        onMarkSeen={onMarkCommentSeen}
        taskId={task.id}
      />
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Patient header banner */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {patient ? (
              <Link href={`/patients/${task.patientId}`}
                className="font-bold text-gray-900 text-base hover:text-indigo-600 hover:underline transition-colors">
                {patient.lastName}, {patient.firstName}
              </Link>
            ) : (
              <span className="font-bold text-gray-900">Unknown Patient</span>
            )}
            {patient && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-0.5 text-sm text-gray-600">
                <div><span className="text-gray-400">Ward:</span> {patient.ward}</div>
                <div><span className="text-gray-400">Bed:</span> {patient.bedNumber}</div>
                <div><span className="text-gray-400">NHS:</span> {formatNhsNumber(patient.nhsNumber)}</div>
                <div><span className="text-gray-400">Age:</span> {calculateAge(patient.dateOfBirth)}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {patient && patient.earlyWarningScore !== null && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getNewsScoreColor(patient.earlyWarningScore)}`}>
                NEWS {patient.earlyWarningScore}
              </span>
            )}
            {patient && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getResusStatusColor(patient.resuscitationStatus)}`}>
                {patient.resuscitationStatus}
              </span>
            )}
            {onToggleAssignedToMe && (
              <button
                onClick={() => onToggleAssignedToMe(task.id)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors border ${
                  isAssignedToMe
                    ? 'bg-indigo-100 text-indigo-400 border-indigo-200'
                    : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                }`}
              >
                {isAssignedToMe ? 'Assigned to me' : 'Assign to me'}
              </button>
            )}
          </div>
        </div>

        {/* Three-column body */}
        <div className="p-4 flex gap-4">

          {/* ── Column 1: Task Details ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-md text-sm font-bold border-2 shadow-sm ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              {task.assignedTo.map(r => (
                <span key={r} className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">{r}</span>
              ))}
              {(dueDateDisplay || task.dueTime) && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due: {[dueDateDisplay, task.dueTime].filter(Boolean).join(' at ')}
                </span>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-sm text-gray-800">{task.taskDetails}</p>
              <p className="text-xs text-gray-400">Created by {task.createdBy} on {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* ── Column 2: Comments ── */}
          <div className="w-56 border-l border-gray-200 pl-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Comments</h4>
              {comments.length > 0 && (
                <button onClick={() => setShowViewAllModal(true)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {comments.length}
                  {hiddenCount > 0 && <span className="text-gray-400">(+{hiddenCount} more)</span>}
                </button>
              )}
            </div>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {previewComments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet</p>
              ) : (
                previewComments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded p-2 text-xs border border-gray-100">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-gray-700 truncate">{c.createdBy}</span>
                      <span className="text-gray-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowAddCommentModal(true)}
              className="w-full px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Comment
            </button>
          </div>

          {/* ── Column 3: Status ── */}
          <div className="w-44 border-l border-gray-200 pl-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Status</h4>
            <div className="space-y-1.5 mb-2">
              {(['New', 'In Progress', 'Complete'] as TaskStatus[]).map(s => (
                <button key={s} onClick={() => onStatusChange(task.id, s)}
                  className={`w-full px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    task.status === s
                      ? statusActiveColors[s]
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >{s}</button>
              ))}
            </div>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <p className="text-xs text-gray-400 mb-3">
                Updated: {new Date(task.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {!showReassign ? (
              <button onClick={() => setShowReassign(true)}
                className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                Reassign
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reassign to</p>
                <div className="flex flex-wrap gap-1">
                  {TASK_ROLES.map(r => (
                    <button key={r}
                      onClick={() => setNewRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        newRoles.includes(r) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >{r}</button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { if (newRoles.length > 0) { onReassign(task.id, newRoles); setShowReassign(false); } }}
                    disabled={newRoles.length === 0}
                    className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
                    Save
                  </button>
                  <button
                    onClick={() => { setNewRoles(task.assignedTo); setShowReassign(false); }}
                    className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
