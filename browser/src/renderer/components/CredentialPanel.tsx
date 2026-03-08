/**
 * Settings sub-panel for managing streaming service credentials.
 *
 * Shows the 8 built-in services as quick-add options, plus any custom
 * providers the user has added, with an "Add Custom Provider" button.
 */

import React, { useState } from 'react';
import { KeyRound, Pencil, Trash2, ChevronLeft, AlertTriangle, Plus, Globe } from 'lucide-react';
import { useCredentials } from '../hooks/useCredentials';
import { CredentialForm, CustomCredentialForm } from './CredentialForm';
import type { CredentialInfo } from '../lib/ipc';

interface CredentialPanelProps {
  onBack: () => void;
}

export function CredentialPanel({ onBack }: CredentialPanelProps) {
  const { credentials, isAvailable, isLoading, saveCredential, saveCustomCredential, deleteCredential } = useCredentials();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);

  const builtIn = credentials.filter((c) => !c.isCustom);
  const custom = credentials.filter((c) => c.isCustom);

  const handleSaveBuiltIn = async (serviceId: string, username: string, password: string) => {
    await saveCredential(serviceId, username, password);
    setEditingId(null);
  };

  const handleSaveCustom = async (
    name: string,
    loginUrl: string,
    username: string,
    password: string,
    existingServiceId?: string,
  ) => {
    await saveCustomCredential(name, loginUrl, username, password, existingServiceId);
    setEditingId(null);
    setAddingCustom(false);
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4 text-center text-[12px] text-chrome-text-secondary">
        Loading…
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="px-3 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-chrome-text-secondary hover:text-chrome-text mb-2"
        >
          <ChevronLeft size={12} /> Back
        </button>
        <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
          <span className="text-[11px] text-yellow-300">
            OS keychain encryption is not available. Cannot store credentials securely.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72">
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-chrome-hover"
        >
          <ChevronLeft size={14} className="text-chrome-text-secondary" />
        </button>
        <KeyRound size={14} className="text-chrome-accent" />
        <span className="text-[12px] font-medium text-chrome-text">Streaming Logins</span>
      </div>

      <div className="h-px bg-chrome-border/50" />

      {/* Service list */}
      <div className="max-h-80 overflow-y-auto py-1">
        {/* Built-in services */}
        {builtIn.map((cred) => (
          <ServiceRow
            key={cred.serviceId}
            credential={cred}
            isEditing={editingId === cred.serviceId}
            onEdit={() => { setEditingId(cred.serviceId); setAddingCustom(false); }}
            onSave={handleSaveBuiltIn}
            onDelete={deleteCredential}
            onCancel={() => setEditingId(null)}
          />
        ))}

        {/* Custom providers section */}
        {custom.length > 0 && (
          <>
            <div className="h-px bg-chrome-border/50 my-1" />
            <div className="px-3 py-1">
              <span className="text-[10px] font-medium text-chrome-text-secondary uppercase tracking-wide">
                Custom
              </span>
            </div>
            {custom.map((cred) => (
              <CustomServiceRow
                key={cred.serviceId}
                credential={cred}
                isEditing={editingId === cred.serviceId}
                onEdit={() => { setEditingId(cred.serviceId); setAddingCustom(false); }}
                onSave={handleSaveCustom}
                onDelete={deleteCredential}
                onCancel={() => setEditingId(null)}
              />
            ))}
          </>
        )}

        {/* Add Custom Provider */}
        <div className="h-px bg-chrome-border/50 my-1" />
        {addingCustom ? (
          <div className="px-3 py-1.5">
            <CustomCredentialForm
              onSave={handleSaveCustom}
              onCancel={() => setAddingCustom(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => { setAddingCustom(true); setEditingId(null); }}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-chrome-hover transition-colors"
          >
            <Plus size={14} className="text-chrome-accent" />
            <span className="text-[12px] text-chrome-text">Add Custom Provider</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Built-in service row
// ---------------------------------------------------------------------------

function ServiceRow({
  credential,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  credential: CredentialInfo;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (serviceId: string, username: string, password: string) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="px-3 py-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-chrome-text font-medium">
            {credential.displayName}
          </div>
          {credential.username && !isEditing && (
            <div className="text-[10px] text-chrome-text-secondary truncate">
              {credential.username}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-chrome-hover"
              title={credential.hasPassword ? 'Edit' : 'Add credentials'}
            >
              <Pencil size={12} className="text-chrome-text-secondary" />
            </button>
            {credential.hasPassword && (
              <button
                onClick={() => onDelete(credential.serviceId)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-chrome-hover"
                title="Delete"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <CredentialForm
          credential={credential}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom provider row
// ---------------------------------------------------------------------------

function CustomServiceRow({
  credential,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  credential: CredentialInfo;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (name: string, loginUrl: string, username: string, password: string, existingServiceId?: string) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="px-3 py-1.5">
      <div className="flex items-center gap-2">
        <Globe size={12} className="text-chrome-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-chrome-text font-medium">
            {credential.displayName}
          </div>
          {!isEditing && (
            <div className="text-[10px] text-chrome-text-secondary truncate">
              {credential.username}
              {credential.loginUrl && (
                <span className="ml-1 opacity-60">· {credential.loginUrl}</span>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-chrome-hover"
              title="Edit"
            >
              <Pencil size={12} className="text-chrome-text-secondary" />
            </button>
            <button
              onClick={() => onDelete(credential.serviceId)}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-chrome-hover"
              title="Delete"
            >
              <Trash2 size={12} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <CustomCredentialForm
          credential={credential}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
