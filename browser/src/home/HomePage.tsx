import React, { useState, useEffect } from 'react';
import { TimeDisplay } from './components/TimeDisplay';
import { ShieldStatus } from './components/ShieldStatus';
import { ServiceOrbs } from './components/ServiceOrbs';
import { SearchHint } from './components/SearchHint';

/** Matches HomeCredential from home/preload.ts */
interface HomeCredential {
  serviceId: string;
  displayName: string;
  username: string;
  hasPassword: boolean;
  updatedAt: string;
  isCustom: boolean;
  loginUrl?: string;
}

/** API surface exposed by the preload script into window.phosraHome */
interface PhosraHomeAPI {
  getCredentials: () => Promise<HomeCredential[]>;
  navigateTo: (url: string) => void;
  focusAddressBar: () => void;
  getRecentServices: () => Promise<string[]>;
}

declare global {
  interface Window {
    phosraHome?: PhosraHomeAPI;
  }
}

export function HomePage() {
  const [credentials, setCredentials] = useState<HomeCredential[]>([]);

  // Fetch credentials on mount
  useEffect(() => {
    async function load() {
      try {
        const api = window.phosraHome;
        if (api?.getCredentials) {
          const creds = await api.getCredentials();
          setCredentials(creds);
        }
      } catch {
        // Silently degrade — empty state will show suggested services
      }
    }
    load();
  }, []);

  // Global "/" keypress to focus address bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only trigger on bare "/" (no modifier keys), and not when user is typing in an input
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        window.phosraHome?.focusAddressBar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const connectedCount = credentials.filter((c) => c.hasPassword).length;

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle animated background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108, 140, 255, 0.03), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <TimeDisplay />
        <ShieldStatus connectedCount={connectedCount} />
        <ServiceOrbs credentials={credentials} />
        <SearchHint />
      </div>
    </div>
  );
}
