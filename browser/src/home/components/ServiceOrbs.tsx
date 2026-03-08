import React, { useState } from 'react';

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

interface ServiceOrbsProps {
  credentials: HomeCredential[];
}

/** Suggested services shown when no credentials exist */
const SUGGESTED_SERVICES: HomeCredential[] = [
  { serviceId: 'netflix', displayName: 'Netflix', username: '', hasPassword: false, updatedAt: '', isCustom: false, loginUrl: 'https://www.netflix.com/login' },
  { serviceId: 'disney-plus', displayName: 'Disney+', username: '', hasPassword: false, updatedAt: '', isCustom: false, loginUrl: 'https://www.disneyplus.com/login' },
  { serviceId: 'chatgpt', displayName: 'ChatGPT', username: '', hasPassword: false, updatedAt: '', isCustom: false, loginUrl: 'https://chat.openai.com' },
  { serviceId: 'youtube', displayName: 'YouTube', username: '', hasPassword: false, updatedAt: '', isCustom: false, loginUrl: 'https://www.youtube.com' },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'example.com';
  }
}

function getFaviconUrl(loginUrl?: string): string {
  if (!loginUrl) return '';
  const domain = getDomain(loginUrl);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function ServiceOrb({
  credential,
  isEmpty,
}: {
  credential: HomeCredential;
  isEmpty?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (isEmpty || !credential.loginUrl) return;
    const api = (window as any).phosraHome;
    if (api?.navigateTo) {
      api.navigateTo(credential.loginUrl);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleClick}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-200 ease-out cursor-pointer
          ${isEmpty
            ? 'ring-1 ring-dashed ring-white/10'
            : 'ring-1 ring-white/10'
          }
          ${hovered ? 'scale-110' : 'scale-100'}
        `}
        style={{
          background: isEmpty
            ? 'rgba(var(--chrome-surface-raw, 26, 31, 46), 0.3)'
            : 'rgba(26, 31, 46, 0.5)',
          boxShadow: hovered && !isEmpty
            ? '0 0 24px rgba(52, 211, 153, 0.15)'
            : 'none',
        }}
      >
        {credential.loginUrl ? (
          <img
            src={getFaviconUrl(credential.loginUrl)}
            alt={credential.displayName}
            className="w-8 h-8 rounded-sm"
            style={{ opacity: isEmpty ? 0.4 : 1 }}
            draggable={false}
          />
        ) : (
          <span
            className="text-lg font-semibold"
            style={{ color: 'var(--chrome-text-secondary)', opacity: 0.6 }}
          >
            {credential.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* Green connected indicator */}
      {!isEmpty && credential.hasPassword && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
          style={{ boxShadow: '0 0 0 2px #0E1117' }}
        />
      )}

      {/* Hover label */}
      <span
        className={`
          mt-2 text-center whitespace-nowrap
          transition-opacity duration-150
          ${hovered ? 'animate-fade-in opacity-100' : 'opacity-0'}
        `}
        style={{
          fontSize: '11px',
          color: isEmpty ? 'var(--chrome-accent)' : 'var(--chrome-text-secondary)',
        }}
      >
        {isEmpty ? 'Connect' : credential.displayName}
      </span>
    </div>
  );
}

function AddOrb() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <button
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-200 ease-out cursor-pointer
          ${hovered ? 'scale-110' : 'scale-100'}
        `}
        style={{
          background: 'rgba(26, 31, 46, 0.3)',
          border: `1px dashed ${hovered ? 'rgba(108, 140, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
          color: hovered ? 'var(--chrome-accent)' : 'var(--chrome-text-secondary)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Plus icon (Lucide-style) */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Spacer to match orb label height */}
      <span className="mt-2" style={{ fontSize: '11px', opacity: 0 }}>
        &nbsp;
      </span>
    </div>
  );
}

export function ServiceOrbs({ credentials }: ServiceOrbsProps) {
  // Filter to only services with passwords, sorted by name, capped at 6
  const connected = credentials
    .filter((c) => c.hasPassword)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .slice(0, 6);

  const hasConnected = connected.length > 0;

  return (
    <div className="flex items-start gap-5">
      {hasConnected
        ? connected.map((cred) => (
            <ServiceOrb key={cred.serviceId} credential={cred} />
          ))
        : SUGGESTED_SERVICES.map((svc) => (
            <ServiceOrb key={svc.serviceId} credential={svc} isEmpty />
          ))}
      <AddOrb />
    </div>
  );
}
