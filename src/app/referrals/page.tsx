'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import {
  SpecialtyReferral,
  SpecialtyReferralWithPatient,
  ReferralSpecialty,
  ReferralPriority,
  ReferralStatus,
  ReferralComment,
  REFERRAL_SPECIALTIES,
  formatNhsNumber,
  calculateAge,
  getNewsScoreColor,
  getResusStatusColor
} from '@/lib/types';
import { useSpecialtyReferrals, usePatients } from '@/lib/useData';
import * as storage from '@/lib/localStorage';

type SubTab = 'bySpecialty' | 'byPatient';
type SortOption = 'priority' | 'oldest' | 'newest';
const PRIORITY_ORDER: Record<ReferralPriority, number> = { High: 0, Medium: 1, Low: 2 };

// ─── Add Comment Modal ────────────────────────────────────────────────────────
function AddCommentModal({
  isOpen, onClose, onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (c: { text: string; createdBy: string }) => void;
}) {
  const [text, setText] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Please enter a comment'); return; }
    if (!createdBy.trim()) { setError('Please enter your name'); return; }
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
              <input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="e.g., Dr. Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Enter your comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Add Comment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── View Comments Modal ──────────────────────────────────────────────────────
function ViewCommentsModal({
  isOpen, comments, onClose
}: {
  isOpen: boolean;
  comments: ReferralComment[];
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const sorted = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            {sorted.length === 0 ? <p className="text-gray-500 text-center py-4">No comments yet</p> : sorted.map(c => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900 text-sm">{c.createdBy}</span>
                  <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Referral Card ────────────────────────────────────────────────────────────
function ReferralCard({
  referral,
  onStatusChange,
  onAddComment,
}: {
  referral: SpecialtyReferralWithPatient;
  onStatusChange: (id: string, status: ReferralStatus) => void;
  onAddComment: (id: string, comment: { text: string; createdBy: string }) => void;
}) {
  const [showHandover, setShowHandover] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);

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
            {new Date(referral.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for Referral</div>
          <p className="text-sm text-gray-800">{referral.reasonForReferral}</p>
          <div className="text-xs text-gray-400 mt-2">Referred by {referral.createdBy}</div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Outcome / Status change */}
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

          <div className="ml-auto flex items-center gap-2">
            {/* Comments */}
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {referral.comments?.length || 0} comment{(referral.comments?.length || 0) !== 1 ? 's' : ''}
            </button>
            <button
              onClick={() => setShowAddComment(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-teal-700 bg-teal-50 rounded border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              + Comment
            </button>
            {/* Toggle handover */}
            {handover && (
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
            )}
          </div>
        </div>
      </div>

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

      <ViewCommentsModal
        isOpen={showComments}
        comments={referral.comments || []}
        onClose={() => setShowComments(false)}
      />
      <AddCommentModal
        isOpen={showAddComment}
        onClose={() => setShowAddComment(false)}
        onSubmit={(c) => { onAddComment(referral.id, c); setShowAddComment(false); }}
      />
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────
function FiltersBar({
  specialtyFilter, setSpecialtyFilter,
  priorityFilter, setPriorityFilter,
  statusFilter, setStatusFilter,
  sortOption, setSortOption,
}: {
  specialtyFilter: ReferralSpecialty | null;
  setSpecialtyFilter: (s: ReferralSpecialty | null) => void;
  priorityFilter: ReferralPriority[];
  setPriorityFilter: (p: ReferralPriority[]) => void;
  statusFilter: ReferralStatus[];
  setStatusFilter: (s: ReferralStatus[]) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
}) {
  const priorityColors: Record<ReferralPriority, string> = {
    High: 'bg-red-600 text-white',
    Medium: 'bg-amber-500 text-white',
    Low: 'bg-green-600 text-white',
  };

  return (
    <div className="bg-blue-50 rounded-lg shadow border border-blue-200 p-4 space-y-3">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Priority */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
          <div className="flex gap-1">
            {(['High', 'Medium', 'Low'] as ReferralPriority[]).map(p => (
              <button key={p} onClick={() => {
                if (priorityFilter.includes(p)) setPriorityFilter(priorityFilter.filter(x => x !== p));
                else setPriorityFilter([...priorityFilter, p]);
              }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  priorityFilter.includes(p) ? priorityColors[p] : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
          <div className="flex gap-1">
            {(['Pending', 'Accepted', 'Declined', 'Cancelled'] as ReferralStatus[]).map(s => (
              <button key={s} onClick={() => {
                if (statusFilter.includes(s)) setStatusFilter(statusFilter.filter(x => x !== s));
                else setStatusFilter([...statusFilter, s]);
              }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter.includes(s)
                    ? s === 'Pending' ? 'bg-amber-500 text-white'
                      : s === 'Accepted' ? 'bg-green-600 text-white'
                      : s === 'Declined' ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Specialty (additional filter on By Patient tab) */}
        {setSpecialtyFilter && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Speciality</label>
            <select
              value={specialtyFilter ?? ''}
              onChange={e => setSpecialtyFilter(e.target.value ? e.target.value as ReferralSpecialty : null)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Specialities</option>
              {REFERRAL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Sort */}
        <div className="ml-auto">
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Sort By</label>
          <div className="flex gap-1">
            {[
              { value: 'priority', label: 'Priority' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'newest', label: 'Newest First' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setSortOption(opt.value as SortOption)}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  sortOption === opt.value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {(priorityFilter.length > 0 || statusFilter.length > 0 || specialtyFilter) && (
        <button
          onClick={() => { setPriorityFilter([]); setStatusFilter([]); setSpecialtyFilter(null); }}
          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReferralsPage() {
  const { referrals: rawReferrals, loading: referralsLoading, refresh } = useSpecialtyReferrals();
  const { patients, loading: patientsLoading } = usePatients(true);

  const [activeTab, setActiveTab] = useState<SubTab>('bySpecialty');

  // By Specialty tab state
  const [selectedSpecialty, setSelectedSpecialty] = useState<ReferralSpecialty | null>(null);
  const [defaultSpecialty, setDefaultSpecialty] = useState<ReferralSpecialty | null>(null);
  const [specPriorityFilter, setSpecPriorityFilter] = useState<ReferralPriority[]>([]);
  const [specStatusFilter, setSpecStatusFilter] = useState<ReferralStatus[]>([]);
  const [specSort, setSpecSort] = useState<SortOption>('priority');

  // By Patient tab state
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [defaultWard, setDefaultWard] = useState<string>('');
  const [patSpecialtyFilter, setPatSpecialtyFilter] = useState<ReferralSpecialty | null>(null);
  const [patPriorityFilter, setPatPriorityFilter] = useState<ReferralPriority[]>([]);
  const [patStatusFilter, setPatStatusFilter] = useState<ReferralStatus[]>([]);
  const [patSort, setPatSort] = useState<SortOption>('priority');

  // Persist default specialty
  useEffect(() => {
    const saved = localStorage.getItem('referrals_default_specialty');
    if (saved) {
      setDefaultSpecialty(saved as ReferralSpecialty);
      setSelectedSpecialty(saved as ReferralSpecialty);
    }
  }, []);
  useEffect(() => {
    if (defaultSpecialty) {
      localStorage.setItem('referrals_default_specialty', defaultSpecialty);
    } else {
      localStorage.removeItem('referrals_default_specialty');
    }
  }, [defaultSpecialty]);

  // Persist default ward
  useEffect(() => {
    const saved = localStorage.getItem('referrals_default_ward');
    if (saved) setDefaultWard(saved);
  }, []);
  useEffect(() => {
    if (defaultWard) {
      localStorage.setItem('referrals_default_ward', defaultWard);
    } else {
      localStorage.removeItem('referrals_default_ward');
    }
  }, [defaultWard]);

  const loading = referralsLoading || patientsLoading;

  // Enrich referrals with patient data
  const referrals: SpecialtyReferralWithPatient[] = rawReferrals.map(r => ({
    ...r,
    patient: patients.find(p => p.id === r.patientId),
    latestHandover: storage.getLatestHandoverForPatient(r.patientId),
  }));

  const handleStatusChange = useCallback((id: string, status: ReferralStatus) => {
    storage.updateSpecialtyReferral(id, { status });
    refresh();
  }, [refresh]);

  const handleAddComment = useCallback((id: string, comment: { text: string; createdBy: string }) => {
    const newComment: ReferralComment = {
      id: uuidv4(),
      text: comment.text,
      createdBy: comment.createdBy,
      createdAt: new Date().toISOString(),
    };
    storage.addCommentToReferral(id, newComment);
    refresh();
  }, [refresh]);

  // Unique wards from patients who have referrals
  const referralPatientIds = new Set(referrals.map(r => r.patientId));
  const availableWards = [...new Set(
    patients.filter(p => referralPatientIds.has(p.id)).map(p => p.ward)
  )].sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? '0');
    const nb = parseInt(b.match(/\d+/)?.[0] ?? '0');
    return na - nb;
  });

  const activeWard = selectedWard || defaultWard || availableWards[0] || '';
  const activeSpecialty = selectedSpecialty || defaultSpecialty;

  function applyFiltersAndSort(
    list: SpecialtyReferralWithPatient[],
    priority: ReferralPriority[],
    status: ReferralStatus[],
    sort: SortOption,
    specFilter?: ReferralSpecialty | null
  ) {
    return list
      .filter(r => priority.length === 0 || priority.includes(r.priority))
      .filter(r => status.length === 0 || status.includes(r.status))
      .filter(r => !specFilter || r.specialty === specFilter)
      .sort((a, b) => {
        if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  // By Specialty filtered list
  const specReferrals = applyFiltersAndSort(
    activeSpecialty ? referrals.filter(r => r.specialty === activeSpecialty) : [],
    specPriorityFilter, specStatusFilter, specSort
  );

  // By Patient filtered list
  const wardPatients = patients.filter(p => p.ward === activeWard);
  const wardReferrals = applyFiltersAndSort(
    referrals.filter(r => wardPatients.some(p => p.id === r.patientId)),
    patPriorityFilter, patStatusFilter, patSort, patSpecialtyFilter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Referrals
        </h1>
        <p className="text-gray-500">Manage specialty referrals across the hospital</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="flex space-x-8">
            {[
              { key: 'bySpecialty', label: 'By Speciality' },
              { key: 'byPatient', label: 'By Ward' },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key as SubTab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >{tab.label}</button>
            ))}
          </nav>
          <div className="bg-white rounded-lg border border-teal-200 shadow-sm px-5 py-2 text-center">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Showing</div>
            <div className="text-2xl font-bold text-teal-600">
              {activeTab === 'bySpecialty' ? specReferrals.length : wardReferrals.length}
            </div>
          </div>
        </div>
      </div>

      {/* ── By Specialty Tab ── */}
      {activeTab === 'bySpecialty' && (
        <div className="space-y-4">
          {/* Specialty selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">Speciality:</span>
              <div className="flex flex-wrap gap-2">
                {REFERRAL_SPECIALTIES.map(s => (
                  <button key={s}
                    onClick={() => setSelectedSpecialty(activeSpecialty === s ? null : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                      activeSpecialty === s
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>
            {activeSpecialty && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDefaultSpecialty(activeSpecialty); }}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    defaultSpecialty === activeSpecialty
                      ? 'bg-teal-100 text-teal-700 border-teal-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-teal-50'
                  }`}
                >
                  {defaultSpecialty === activeSpecialty ? '★ Default' : '☆ Set as default'}
                </button>
                <button onClick={() => setSelectedSpecialty(null)} className="text-xs text-teal-600 hover:text-teal-700">
                  Show all specialities
                </button>
              </div>
            )}
          </div>

          {!activeSpecialty ? (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-teal-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-teal-700 font-medium">Select a speciality above to view referrals</p>
            </div>
          ) : (
            <>
              <FiltersBar
                specialtyFilter={null}
                setSpecialtyFilter={() => {}}
                priorityFilter={specPriorityFilter}
                setPriorityFilter={setSpecPriorityFilter}
                statusFilter={specStatusFilter}
                setStatusFilter={setSpecStatusFilter}
                sortOption={specSort}
                setSortOption={setSpecSort}
              />
              {specReferrals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No referrals found for {activeSpecialty} with the current filters
                </div>
              ) : (
                <div className="space-y-4">
                  {specReferrals.map(r => (
                    <ReferralCard
                      key={r.id}
                      referral={r}
                      onStatusChange={handleStatusChange}
                      onAddComment={handleAddComment}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── By Ward Tab ── */}
      {activeTab === 'byPatient' && (
        <div className="space-y-4">
          {/* Ward selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">Ward:</span>
              <div className="flex flex-wrap gap-2">
                {availableWards.map(w => (
                  <button key={w}
                    onClick={() => setSelectedWard(activeWard === w && selectedWard ? '' : w)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                      activeWard === w
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >{w}</button>
                ))}
              </div>
            </div>
            {activeWard && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDefaultWard(activeWard)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    defaultWard === activeWard
                      ? 'bg-teal-100 text-teal-700 border-teal-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-teal-50'
                  }`}
                >
                  {defaultWard === activeWard ? '★ Default' : '☆ Set as default'}
                </button>
              </div>
            )}
          </div>

          {!activeWard ? (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
              <p className="text-teal-700 font-medium">Select a ward above to view referrals</p>
            </div>
          ) : (
            <>
              <FiltersBar
                specialtyFilter={patSpecialtyFilter}
                setSpecialtyFilter={setPatSpecialtyFilter}
                priorityFilter={patPriorityFilter}
                setPriorityFilter={setPatPriorityFilter}
                statusFilter={patStatusFilter}
                setStatusFilter={setPatStatusFilter}
                sortOption={patSort}
                setSortOption={setPatSort}
              />
              {wardReferrals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No referrals found for {activeWard} with the current filters
                </div>
              ) : (
                <div className="space-y-4">
                  {wardReferrals.map(r => (
                    <ReferralCard
                      key={r.id}
                      referral={r}
                      onStatusChange={handleStatusChange}
                      onAddComment={handleAddComment}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
