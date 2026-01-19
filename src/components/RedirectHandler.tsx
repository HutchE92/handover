'use client';

import { useEffect, useState, ReactNode } from 'react';
import PatientDetailClient from '@/app/patients/[id]/PatientDetailClient';
import EditPatientClient from '@/app/patients/[id]/edit/EditPatientClient';
import HandoverDetailClient from '@/app/handover/[id]/HandoverDetailClient';
import NewHandoverClient from '@/app/handover/new/[patientId]/NewHandoverClient';
import { RedirectPathProvider } from '@/lib/RedirectPathContext';

export default function RedirectHandler({ children }: { children?: ReactNode }) {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if there's a redirect path stored from 404.html
    const storedPath = sessionStorage.getItem('redirectPath');
    if (storedPath) {
      sessionStorage.removeItem('redirectPath');
      setRedirectPath(storedPath);

      // Update the browser URL without triggering navigation
      const basePath = process.env.NODE_ENV === 'production' ? '/handover' : '';
      window.history.replaceState(null, '', basePath + storedPath);
    }
    setIsChecked(true);
  }, []);

  // Don't render anything until we've checked for redirect
  if (!isChecked) {
    return null;
  }

  // If we have a redirect path, render the appropriate component instead of children
  if (redirectPath) {
    const renderedComponent = renderDynamicRoute(redirectPath);
    if (renderedComponent) {
      return (
        <RedirectPathProvider path={redirectPath}>
          {renderedComponent}
        </RedirectPathProvider>
      );
    }
  }

  // No redirect or unknown path - render children normally
  return <RedirectPathProvider path={null}>{children}</RedirectPathProvider>;
}

// Function that returns the correct component based on the redirect path
function renderDynamicRoute(path: string): ReactNode | null {
  // Parse the path to determine which component to render
  const segments = path.split('/').filter(Boolean);

  // Remove hash and query from last segment
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const hashIndex = lastSegment.indexOf('#');
    const queryIndex = lastSegment.indexOf('?');
    const cutIndex = Math.min(
      hashIndex === -1 ? Infinity : hashIndex,
      queryIndex === -1 ? Infinity : queryIndex
    );
    if (cutIndex !== Infinity) {
      segments[segments.length - 1] = lastSegment.substring(0, cutIndex);
    }
  }

  // /patients/:id
  if (segments[0] === 'patients' && segments.length === 2 && segments[1] !== 'new') {
    return <PatientDetailClient />;
  }

  // /patients/:id/edit
  if (segments[0] === 'patients' && segments.length === 3 && segments[2] === 'edit') {
    return <EditPatientClient />;
  }

  // /handover/:id
  if (segments[0] === 'handover' && segments.length === 2 && segments[1] !== 'new') {
    return <HandoverDetailClient />;
  }

  // /handover/new/:patientId
  if (segments[0] === 'handover' && segments.length === 3 && segments[1] === 'new') {
    return <NewHandoverClient />;
  }

  // Unknown path - return null to use normal children
  return null;
}
