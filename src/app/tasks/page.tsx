'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import {
  PatientTask,
  PatientTaskWithPatient,
  TaskRole,
  TaskStatus,
  TaskComment,
  TASK_ROLES,
  ReferralPriority,
} from '@/lib/types';
import { useTasks, usePatients } from '@/lib/useData';
import * as storage from '@/lib/localStorage';
import { TaskCard } from '@/components/TaskCard';

type SubTab = 'byRole' | 'byWard';
type SortOption = 'priority' | 'oldest' | 'newest';
const PRIORITY_ORDER: Record<ReferralPriority, number> = { High: 0, Medium: 1, Low: 2 };

// ─── Filters Bar ──────────────────────────────────────────────────────────────
function TaskFiltersBar({
  priorityFilter, setPriorityFilter,
  statusFilter, setStatusFilter,
  commentsFilter, setCommentsFilter,
  dateDueFilter, setDateDueFilter,
  availableDates,
  wardFilter, setWardFilter,
  availableWards,
  roleFilter, setRoleFilter,
  sortOption, setSortOption,
}: {
  priorityFilter: ReferralPriority[];
  setPriorityFilter: (p: ReferralPriority[]) => void;
  statusFilter: TaskStatus[];
  setStatusFilter: (s: TaskStatus[]) => void;
  commentsFilter: boolean;
  setCommentsFilter: (f: boolean) => void;
  dateDueFilter?: string[];
  setDateDueFilter?: (d: string[]) => void;
  availableDates?: string[];
  wardFilter?: string[];
  setWardFilter?: (w: string[]) => void;
  availableWards?: string[];
  roleFilter?: TaskRole[];
  setRoleFilter?: (r: TaskRole[]) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
}) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const priorityColors: Record<ReferralPriority, string> = { High: 'bg-red-600 text-white', Medium: 'bg-amber-500 text-white', Low: 'bg-green-600 text-white' };

  const hasFilters = priorityFilter.length > 0 || statusFilter.length > 0 || commentsFilter
    || (dateDueFilter?.length ?? 0) > 0 || (wardFilter?.length ?? 0) > 0 || (roleFilter?.length ?? 0) > 0;

  const clearAll = () => {
    setPriorityFilter([]); setStatusFilter([]); setCommentsFilter(false);
    setDateDueFilter?.([]); setWardFilter?.([]); setRoleFilter?.([]);
  };

  return (
    <div className="bg-indigo-50 rounded-lg shadow border border-indigo-200 p-4 space-y-3">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Priority */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
          <div className="flex gap-1">
            {(['High', 'Medium', 'Low'] as ReferralPriority[]).map(p => (
              <button key={p} onClick={() => setPriorityFilter(priorityFilter.includes(p) ? priorityFilter.filter(x => x !== p) : [...priorityFilter, p])}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${priorityFilter.includes(p) ? priorityColors[p] : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
          <div className="flex gap-1">
            {(['New', 'In Progress', 'Complete'] as TaskStatus[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(statusFilter.includes(s) ? statusFilter.filter(x => x !== s) : [...statusFilter, s])}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  statusFilter.includes(s)
                    ? s === 'New' ? 'bg-blue-600 text-white' : s === 'In Progress' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Comments</label>
          <button onClick={() => setCommentsFilter(!commentsFilter)}
            className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${commentsFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >New comments</button>
        </div>

        {/* Date Due (By Role only) */}
        {setDateDueFilter && availableDates && availableDates.length > 0 && (
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Date Due</label>
            <button onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 min-w-[140px] justify-between">
              <span className="text-gray-700">
                {(dateDueFilter?.length ?? 0) === 0 ? 'Any date' : `${dateDueFilter!.length} selected`}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dateDropdownOpen && (
              <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 flex justify-between">
                  <button onClick={() => setDateDueFilter!([])} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Clear</button>
                  <button onClick={() => setDateDropdownOpen(false)} className="text-xs text-gray-500">Done</button>
                </div>
                {availableDates.map(d => (
                  <label key={d} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox"
                      checked={dateDueFilter?.includes(d) ?? false}
                      onChange={() => setDateDueFilter!(dateDueFilter?.includes(d) ? dateDueFilter!.filter(x => x !== d) : [...(dateDueFilter ?? []), d])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ward multi-select (By Role only) */}
        {setWardFilter && availableWards && (
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Ward</label>
            <button onClick={() => setWardDropdownOpen(!wardDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 min-w-[140px] justify-between">
              <span className="text-gray-700">
                {(wardFilter?.length ?? 0) === 0 ? 'All Wards' : wardFilter!.length === 1 ? wardFilter![0] : `${wardFilter!.length} selected`}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${wardDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {wardDropdownOpen && (
              <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 flex justify-between">
                  <button onClick={() => setWardFilter!([])} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Clear</button>
                  <button onClick={() => setWardDropdownOpen(false)} className="text-xs text-gray-500">Done</button>
                </div>
                {availableWards.map(w => (
                  <label key={w} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox"
                      checked={wardFilter?.includes(w) ?? false}
                      onChange={() => setWardFilter!(wardFilter?.includes(w) ? wardFilter!.filter(x => x !== w) : [...(wardFilter ?? []), w])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    {w}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Role multi-select (By Ward only) */}
        {setRoleFilter && (
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Role</label>
            <button onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 min-w-[140px] justify-between">
              <span className="text-gray-700">
                {(roleFilter?.length ?? 0) === 0 ? 'All Roles' : roleFilter!.length === 1 ? roleFilter![0] : `${roleFilter!.length} selected`}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {roleDropdownOpen && (
              <div className="absolute z-20 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2 border-b border-gray-100 flex justify-between">
                  <button onClick={() => setRoleFilter!([])} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Clear</button>
                  <button onClick={() => setRoleDropdownOpen(false)} className="text-xs text-gray-500">Done</button>
                </div>
                {TASK_ROLES.map(r => (
                  <label key={r} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox"
                      checked={roleFilter?.includes(r) ?? false}
                      onChange={() => setRoleFilter!(roleFilter?.includes(r) ? roleFilter!.filter(x => x !== r) : [...(roleFilter ?? []), r])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    {r}
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
            {[{ value: 'priority', label: 'Priority' }, { value: 'oldest', label: 'Oldest' }, { value: 'newest', label: 'Newest' }].map(opt => (
              <button key={opt.value} onClick={() => setSortOption(opt.value as SortOption)}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${sortOption === opt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { tasks: rawTasks, loading: tasksLoading, refresh } = useTasks();
  const { patients, loading: patientsLoading } = usePatients(true);

  const [activeTab, setActiveTab] = useState<SubTab>('byRole');

  // By Role tab state
  const [selectedRole, setSelectedRole] = useState<TaskRole | null>(null);
  const [defaultRole, setDefaultRole] = useState<TaskRole | null>(null);
  const [rolePriorityFilter, setRolePriorityFilter] = useState<ReferralPriority[]>([]);
  const [roleStatusFilter, setRoleStatusFilter] = useState<TaskStatus[]>([]);
  const [roleCommentsFilter, setRoleCommentsFilter] = useState(false);
  const [roleDateDueFilter, setRoleDateDueFilter] = useState<string[]>([]);
  const [roleWardFilter, setRoleWardFilter] = useState<string[]>([]);
  const [roleSort, setRoleSort] = useState<SortOption>('priority');

  // By Ward tab state
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [defaultWards, setDefaultWards] = useState<string[]>([]);
  const [wardPriorityFilter, setWardPriorityFilter] = useState<ReferralPriority[]>([]);
  const [wardStatusFilter, setWardStatusFilter] = useState<TaskStatus[]>([]);
  const [wardCommentsFilter, setWardCommentsFilter] = useState(false);
  const [wardRoleFilter, setWardRoleFilter] = useState<TaskRole[]>([]);
  const [wardSort, setWardSort] = useState<SortOption>('priority');

  // Persist default role
  useEffect(() => {
    const saved = localStorage.getItem('tasks_default_role');
    if (saved) { setDefaultRole(saved as TaskRole); setSelectedRole(saved as TaskRole); }
  }, []);
  useEffect(() => {
    if (defaultRole) localStorage.setItem('tasks_default_role', defaultRole);
    else localStorage.removeItem('tasks_default_role');
  }, [defaultRole]);

  // Persist default wards
  useEffect(() => {
    const saved = localStorage.getItem('tasks_default_wards');
    if (saved) { try { setDefaultWards(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);
  useEffect(() => {
    if (defaultWards.length > 0) localStorage.setItem('tasks_default_wards', JSON.stringify(defaultWards));
    else localStorage.removeItem('tasks_default_wards');
  }, [defaultWards]);

  const loading = tasksLoading || patientsLoading;

  // Enrich tasks with patient data
  const tasks: PatientTaskWithPatient[] = rawTasks.map(t => ({
    ...t,
    patient: patients.find(p => p.id === t.patientId),
  }));

  const handleStatusChange = useCallback((id: string, status: TaskStatus) => {
    storage.updateTask(id, { status });
    refresh();
  }, [refresh]);

  const handleReassign = useCallback((id: string, roles: TaskRole[]) => {
    storage.updateTask(id, { assignedTo: roles });
    refresh();
  }, [refresh]);

  const handleAddComment = useCallback((id: string, comment: { text: string; createdBy: string }) => {
    const newComment: TaskComment = { id: uuidv4(), text: comment.text, createdBy: comment.createdBy, createdAt: new Date().toISOString() };
    storage.addCommentToTask(id, newComment);
    refresh();
  }, [refresh]);

  const handleMarkCommentSeen = useCallback((taskId: string, commentId: string) => {
    storage.markTaskCommentSeen(taskId, commentId);
    refresh();
  }, [refresh]);

  // Available wards (from patients who have tasks)
  const taskPatientIds = new Set(tasks.map(t => t.patientId));
  const availableWards = [...new Set(patients.filter(p => taskPatientIds.has(p.id)).map(p => p.ward))]
    .sort((a, b) => { const na = parseInt(a.match(/\d+/)?.[0] ?? '0'); const nb = parseInt(b.match(/\d+/)?.[0] ?? '0'); return na - nb; });

  // Available due dates from tasks
  const availableDueDates = [...new Set(tasks.filter(t => t.dueDate).map(t => t.dueDate!))]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const activeRole = selectedRole || defaultRole;
  const activeWards = selectedWards.length > 0 ? selectedWards : defaultWards;

  function applyFiltersAndSort(
    list: PatientTaskWithPatient[],
    priority: ReferralPriority[],
    status: TaskStatus[],
    sort: SortOption,
    newCommentsOnly: boolean,
    dateDue?: string[],
    wards?: string[],
    roles?: TaskRole[]
  ) {
    return list
      .filter(t => priority.length === 0 || priority.includes(t.priority))
      .filter(t => status.length === 0 || status.includes(t.status))
      .filter(t => !newCommentsOnly || (t.comments || []).some(c => !c.seenAt))
      .filter(t => !dateDue?.length || (t.dueDate && dateDue.includes(t.dueDate)))
      .filter(t => !wards?.length || (t.patient && wards.includes(t.patient.ward)))
      .filter(t => !roles?.length || t.assignedTo.some(r => roles.includes(r)))
      .sort((a, b) => {
        if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  // By Role filtered list
  const roleTaskList = applyFiltersAndSort(
    activeRole ? tasks.filter(t => t.assignedTo.includes(activeRole)) : [],
    rolePriorityFilter, roleStatusFilter, roleSort, roleCommentsFilter,
    roleDateDueFilter, roleWardFilter
  );

  // By Ward filtered list
  const wardTaskList = applyFiltersAndSort(
    activeWards.length > 0 ? tasks.filter(t => t.patient && activeWards.includes(t.patient.ward)) : [],
    wardPriorityFilter, wardStatusFilter, wardSort, wardCommentsFilter,
    undefined, undefined, wardRoleFilter
  );

  const taskCardProps = { onStatusChange: handleStatusChange, onReassign: handleReassign, onAddComment: handleAddComment, onMarkCommentSeen: handleMarkCommentSeen };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><div className="text-gray-500">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Tasks
        </h1>
        <p className="text-gray-500">Manage patient tasks across the hospital</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="flex space-x-8">
            {[{ key: 'byRole', label: 'By Role' }, { key: 'byWard', label: 'By Ward' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as SubTab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >{tab.label}</button>
            ))}
          </nav>
          <div className="bg-white rounded-lg border border-indigo-200 shadow-sm px-5 py-2 text-center">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Showing</div>
            <div className="text-2xl font-bold text-indigo-600">
              {activeTab === 'byRole' ? roleTaskList.length : wardTaskList.length}
            </div>
          </div>
        </div>
      </div>

      {/* ── By Role Tab ── */}
      {activeTab === 'byRole' && (
        <div className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <div className="flex flex-wrap gap-2">
                {TASK_ROLES.map(r => (
                  <button key={r} onClick={() => setSelectedRole(activeRole === r ? null : r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                      activeRole === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>
            {activeRole && (
              <div className="flex items-center gap-2">
                <button onClick={() => setDefaultRole(activeRole)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    defaultRole === activeRole ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-indigo-50'
                  }`}
                >{defaultRole === activeRole ? '★ Default' : '☆ Set as default'}</button>
                <button onClick={() => setSelectedRole(null)} className="text-xs text-indigo-600 hover:text-indigo-700">Show all roles</button>
              </div>
            )}
          </div>

          {!activeRole ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-indigo-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-indigo-700 font-medium">Select a role above to view tasks</p>
            </div>
          ) : (
            <>
              <TaskFiltersBar
                priorityFilter={rolePriorityFilter} setPriorityFilter={setRolePriorityFilter}
                statusFilter={roleStatusFilter} setStatusFilter={setRoleStatusFilter}
                commentsFilter={roleCommentsFilter} setCommentsFilter={setRoleCommentsFilter}
                dateDueFilter={roleDateDueFilter} setDateDueFilter={setRoleDateDueFilter} availableDates={availableDueDates}
                wardFilter={roleWardFilter} setWardFilter={setRoleWardFilter} availableWards={availableWards}
                sortOption={roleSort} setSortOption={setRoleSort}
              />
              {roleTaskList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No tasks found for {activeRole} with the current filters</div>
              ) : (
                <div className="space-y-4">
                  {roleTaskList.map(t => <TaskCard key={t.id} task={t} {...taskCardProps} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── By Ward Tab ── */}
      {activeTab === 'byWard' && (
        <div className="space-y-4">
          {/* Ward selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">Ward:</span>
              <div className="flex flex-wrap gap-2">
                {availableWards.map(w => (
                  <button key={w}
                    onClick={() => setSelectedWards(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                      activeWards.includes(w) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >{w}</button>
                ))}
              </div>
            </div>
            {activeWards.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDefaultWards(activeWards)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    JSON.stringify(defaultWards.sort()) === JSON.stringify([...activeWards].sort())
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-indigo-50'
                  }`}
                >
                  {JSON.stringify(defaultWards.sort()) === JSON.stringify([...activeWards].sort()) ? '★ Default' : '☆ Set as default'}
                </button>
                <button onClick={() => setSelectedWards([])} className="text-xs text-indigo-600 hover:text-indigo-700">Clear ward selection</button>
              </div>
            )}
          </div>

          {activeWards.length === 0 ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-8 text-center">
              <p className="text-indigo-700 font-medium">Select one or more wards above to view tasks</p>
            </div>
          ) : (
            <>
              <TaskFiltersBar
                priorityFilter={wardPriorityFilter} setPriorityFilter={setWardPriorityFilter}
                statusFilter={wardStatusFilter} setStatusFilter={setWardStatusFilter}
                commentsFilter={wardCommentsFilter} setCommentsFilter={setWardCommentsFilter}
                roleFilter={wardRoleFilter} setRoleFilter={setWardRoleFilter}
                sortOption={wardSort} setSortOption={setWardSort}
              />
              {wardTaskList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No tasks found for the selected ward(s) with the current filters</div>
              ) : (
                <div className="space-y-4">
                  {wardTaskList.map(t => <TaskCard key={t.id} task={t} {...taskCardProps} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
