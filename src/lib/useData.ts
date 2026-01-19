'use client';

import { useEffect, useState, useCallback } from 'react';
import { Patient, HandoverNote, HospitalAtNightEntry } from './types';
import * as storage from './localStorage';

// Initialize data on first load
let initialized = false;

function ensureInitialized() {
  if (typeof window !== 'undefined' && !initialized) {
    storage.initializeData();
    initialized = true;
  }
}

// Hook for patients
export function usePatients(activeOnly = true) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setPatients(storage.getAllPatients(activeOnly));
    setLoading(false);
  }, [activeOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPatient = useCallback((patient: Patient) => {
    storage.createPatient(patient);
    refresh();
    return patient;
  }, [refresh]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    const result = storage.updatePatient(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const dischargePatient = useCallback((id: string) => {
    const result = storage.dischargePatient(id);
    refresh();
    return result;
  }, [refresh]);

  const deletePatient = useCallback((id: string) => {
    const result = storage.deletePatient(id);
    refresh();
    return result;
  }, [refresh]);

  return { patients, loading, refresh, createPatient, updatePatient, dischargePatient, deletePatient };
}

// Hook for single patient
export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setPatient(storage.getPatientById(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback((updates: Partial<Patient>) => {
    const result = storage.updatePatient(id, updates);
    refresh();
    return result;
  }, [id, refresh]);

  return { patient, loading, refresh, update };
}

// Hook for handover notes
export function useHandoverNotes(patientId?: string) {
  const [notes, setNotes] = useState<HandoverNote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    if (patientId) {
      setNotes(storage.getHandoverNotesByPatient(patientId));
    } else {
      setNotes(storage.getAllHandoverNotes());
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createNote = useCallback((note: HandoverNote) => {
    storage.createHandoverNote(note);
    refresh();
    return note;
  }, [refresh]);

  const updateNote = useCallback((id: string, updates: Partial<HandoverNote>) => {
    const result = storage.updateHandoverNote(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const deleteNote = useCallback((id: string) => {
    const result = storage.deleteHandoverNote(id);
    refresh();
    return result;
  }, [refresh]);

  return { notes, loading, refresh, createNote, updateNote, deleteNote };
}

// Hook for single handover note
export function useHandoverNote(id: string) {
  const [note, setNote] = useState<HandoverNote | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setNote(storage.getHandoverNoteById(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { note, loading, refresh };
}

// Hook for hospital at night entries
export function useHospitalAtNight() {
  const [entries, setEntries] = useState<HospitalAtNightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setEntries(storage.getAllHospitalAtNightEntries());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEntry = useCallback((entry: HospitalAtNightEntry) => {
    storage.createHospitalAtNightEntry(entry);
    refresh();
    return entry;
  }, [refresh]);

  const updateEntry = useCallback((id: string, updates: Partial<HospitalAtNightEntry>) => {
    const result = storage.updateHospitalAtNightEntry(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const deleteEntry = useCallback((id: string) => {
    const result = storage.deleteHospitalAtNightEntry(id);
    refresh();
    return result;
  }, [refresh]);

  return { entries, loading, refresh, createEntry, updateEntry, deleteEntry };
}

// Hook for hospital at night entries by patient
export function useHospitalAtNightByPatient(patientId: string) {
  const [entries, setEntries] = useState<HospitalAtNightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setEntries(storage.getHospitalAtNightByPatient(patientId));
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}

// Hook for unique wards
export function useWards() {
  const [wards, setWards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureInitialized();
    setWards(storage.getUniqueWards());
    setLoading(false);
  }, []);

  return { wards, loading };
}

// Hook for patients with latest handover
export function usePatientsWithHandover() {
  const [patients, setPatients] = useState<(Patient & { latestHandover?: HandoverNote })[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ensureInitialized();
    setPatients(storage.getPatientsWithLatestHandover());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patients, loading, refresh };
}

// Reset to sample data
export function useResetData() {
  return useCallback(() => {
    storage.resetToSampleData();
    window.location.reload();
  }, []);
}
