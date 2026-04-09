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
import { ReferralCard } from '@/components/ReferralCard';

type SubTab = 'bySpecialty' | 'byPatient';
type SortOption = 'priority' | 'oldest' | 'newest';
const PRIORITY_ORDER: Record<ReferralPriority, number> = { High: 0, Medium: 1, Low: 2 };

// ─── Filters Bar ──────────────────────────────────────────────────────────────
function FiltersBar({
  specialtyFilter, setSpecialtyFilter,
  priorityFilter, setPriorityFilter,
  statusFilter, setStatusFilter,
  commentsFilter, setCommentsFilter,
  sortOption, setSortOption,
}: {
  specialtyFilter?: ReferralSpecialty[];
  setSpecialtyFilter?: (s: ReferralSpecialty[]) => void;
  priorityFilter: ReferralPriority[];
  setPriorityFilter: (p: ReferralPriority[]) => void;
  statusFilter: ReferralStatus[];
  setStatusFilter: (s: ReferralStatus[]) => void;
  commentsFilter: boolean;
  setCommentsFilter: (f: boolean) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
}) {
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);

  const priorityColors: Record<ReferralPriority, string> = {
    High: 'bg-red-600 text-white',
    Medium: 'bg-amber-500 text-white',
    Low: 'bg-green-600 text-white',
  };

  const toggleSpecialty = (s: ReferralSpecialty) => {
    if (!setSpecialtyFilter || !specialtyFilter) return;
    if (specialtyFilter.includes(s)) {
      setSpecialtyFilter(specialtyFilter.filter(x => x !== s));
    } else {
      setSpecialtyFilter([...specialtyFilter, s]);
    }
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

        {/* Comments filter */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Comments</label>
          <button
            onClick={() => setCommentsFilter(!commentsFilter)}
            className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              commentsFilter ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            New comments
          </button>
        </div>

        {/* Specialty multi-select (By Ward tab only) */}
        {setSpecialtyFilter && specialtyFilter !== undefined && (
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Speciality</label>
            <button
              onClick={() => setSpecDropdownOpen(!specDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 min-w-[160px] justify-between"
            >
              <span className="text-gray-700">
                {specialtyFilter.length === 0
                  ? 'All Specialities'
                  : specialtyFilter.length === 1
                    ? specialtyFilter[0]
                    : `${specialtyFilter.length} selected`}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${specDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {specDropdownOpen && (
              <div className="absolute z-20 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => { setSpecialtyFilter([]); }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setSpecDropdownOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Done
                  </button>
                </div>
                {REFERRAL_SPECIALTIES.map(s => (
                  <label
                    key={s}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={specialtyFilter.includes(s)}
                      onChange={() => toggleSpecialty(s)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}
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
      {(priorityFilter.length > 0 || statusFilter.length > 0 || (specialtyFilter?.length ?? 0) > 0 || commentsFilter) && (
        <button
          onClick={() => { setPriorityFilter([]); setStatusFilter([]); setSpecialtyFilter?.([]); setCommentsFilter(false); }}
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

  const [specCommentsFilter, setSpecCommentsFilter] = useState(false);

  // By Patient tab state
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [defaultWard, setDefaultWard] = useState<string>('');
  const [patSpecialtyFilter, setPatSpecialtyFilter] = useState<ReferralSpecialty[]>([]);
  const [patPriorityFilter, setPatPriorityFilter] = useState<ReferralPriority[]>([]);
  const [patStatusFilter, setPatStatusFilter] = useState<ReferralStatus[]>([]);
  const [patSort, setPatSort] = useState<SortOption>('priority');
  const [patCommentsFilter, setPatCommentsFilter] = useState(false);

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

  const handleMarkCommentSeen = useCallback((referralId: string, commentId: string) => {
    storage.markCommentSeen(referralId, commentId);
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
    specFilter?: ReferralSpecialty[],
    newCommentsOnly?: boolean
  ) {
    return list
      .filter(r => priority.length === 0 || priority.includes(r.priority))
      .filter(r => status.length === 0 || status.includes(r.status))
      .filter(r => !specFilter?.length || specFilter.includes(r.specialty))
      .filter(r => !newCommentsOnly || (r.comments || []).some(c => !c.seenAt))
      .sort((a, b) => {
        if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  // By Specialty filtered list
  const specReferrals = applyFiltersAndSort(
    activeSpecialty ? referrals.filter(r => r.specialty === activeSpecialty) : [],
    specPriorityFilter, specStatusFilter, specSort, undefined, specCommentsFilter
  );

  // By Patient filtered list
  const wardPatients = patients.filter(p => p.ward === activeWard);
  const wardReferrals = applyFiltersAndSort(
    referrals.filter(r => wardPatients.some(p => p.id === r.patientId)),
    patPriorityFilter, patStatusFilter, patSort, patSpecialtyFilter, patCommentsFilter
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
                priorityFilter={specPriorityFilter}
                setPriorityFilter={setSpecPriorityFilter}
                statusFilter={specStatusFilter}
                setStatusFilter={setSpecStatusFilter}
                commentsFilter={specCommentsFilter}
                setCommentsFilter={setSpecCommentsFilter}
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
                      onMarkCommentSeen={handleMarkCommentSeen}
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
                commentsFilter={patCommentsFilter}
                setCommentsFilter={setPatCommentsFilter}
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
                      onMarkCommentSeen={handleMarkCommentSeen}
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
