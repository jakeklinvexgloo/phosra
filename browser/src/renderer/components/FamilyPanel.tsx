/**
 * Family panel — three states: sign in, create family, family overview.
 * Renders inside the StreamingServicesBar expanded area when the Family chip is active.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFamily } from '../hooks/useFamily';
import { useConfigAgent } from '../hooks/useConfigAgent';
import { useCredentials } from '../hooks/useCredentials';
import { ConfigAgentDrawer } from './ConfigAgent';
import { ActivityPanel } from './ActivityPanel';
import { InsightsPanel } from './InsightsPanel';
import { useCSMEnrichment } from '../hooks/useCSMEnrichment';
import { FAMILY_CATEGORY } from '../lib/service-categories';
import { ipc } from '../lib/ipc';
import type { Strictness, FamilyRole, FamilyMember, ProfileMappingInput } from '../lib/ipc';

const CHROME_BAR_HEIGHT = 130;

interface FamilyPanelProps {
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export function FamilyPanel({ onNavigate, onClose }: FamilyPanelProps) {
  const { authInfo, isLoggedIn, isLoading: authLoading, logout, loginNavigate } = useAuth();
  const { families, children, members, isLoading: familyLoading, error, quickSetup, addChild, updateChild, addMember, updateMember, removeMember } = useFamily(isLoggedIn);
  const configAgent = useConfigAgent();
  const { credentials } = useCredentials();
  const [childMappings, setChildMappings] = useState<ProfileMappingInput[]>([]);

  // Check if Netflix credentials are stored
  const hasNetflixCreds = credentials.some((c) => c.serviceId === 'netflix' && c.hasPassword);

  // Load persisted child-profile mappings and resolve real DB child IDs
  useEffect(() => {
    if (!ipc?.loadNetflixMappings || children.length === 0) return;
    ipc.loadNetflixMappings().then((result) => {
      if (!result.success || !result.data) return;
      const mappings = result.data as Array<{
        netflixProfile: { guid: string; name: string; avatarUrl: string };
        familyMemberId?: string;
        familyMemberName?: string;
        familyMemberType: string;
      }>;
      const mapped: ProfileMappingInput[] = [];
      for (const m of mappings) {
        if (m.familyMemberType !== 'child') continue;
        const mappingName = (m.familyMemberName || m.netflixProfile.name).toLowerCase().trim();
        // Match Netflix mapping name to a real DB child by name
        // Config agent prepends "Persist_" so strip any prefix
        const dbChild = children.find((c) => {
          const cn = c.name.toLowerCase().trim();
          return mappingName === cn || mappingName.endsWith(cn) || cn.endsWith(mappingName);
        });
        mapped.push({
          childName: dbChild?.name || m.familyMemberName || m.netflixProfile.name,
          childId: dbChild?.id || m.familyMemberId || '',
          profileGuid: m.netflixProfile.guid,
          profileName: m.netflixProfile.name,
          avatarUrl: m.netflixProfile.avatarUrl,
        });
      }
      setChildMappings(mapped);
    });
  }, [children]);

  if (authLoading) {
    return (
      <PanelShell>
        <div className="flex items-center justify-center py-8">
          <span className="text-[12px] text-white/50 animate-pulse">Loading...</span>
        </div>
      </PanelShell>
    );
  }

  if (!isLoggedIn) {
    return <SignInState onLogin={loginNavigate} />;
  }

  if (familyLoading) {
    return (
      <PanelShell>
        <div className="flex items-center justify-center py-8">
          <span className="text-[12px] text-white/50 animate-pulse">Loading family...</span>
        </div>
      </PanelShell>
    );
  }

  if (families.length === 0) {
    return <CreateFamilyState onSetup={quickSetup} error={error} />;
  }

  return (
    <>
      <FamilyOverview
        families={families}
        children={children}
        members={members}
        email={authInfo.email}
        onLogout={logout}
        onAddChild={addChild}
        onUpdateChild={updateChild}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onRemoveMember={removeMember}
        error={error}
        hasNetflixCreds={hasNetflixCreds}
        onConfigureNetflix={configAgent.start}
        onResumeNetflix={configAgent.hasSavedState ? configAgent.resume : undefined}
        childMappings={childMappings}
      />
      {configAgent.isOpen && (
        <ConfigAgentDrawer
          agent={configAgent}
          children={children}
          members={members}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Panel shell (consistent styling)
// ---------------------------------------------------------------------------

function PanelShell({ children }: { children: React.ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      // Use scrollHeight to get full content size, avoiding feedback loops
      // with CSS maxHeight constraints. Main process clamps to window bounds.
      ipc?.setChromeHeight(el.scrollHeight + CHROME_BAR_HEIGHT);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={shellRef}
      className="border-t border-chrome-border-subtle backdrop-blur-xl px-4 py-4 animate-slide-down shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-b border-b-chrome-border"
      style={{
        backgroundColor: 'rgba(30,32,40,0.97)',
        backgroundImage: FAMILY_CATEGORY.panelGradient,
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared input classes
// ---------------------------------------------------------------------------

const INPUT_CLASS = [
  'w-full h-9 px-3 rounded-lg',
  'bg-white/[0.07] border border-white/[0.1]',
  'text-[12px] text-white placeholder:text-white/30',
  'focus:outline-none focus:border-teal-400/60 focus:bg-white/[0.1]',
  'focus:ring-2 focus:ring-teal-400/20',
  'transition-all duration-200 ease-out',
  '[color-scheme:dark]',
].join(' ');

const INPUT_CLASS_BLUE = [
  'w-full h-9 px-3 rounded-lg',
  'bg-white/[0.07] border border-white/[0.1]',
  'text-[12px] text-white placeholder:text-white/30',
  'focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.1]',
  'focus:ring-2 focus:ring-blue-400/20',
  'transition-all duration-200 ease-out',
  '[color-scheme:dark]',
].join(' ');

// ---------------------------------------------------------------------------
// State A — Not logged in
// ---------------------------------------------------------------------------

function SignInState({ onLogin }: { onLogin: () => void }) {
  return (
    <PanelShell>
      <div className="flex flex-col items-center py-4 max-w-xs mx-auto text-center">
        {/* Shield icon */}
        <div
          className="w-12 h-12 rounded-xl bg-teal-400/10 flex items-center justify-center mb-3 animate-field-enter"
          style={{ animationDelay: '50ms' }}
        >
          <svg className="w-6 h-6 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        <h3
          className="text-[14px] font-semibold text-white mb-1 animate-field-enter"
          style={{ animationDelay: '100ms' }}
        >
          Set up your family
        </h3>
        <p
          className="text-[12px] text-white/50 mb-4 leading-relaxed animate-field-enter"
          style={{ animationDelay: '150ms' }}
        >
          Sign in to create your family and set protection levels for your children.
        </p>

        <button
          onClick={onLogin}
          className="w-full h-9 rounded-lg bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white text-[13px] font-medium transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(45,212,191,0.25)] hover:shadow-[0_4px_16px_rgba(45,212,191,0.35)] active:scale-[0.98] animate-field-enter"
          style={{ animationDelay: '200ms' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Sign in with Phosra
        </button>

        <p
          className="text-[10px] text-white/30 mt-2 flex items-center gap-1 animate-field-enter"
          style={{ animationDelay: '250ms' }}
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          Opens in your default browser
        </p>
      </div>
    </PanelShell>
  );
}

