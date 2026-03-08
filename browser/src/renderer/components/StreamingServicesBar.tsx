/**
 * Always-visible category chips bar with expandable provider grid.
 * Replaces the old Settings > "Streaming Logins" flow.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCredentials } from '../hooks/useCredentials';
import { useAuth } from '../hooks/useAuth';
import { CredentialForm, CustomCredentialForm } from './CredentialForm';
import { CATEGORIES, FAMILY_CATEGORY, findCredentialForSite, getDomainFromUrl } from '../lib/service-categories';
import { ipc, requestChromeExpansion, releaseChromeExpansion } from '../lib/ipc';
import type { CategoryDef } from '../lib/service-categories';
import type { SuggestedSite } from '../lib/suggested-sites';
import type { CredentialInfo } from '../lib/ipc';

const CHROME_BAR_HEIGHT = 130;

interface StreamingServicesBarProps {
  onNavigate: (url: string) => void;
}

export function StreamingServicesBar({ onNavigate }: StreamingServicesBarProps) {
  const { credentials, saveCredential, saveCustomCredential } = useCredentials();
  const { isLoggedIn } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeCategory !== null;

  useEffect(() => {
    if (isExpanded) {
      requestChromeExpansion();
      return () => releaseChromeExpansion();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (gridRef.current && !gridRef.current.contains(target)) {
        // Don't close if clicking on a portal element (dropdown, modal, etc.)
        // Portals render on document.body but logically belong to the panel.
        if (target.closest?.('[data-portal]') || target.closest?.('[data-dropdown-portal]')) return;
        setActiveCategory(null);
        setEditingServiceId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleChipClick = useCallback((name: string) => {
    setActiveCategory((prev) => (prev === name ? null : name));
    setEditingServiceId(null);
  }, []);

  const handleProviderClick = useCallback(
    (site: SuggestedSite, cred: CredentialInfo | undefined) => {
      if (cred?.hasPassword) {
        // Navigate to login URL for auto-fill, falling back to homepage
        onNavigate(site.loginUrl || site.url);
        setActiveCategory(null);
        setEditingServiceId(null);
      } else {
        setEditingServiceId(site.name);
      }
    },
    [onNavigate],
  );

  const handleSaveBuiltIn = useCallback(
    async (serviceId: string, username: string, password: string) => {
      await saveCredential(serviceId, username, password);
      setEditingServiceId(null);
    },
    [saveCredential],
  );

  const handleSaveCustom = useCallback(
    async (name: string, loginUrl: string, username: string, password: string) => {
      await saveCustomCredential(name, loginUrl, username, password);
      setEditingServiceId(null);
    },
    [saveCustomCredential],
  );

  const activeCat = CATEGORIES.find((c) => c.name === activeCategory);

  // Count connected services for active category
  const connectedCount = activeCat
    ? activeCat.sites.filter((s) => findCredentialForSite(s, credentials)?.hasPassword).length
    : 0;

  return (
    <div ref={gridRef}>
      {/* Category chips row */}
      <div className="h-[32px] flex items-center gap-1.5 px-3 border-t border-chrome-border-subtle">
        {/* Family chip — always first, navigates to phosra://family */}
        <FamilyChip
          isActive={false}
          isLoggedIn={isLoggedIn}
          onClick={async () => {
            if (!ipc) return;
            // Reuse existing family tab or create a new one
            const state = await ipc.listTabs();
            const existing = state.tabs.find((t) => t.url.startsWith('phosra://family'));
            if (existing) {
              ipc.switchTab(existing.id);
            } else {
              ipc.createTab('phosra://family');
            }
          }}
        />

        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.name}
            category={cat}
            credentials={credentials}
            isActive={activeCategory === cat.name}
            onClick={() => handleChipClick(cat.name)}
          />
        ))}
      </div>

      {/* Expanded provider grid */}
      {activeCat && (
        <ProviderPanel category={activeCat}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeCat.color.replace('text-', 'bg-')}`} />
              <span className="text-[12px] font-medium text-chrome-text">{activeCat.name}</span>
            </div>
            <span className="text-[11px] text-chrome-text-secondary">
              {connectedCount} of {activeCat.sites.length} connected
            </span>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {activeCat.sites.map((site, index) => {
              const cred = findCredentialForSite(site, credentials);
              return (
                <ProviderTile
                  key={site.name}
                  site={site}
                  credential={cred}
                  category={activeCat}
                  isEditing={editingServiceId === site.name}
                  onClick={() => handleProviderClick(site, cred)}
                  index={index}
                />
              );
            })}
          </div>

          {editingServiceId && (
            <InlineCredentialForm
              siteName={editingServiceId}
              activeCat={activeCat}
              credentials={credentials}
              onSaveBuiltIn={handleSaveBuiltIn}
              onSaveCustom={handleSaveCustom}
              onCancel={() => setEditingServiceId(null)}
            />
          )}
        </ProviderPanel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryChip
// ---------------------------------------------------------------------------

function CategoryChip({
  category,
  credentials,
  isActive,
  onClick,
}: {
  category: CategoryDef;
  credentials: CredentialInfo[];
  isActive: boolean;
  onClick: () => void;
}) {
  const total = category.sites.length;
  const withCreds = category.sites.filter(
    (s) => findCredentialForSite(s, credentials)?.hasPassword,
  ).length;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2.5 h-[24px] rounded-full
        text-[11px] font-medium transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome-accent/50
        ${
          isActive
            ? `${category.bgColor} ${category.ringColor} ring-1 text-chrome-text font-semibold`
            : 'text-chrome-text-secondary hover:bg-chrome-hover/50 hover:text-chrome-text'
        }
      `}
    >
      <span className={`rounded-full transition-colors duration-150 ${isActive ? `w-2 h-2 ${category.color.replace('text-', 'bg-')}` : 'w-1.5 h-1.5 bg-chrome-text-secondary/50'}`} />
      {category.name}
      {withCreds > 0 && (
        <span className="text-[9px] opacity-50">{withCreds}/{total}</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// FamilyChip
// ---------------------------------------------------------------------------

function FamilyChip({
  isActive,
  isLoggedIn,
  onClick,
}: {
  isActive: boolean;
  isLoggedIn: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2.5 h-[24px] rounded-full
        text-[11px] font-medium transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50
        ${
          isActive
            ? `${FAMILY_CATEGORY.bgColor} ${FAMILY_CATEGORY.ringColor} ring-1 text-chrome-text font-semibold`
            : 'text-chrome-text-secondary hover:bg-chrome-hover/50 hover:text-chrome-text'
        }
      `}
    >
      {/* Shield icon */}
      <svg className={`w-3 h-3 ${isActive ? 'text-teal-400' : 'text-chrome-text-secondary/70'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Family
      {isLoggedIn && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ProviderPanel — wraps the expanded grid with ResizeObserver for dynamic height
// ---------------------------------------------------------------------------

function ProviderPanel({ category, children }: { category: CategoryDef; children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      ipc?.setChromeHeight(el.scrollHeight + CHROME_BAR_HEIGHT);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={panelRef}
      className="border-t border-chrome-border-subtle backdrop-blur-xl px-4 py-4 animate-slide-down shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-b border-b-chrome-border"
      style={{
        backgroundColor: 'rgba(30,32,40,0.97)',
        backgroundImage: category.panelGradient,
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProviderTile
// ---------------------------------------------------------------------------

function ProviderTile({
  site,
  credential,
  category,
  isEditing,
  onClick,
  index,
}: {
  site: SuggestedSite;
  credential: CredentialInfo | undefined;
  category: CategoryDef;
  isEditing: boolean;
  onClick: () => void;
  index: number;
}) {
  const hasCreds = credential?.hasPassword ?? false;
  // Staggered entrance: 30ms per tile, capped at 180ms
  const delay = Math.min(index * 30, 180);

  return (
    <button
      onClick={onClick}
      className={`
        relative min-w-[110px] h-[104px] rounded-xl flex flex-col items-center justify-center gap-2.5
        border transition-all duration-200 animate-tile-enter
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome-accent/50
        ${
          isEditing
            ? 'border-chrome-accent/30 shadow-glow'
            : hasCreds
              ? `border-emerald-400/20 hover:border-emerald-400/40 hover:-translate-y-0.5 ${category.hoverGlow}`
              : `border-chrome-border-subtle hover:border-chrome-border hover:-translate-y-0.5 ${category.hoverGlow}`
        }
      `}
      style={{
        animationDelay: `${delay}ms`,
        backgroundColor: isEditing ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
      }}
    >
      {/* Favicon container */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-tile transition-all duration-200 ${hasCreds ? 'ring-1 ring-emerald-400/25' : ''}`}
        style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
      >
        <ServiceFavicon site={site} size={40} />
      </div>

      {/* Service name */}
      <span
        className={`text-[11px] w-full px-2 text-center leading-tight line-clamp-2 ${hasCreds ? 'font-medium' : ''}`}
        style={{ color: hasCreds ? 'var(--chrome-text)' : 'rgba(229,229,234,0.8)' }}
      >
        {site.name}
      </span>

      {/* Connected indicator */}
      {hasCreds && (
        <>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-emerald-400/40" />
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ServiceFavicon
// ---------------------------------------------------------------------------

function ServiceFavicon({ site, size = 32 }: { site: SuggestedSite; size?: number }) {
  const [hasError, setHasError] = useState(false);
  const domain = getDomainFromUrl(site.url);
  // Request larger favicon for crisp rendering
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (hasError) {
    const initial = site.name.charAt(0).toUpperCase();
    return (
      <div
        className="rounded-lg bg-gradient-to-br from-chrome-accent/20 to-purple-500/10 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-[16px] font-semibold text-chrome-accent">{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt={site.name}
      width={size}
      height={size}
      className="rounded-lg"
      onError={() => setHasError(true)}
    />
  );
}

// ---------------------------------------------------------------------------
// InlineCredentialForm
// ---------------------------------------------------------------------------

function InlineCredentialForm({
  siteName,
  activeCat,
  credentials,
  onSaveBuiltIn,
  onSaveCustom,
  onCancel,
}: {
  siteName: string;
  activeCat: CategoryDef;
  credentials: CredentialInfo[];
  onSaveBuiltIn: (serviceId: string, username: string, password: string) => Promise<void>;
  onSaveCustom: (name: string, loginUrl: string, username: string, password: string) => Promise<void>;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const [explainerSeen, setExplainerSeen] = useState(() => {
    try {
      return localStorage.getItem('phosra-cred-explainer-seen') === '1';
    } catch {
      return false;
    }
  });

  const site = activeCat.sites.find((s) => s.name === siteName);

  // Auto-scroll the form into view when it appears
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [siteName, explainerSeen]);

  if (!site) return null;

  const cred = findCredentialForSite(site, credentials);
  const hasAnyCredentials = credentials.some((c) => c.hasPassword);

  // First-use explainer: show before first credential save if never dismissed
  if (!explainerSeen && !hasAnyCredentials) {
    return (
      <div ref={formRef} className="mt-4 p-4 rounded-xl bg-chrome-surface border border-chrome-border-subtle max-w-sm animate-fade-in">
        <div className="text-[13px] font-semibold text-chrome-text mb-2">Why add logins?</div>
        <div className="text-[12px] text-chrome-text-secondary leading-relaxed space-y-2 mb-3">
          <p>Phosra uses credentials to periodically check safety settings, content ratings, and profile configurations on your child's accounts.</p>
          <p>
            <svg className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
            Stored on this device only, encrypted with OS keychain.
          </p>
          <p>
            <svg className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Never sent to any server.
          </p>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem('phosra-cred-explainer-seen', '1'); } catch {}
            setExplainerSeen(true);
          }}
          className="w-full h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-medium transition-colors"
        >
          Got it, add login
        </button>
      </div>
    );
  }

  return (
    <div ref={formRef} className="mt-4 p-4 rounded-xl bg-chrome-surface border border-chrome-border-subtle max-w-sm animate-fade-in">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-lg bg-chrome-bg/60 flex items-center justify-center shadow-tile">
          <ServiceFavicon site={site} size={32} />
        </div>
        <span className="text-[13px] font-medium text-chrome-text">{site.name}</span>
      </div>

      {/* Trust banner */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-[11px] text-emerald-300/90 leading-relaxed">
          <strong>Stored locally</strong> — encrypted via macOS Keychain. Never sent to any server.
        </span>
      </div>

      {cred && !cred.isCustom ? (
        <CredentialForm
          credential={cred}
          onSave={onSaveBuiltIn}
          onCancel={onCancel}
        />
      ) : (
        <CustomCredentialForm
          credential={cred ?? undefined}
          onSave={(name, loginUrl, username, password, existingId) =>
            onSaveCustom(name || site.name, loginUrl || site.url, username, password)
          }
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
