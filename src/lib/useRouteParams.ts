'use client';

import { useParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useRedirectPath } from './RedirectPathContext';

/**
 * Custom hook that extracts route parameters from either:
 * 1. Next.js useParams() when available (normal navigation)
 * 2. The redirect path context (for GitHub Pages 404 redirect scenario)
 * 3. The URL pathname as fallback
 *
 * This is needed because with static export, dynamic routes may not exist
 * and the 404.html redirect pattern updates the URL via history.replaceState
 * without actually navigating through Next.js routing.
 */
export function usePatientId(): string {
  const params = useParams();
  const pathname = usePathname();
  const redirectPath = useRedirectPath();

  return useMemo(() => {
    // First try to get from useParams (works for normal navigation)
    if (params.id && params.id !== 'placeholder') {
      return params.id as string;
    }

    // Use redirect path from context if available, otherwise fall back to pathname
    const pathToUse = redirectPath || pathname;

    // Parse the path
    // Expected patterns: /patients/:id or /patients/:id/edit
    const segments = pathToUse.split('/').filter(Boolean);
    const patientsIndex = segments.indexOf('patients');

    if (patientsIndex !== -1 && segments.length > patientsIndex + 1) {
      const id = segments[patientsIndex + 1];
      // Clean any hash or query params from the ID
      return id.split('#')[0].split('?')[0];
    }

    return '';
  }, [params.id, pathname, redirectPath]);
}

export function useHandoverId(): string {
  const params = useParams();
  const pathname = usePathname();
  const redirectPath = useRedirectPath();

  return useMemo(() => {
    // First try to get from useParams (works for normal navigation)
    if (params.id && params.id !== 'placeholder') {
      return params.id as string;
    }

    // Use redirect path from context if available, otherwise fall back to pathname
    const pathToUse = redirectPath || pathname;

    // Parse the path
    // Expected pattern: /handover/:id
    const segments = pathToUse.split('/').filter(Boolean);
    const handoverIndex = segments.indexOf('handover');

    if (handoverIndex !== -1 && segments.length > handoverIndex + 1) {
      const nextSegment = segments[handoverIndex + 1];
      // Make sure it's not 'new' (which would be /handover/new/:patientId)
      if (nextSegment !== 'new') {
        return nextSegment.split('#')[0].split('?')[0];
      }
    }

    return '';
  }, [params.id, pathname, redirectPath]);
}

export function useNewHandoverPatientId(): string {
  const params = useParams();
  const pathname = usePathname();
  const redirectPath = useRedirectPath();

  return useMemo(() => {
    // First try to get from useParams (works for normal navigation)
    if (params.patientId && params.patientId !== 'placeholder') {
      return params.patientId as string;
    }

    // Use redirect path from context if available, otherwise fall back to pathname
    const pathToUse = redirectPath || pathname;

    // Parse the path
    // Expected pattern: /handover/new/:patientId
    const segments = pathToUse.split('/').filter(Boolean);
    const handoverIndex = segments.indexOf('handover');

    if (
      handoverIndex !== -1 &&
      segments.length > handoverIndex + 2 &&
      segments[handoverIndex + 1] === 'new'
    ) {
      const patientId = segments[handoverIndex + 2];
      return patientId.split('#')[0].split('?')[0];
    }

    return '';
  }, [params.patientId, pathname, redirectPath]);
}