// ---------------------------------------------------------------------------
// State B — Logged in, no family
// ---------------------------------------------------------------------------

function CreateFamilyState({
  onSetup,
  error,
}: {
  onSetup: (req: { family_name?: string; child_name: string; birth_date: string; strictness: Strictness }) => Promise<unknown>;
  error: string | null;
}) {
  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [strictness, setStrictness] = useState<Strictness>('recommended');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!childName.trim() || !birthDate) return;
    setIsSubmitting(true);
    try {
      await onSetup({
        family_name: familyName.trim() || undefined,
        child_name: childName.trim(),
        birth_date: birthDate,
        strictness,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [familyName, childName, birthDate, strictness, onSetup]);

  const isValid = childName.trim().length > 0 && birthDate.length > 0;

  return (
    <PanelShell>
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div
          className="flex items-center gap-2 mb-4 animate-field-enter"
          style={{ animationDelay: '50ms' }}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.5)]" />
          <span className="text-[13px] font-semibold text-white">Create your family</span>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="animate-field-enter" style={{ animationDelay: '100ms' }}>
            <FormField label="Family Name" optional>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. The Smiths"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          <div className="animate-field-enter" style={{ animationDelay: '150ms' }}>
            <FormField label="Child Name">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Emma"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          <div className="animate-field-enter" style={{ animationDelay: '200ms' }}>
            <FormField label="Birthday">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          <div className="animate-field-enter" style={{ animationDelay: '250ms' }}>
            <FormField label="Strictness">
              <div className="flex gap-2">
                {(['recommended', 'strict', 'relaxed'] as Strictness[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setStrictness(level)}
                    className={`
                      flex-1 h-9 rounded-lg text-[11px] font-medium transition-all duration-200 ease-out
                      ${strictness === level
                        ? 'bg-teal-400/20 text-teal-300 ring-1 ring-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                        : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60 active:scale-[0.97]'
                      }
                    `}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
            <span className="text-[11px] text-red-400">{error}</span>
          </div>
        )}

        <div className="animate-field-enter" style={{ animationDelay: '300ms' }}>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`
              mt-4 w-full h-9 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${isValid && !isSubmitting
                ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] hover:shadow-[0_4px_16px_rgba(45,212,191,0.35)] active:scale-[0.98]'
                : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Creating...</span>
            ) : (
              'Create Family'
            )}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

// ---------------------------------------------------------------------------
// State C — Family exists
// ---------------------------------------------------------------------------

type FamilyTab = 'overview' | 'activity' | 'insights';

function FamilyOverview({
  families,
  children,
  members,
  email,
  onLogout,
  onAddChild,
  onUpdateChild,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  error,
  hasNetflixCreds,
  onConfigureNetflix,
  onResumeNetflix,
  childMappings,
}: {
  families: { id: string; name: string }[];
  children: { id: string; name: string; birth_date: string }[];
  members: FamilyMember[];
  email: string;
  onLogout: () => void;
  onAddChild: (familyId: string, name: string, birthDate: string) => Promise<unknown>;
  onUpdateChild: (childId: string, name: string, birthDate: string) => Promise<boolean>;
  onAddMember: (familyId: string, email: string, role: FamilyRole, displayName?: string) => Promise<unknown>;
  onUpdateMember: (familyId: string, memberId: string, displayName: string, role: FamilyRole) => Promise<boolean>;
  onRemoveMember: (familyId: string, memberId: string) => Promise<boolean>;
  error: string | null;
  hasNetflixCreds?: boolean;
  onConfigureNetflix?: () => void;
  onResumeNetflix?: () => void;
  childMappings: ProfileMappingInput[];
}) {
  const family = families[0];
  const [activeTab, setActiveTab] = useState<FamilyTab>('overview');
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const csmEnrichment = useCSMEnrichment();

  return (
    <PanelShell>
      <div className={activeTab === 'insights' ? 'max-w-2xl mx-auto' : 'max-w-sm mx-auto'}>
        {/* Header */}
        <div
          className="flex items-center gap-2 mb-3 animate-field-enter"
          style={{ animationDelay: '50ms' }}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.5)]" />
          <span className="text-[13px] font-semibold text-white">
            {family?.name || 'My Family'}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-3 p-0.5 rounded-lg bg-white/[0.04] animate-field-enter" style={{ animationDelay: '60ms' }}>
          {(['overview', 'activity', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'activity' ? 'Activity' : 'Insights'}
            </button>
          ))}
        </div>

        {activeTab === 'activity' ? (
          <ActivityPanel
            hasNetflixCreds={!!hasNetflixCreds}
            hasMappings={childMappings.length > 0}
            childMappings={childMappings}
          />
        ) : activeTab === 'insights' ? (
          <InsightsPanel
            children={children}
            reviews={csmEnrichment.reviews}
            isEnriching={csmEnrichment.isEnriching}
            enrichedCount={csmEnrichment.enrichedCount}
            totalCount={csmEnrichment.totalCount}
            onTriggerEnrichment={csmEnrichment.triggerEnrichment}
          />
        ) : (
        <>

        {/* Parents & Guardians Section */}
        <div className="animate-field-enter" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Parents & Guardians
            </span>
            {!showAddMemberForm && (
              <button
                onClick={() => setShowAddMemberForm(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 active:text-blue-500 transition-colors duration-150 flex items-center gap-0.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Add
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {members.map((member, i) => (
              <div
                key={member.id}
                className="animate-field-enter"
                style={{ animationDelay: `${100 + i * 40}ms` }}
              >
                {editingMemberId === member.id ? (
                  <EditMemberForm
                    member={member}
                    familyId={family.id}
                    onSave={async (displayName, role) => {
                      const ok = await onUpdateMember(family.id, member.id, displayName, role);
                      if (ok) setEditingMemberId(null);
                      return ok;
                    }}
                    onCancel={() => setEditingMemberId(null)}
                  />
                ) : (
                  <MemberCard
                    member={member}
                    isCurrentUser={member.email === email}
                    onEdit={family ? () => setEditingMemberId(member.id) : undefined}
                    onRemove={
                      member.role !== 'owner' && member.email !== email && family
                        ? () => onRemoveMember(family.id, member.id)
                        : undefined
                    }
                  />
                )}
              </div>
            ))}

            {members.length === 0 && (
              <div className="py-2 text-center text-[11px] text-white/30 animate-fade-in">
                No members loaded
              </div>
            )}
          </div>

          {/* Inline Add Member Form */}
          {showAddMemberForm && family && (
            <AddMemberForm
              familyId={family.id}
              onAdd={onAddMember}
              onCancel={() => setShowAddMemberForm(false)}
            />
          )}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-white/[0.06]" />

        {/* Children Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Children
            </span>
            {!showAddChildForm && (
              <button
                onClick={() => setShowAddChildForm(true)}
                className="text-[11px] text-teal-400 hover:text-teal-300 active:text-teal-500 transition-colors duration-150 flex items-center gap-0.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Add
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {children.map((child, i) => (
              <div
                key={child.id}
                className="animate-field-enter"
                style={{ animationDelay: `${100 + members.length * 40 + i * 60}ms` }}
              >
                {editingChildId === child.id ? (
                  <EditChildForm
                    child={child}
                    onSave={async (name, birthDate) => {
                      const ok = await onUpdateChild(child.id, name, birthDate);
                      if (ok) setEditingChildId(null);
                      return ok;
                    }}
                    onCancel={() => setEditingChildId(null)}
                  />
                ) : (
                  <ChildCard
                    child={child}
                    onEdit={() => setEditingChildId(child.id)}
                  />
                )}
              </div>
            ))}

            {children.length === 0 && (
              <div className="py-3 text-center text-[12px] text-white/40 animate-fade-in">
                No children added yet
              </div>
            )}
          </div>

          {/* Inline Add Child Form */}
          {showAddChildForm && family && (
            <AddChildForm
              familyId={family.id}
              onAdd={onAddChild}
              onCancel={() => setShowAddChildForm(false)}
            />
          )}
        </div>

        {/* Configure Services Section */}
        {hasNetflixCreds && children.length > 0 && onConfigureNetflix && (
          <>
            <div className="my-3 border-t border-white/[0.06]" />
            <div className="animate-field-enter" style={{ animationDelay: `${100 + members.length * 40 + children.length * 60 + 40}ms` }}>
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-2">
                Configure Services
              </span>
              <button
                onClick={onResumeNetflix ?? onConfigureNetflix}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:bg-white/[0.03] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#E50914]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E50914]/30 transition-colors p-1.5">
                  <svg viewBox="0 0 24 34" className="w-full h-full">
                    <rect x="0" y="0" width="6" height="34" fill="#E50914" />
                    <rect x="18" y="0" width="6" height="34" fill="#E50914" />
                    <polygon points="0,0 6,0 24,34 18,34" fill="#B1060F" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[12px] font-medium text-white">Netflix</div>
                  <div className="text-[10px] text-white/35">
                    {onResumeNetflix ? 'Resume configuration' : 'Configure parental controls'}
                  </div>
                </div>
                {onResumeNetflix && (
                  <span className="text-[9px] font-medium text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full">
                    Saved
                  </span>
                )}
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}

        </>
        )}

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
            <span className="text-[11px] text-red-400">{error}</span>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between animate-field-enter"
          style={{ animationDelay: `${100 + members.length * 40 + children.length * 60 + 60}ms` }}
        >
          <span className="text-[11px] text-white/40 truncate max-w-[200px]">{email}</span>
          <button
            onClick={onLogout}
            className="text-[11px] text-white/40 hover:text-white/70 active:text-white transition-colors duration-150"
          >
            Sign Out
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

// ---------------------------------------------------------------------------
// MemberCard — parent/guardian card with role badge
// ---------------------------------------------------------------------------

const ROLE_STYLES: Record<FamilyRole, { bg: string; text: string; label: string }> = {
  owner: { bg: 'bg-amber-400/15', text: 'text-amber-300', label: 'Owner' },
  parent: { bg: 'bg-blue-400/15', text: 'text-blue-300', label: 'Parent' },
  guardian: { bg: 'bg-purple-400/15', text: 'text-purple-300', label: 'Guardian' },
};

function MemberCard({
  member,
  isCurrentUser,
  onEdit,
  onRemove,
}: {
  member: FamilyMember;
  isCurrentUser: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const style = ROLE_STYLES[member.role] || ROLE_STYLES.parent;
  const displayName = isCurrentUser
    ? 'You'
    : member.display_name || member.name || member.email || 'Unknown';

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  }, [onRemove]);

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:bg-white/[0.03] group">
      {/* User icon avatar */}
      <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
        <svg className={`w-4 h-4 ${style.text}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-white truncate">
            {displayName}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
        {!isCurrentUser && member.email && (
          <div className="text-[10px] text-white/35 truncate">{member.email}</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 rounded-md hover:bg-blue-500/10 text-white/25 hover:text-blue-400 transition-all duration-150"
            title="Edit member"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
        {onRemove && (
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1 rounded-md hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all duration-150"
            title="Remove member"
          >
            {isRemoving ? (
              <span className="w-3.5 h-3.5 block animate-pulse text-[10px]">...</span>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddMemberForm — email + role toggle for adding parents/guardians
// ---------------------------------------------------------------------------

function AddMemberForm({
  familyId,
  onAdd,
  onCancel,
}: {
  familyId: string;
  onAdd: (familyId: string, email: string, role: FamilyRole, displayName?: string) => Promise<unknown>;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyRole>('parent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = email.trim().length > 0 && email.includes('@');

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await onAdd(familyId, email.trim(), role, displayName.trim() || undefined);
      if (result) {
        setDisplayName('');
        setEmail('');
        setRole('parent');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [familyId, displayName, email, role, isValid, onAdd]);

  return (
    <div className="mt-2.5 p-3 rounded-xl border border-dashed border-blue-400/20 bg-blue-400/[0.03] animate-field-enter">
      <div className="space-y-2.5">
        <div className="animate-field-enter" style={{ animationDelay: '50ms' }}>
          <FormField label="Name">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Mom, Grandpa Joe"
              className={INPUT_CLASS_BLUE}
              autoFocus
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '100ms' }}>
          <FormField label="Email Address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className={INPUT_CLASS_BLUE}
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '150ms' }}>
          <FormField label="Role">
            <div className="flex gap-2">
              {(['parent', 'guardian'] as FamilyRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`
                    flex-1 h-9 rounded-lg text-[11px] font-medium transition-all duration-200 ease-out
                    ${role === r
                      ? 'bg-blue-400/20 text-blue-300 ring-1 ring-blue-400/40 shadow-[0_0_12px_rgba(96,165,250,0.15)]'
                      : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60 active:scale-[0.97]'
                    }
                  `}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      {formError && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
          <span className="text-[11px] text-red-400">{formError}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3 animate-field-enter" style={{ animationDelay: '200ms' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`
            flex-1 h-9 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5
            ${isValid && !isSubmitting
              ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white shadow-[0_2px_8px_rgba(96,165,250,0.25)] hover:shadow-[0_4px_16px_rgba(96,165,250,0.35)] active:scale-[0.98]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Adding...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
              Add Member
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 h-9 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddChildForm — inline form that slides in below the child list
// ---------------------------------------------------------------------------

function AddChildForm({
  familyId,
  onAdd,
  onCancel,
}: {
  familyId: string;
  onAdd: (familyId: string, name: string, birthDate: string) => Promise<unknown>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [strictness, setStrictness] = useState<Strictness>('recommended');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && birthDate.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await onAdd(familyId, name.trim(), birthDate);
      if (result) {
        // Success — reset form for another add
        setName('');
        setBirthDate('');
        setStrictness('recommended');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [familyId, name, birthDate, strictness, isValid, onAdd]);

  return (
    <div
      className="mt-2.5 p-3 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] animate-field-enter"
    >
      <div className="space-y-3">
        <div className="animate-field-enter" style={{ animationDelay: '50ms' }}>
          <FormField label="Child Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Liam"
              className={INPUT_CLASS}
              autoFocus
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '100ms' }}>
          <FormField label="Birthday">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '150ms' }}>
          <FormField label="Strictness">
            <div className="flex gap-2">
              {(['recommended', 'strict', 'relaxed'] as Strictness[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setStrictness(level)}
                  className={`
                    flex-1 h-9 rounded-lg text-[11px] font-medium transition-all duration-200 ease-out
                    ${strictness === level
                      ? 'bg-teal-400/20 text-teal-300 ring-1 ring-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                      : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60 active:scale-[0.97]'
                    }
                  `}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      {formError && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
          <span className="text-[11px] text-red-400">{formError}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3 animate-field-enter" style={{ animationDelay: '200ms' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`
            flex-1 h-9 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5
            ${isValid && !isSubmitting
              ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] hover:shadow-[0_4px_16px_rgba(45,212,191,0.35)] active:scale-[0.98]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Adding...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
              Add Child
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 h-9 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChildCard
// ---------------------------------------------------------------------------

function ChildCard({ child, onEdit }: { child: { id: string; name: string; birth_date: string }; onEdit?: () => void }) {
  const age = calculateAge(child.birth_date);
  const initial = child.name.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:bg-white/[0.03] group"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-400/20 transition-colors duration-200">
        <span className="text-[14px] font-semibold text-teal-300">{initial}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-white">
          {child.name}
          <span className="text-white/40 font-normal ml-1.5">(age {age})</span>
        </div>
        <div className="text-[11px] text-white/40">
          {getAgeGroup(age)}
        </div>
      </div>

      {/* Edit button */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-1 rounded-md hover:bg-teal-500/10 text-white/25 hover:text-teal-400 transition-all duration-150"
          title="Edit child"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditMemberForm — inline form to edit a member's display name and role
// ---------------------------------------------------------------------------

function EditMemberForm({
  member,
  familyId,
  onSave,
  onCancel,
}: {
  member: FamilyMember;
  familyId: string;
  onSave: (displayName: string, role: FamilyRole) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState(member.display_name || '');
  const [role, setRole] = useState<FamilyRole>(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isOwner = member.role === 'owner';

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const ok = await onSave(displayName.trim(), isOwner ? member.role : role);
      if (!ok) {
        setFormError('Failed to update member');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [displayName, role, isOwner, member.role, onSave]);

  return (
    <div className="p-3 rounded-xl border border-dashed border-blue-400/20 bg-blue-400/[0.03] animate-field-enter">
      <div className="space-y-2.5">
        <div className="animate-field-enter" style={{ animationDelay: '50ms' }}>
          <FormField label="Display Name" optional>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={member.name || member.email || 'e.g. Mom'}
              className={INPUT_CLASS_BLUE}
              autoFocus
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '100ms' }}>
          <FormField label="Role">
            <div className="flex gap-2">
              {(['parent', 'guardian'] as FamilyRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => !isOwner && setRole(r)}
                  disabled={isOwner}
                  className={`
                    flex-1 h-9 rounded-lg text-[11px] font-medium transition-all duration-200 ease-out
                    ${isOwner
                      ? 'bg-white/[0.03] text-white/20 cursor-not-allowed'
                      : role === r
                        ? 'bg-blue-400/20 text-blue-300 ring-1 ring-blue-400/40 shadow-[0_0_12px_rgba(96,165,250,0.15)]'
                        : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60 active:scale-[0.97]'
                    }
                  `}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            {isOwner && (
              <p className="text-[10px] text-white/25 mt-1">Owner role cannot be changed</p>
            )}
          </FormField>
        </div>
      </div>

      {formError && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
          <span className="text-[11px] text-red-400">{formError}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3 animate-field-enter" style={{ animationDelay: '150ms' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            flex-1 h-9 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5
            ${!isSubmitting
              ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white shadow-[0_2px_8px_rgba(96,165,250,0.25)] hover:shadow-[0_4px_16px_rgba(96,165,250,0.35)] active:scale-[0.98]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            'Save'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 h-9 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditChildForm — inline form to edit a child's name and birth date
// ---------------------------------------------------------------------------

function EditChildForm({
  child,
  onSave,
  onCancel,
}: {
  child: { id: string; name: string; birth_date: string };
  onSave: (name: string, birthDate: string) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birth_date.split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && birthDate.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const ok = await onSave(name.trim(), birthDate);
      if (!ok) {
        setFormError('Failed to update child');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [name, birthDate, isValid, onSave]);

  return (
    <div className="p-3 rounded-xl border border-dashed border-teal-400/20 bg-teal-400/[0.03] animate-field-enter">
      <div className="space-y-2.5">
        <div className="animate-field-enter" style={{ animationDelay: '50ms' }}>
          <FormField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emma"
              className={INPUT_CLASS}
              autoFocus
            />
          </FormField>
        </div>

        <div className="animate-field-enter" style={{ animationDelay: '100ms' }}>
          <FormField label="Birthday">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </div>

      {formError && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
          <span className="text-[11px] text-red-400">{formError}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3 animate-field-enter" style={{ animationDelay: '150ms' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className={`
            flex-1 h-9 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5
            ${isValid && !isSubmitting
              ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] hover:shadow-[0_4px_16px_rgba(45,212,191,0.35)] active:scale-[0.98]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            'Save'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 h-9 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormField helper
// ---------------------------------------------------------------------------

function FormField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-white/50 mb-1.5">
        {label}
        {optional && <span className="text-white/25 ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

function getAgeGroup(age: number): string {
  if (age < 5) return 'Toddler';
  if (age < 9) return 'Young child';
  if (age < 13) return 'Pre-teen';
  if (age < 18) return 'Teen';
  return 'Adult';
}
