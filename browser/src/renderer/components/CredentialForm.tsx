/**
 * Inline form for adding/editing credentials.
 *
 * For built-in services: shows email + password fields.
 * For custom providers: shows name + login URL + email + password fields.
 */

import React, { useState } from 'react';
import type { CredentialInfo } from '../lib/ipc';

// ---------------------------------------------------------------------------
// Built-in service form
// ---------------------------------------------------------------------------

interface BuiltInFormProps {
  credential: CredentialInfo;
  onSave: (serviceId: string, username: string, password: string) => Promise<void>;
  onCancel: () => void;
}

export function CredentialForm({ credential, onSave, onCancel }: BuiltInFormProps) {
  const [username, setUsername] = useState(credential.username);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setSaving(true);
    try {
      await onSave(credential.serviceId, username.trim(), password);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Email or username"
        autoFocus
        className={INPUT_CLASS}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={credential.hasPassword ? 'New password (leave blank to keep)' : 'Password'}
        className={INPUT_CLASS}
      />
      <FormButtons saving={saving} disabled={!username.trim() || !password.trim()} onCancel={onCancel} />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Custom provider form
// ---------------------------------------------------------------------------

interface CustomFormProps {
  credential?: CredentialInfo;
  onSave: (name: string, loginUrl: string, username: string, password: string, existingServiceId?: string) => Promise<void>;
  onCancel: () => void;
}

export function CustomCredentialForm({ credential, onSave, onCancel }: CustomFormProps) {
  const [name, setName] = useState(credential?.displayName ?? '');
  const [loginUrl, setLoginUrl] = useState(credential?.loginUrl ?? '');
  const [username, setUsername] = useState(credential?.username ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = name.trim() && loginUrl.trim() && username.trim() && password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    try {
      await onSave(name.trim(), loginUrl.trim(), username.trim(), password, credential?.serviceId);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Provider name (e.g. Crunchyroll)"
        autoFocus
        className={INPUT_CLASS}
      />
      <input
        type="text"
        value={loginUrl}
        onChange={(e) => setLoginUrl(e.target.value)}
        placeholder="Login URL (e.g. crunchyroll.com/login)"
        className={INPUT_CLASS}
      />
      <input
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Email or username"
        className={INPUT_CLASS}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={credential?.hasPassword ? 'New password' : 'Password'}
        className={INPUT_CLASS}
      />
      <FormButtons saving={saving} disabled={!isValid} onCancel={onCancel} />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const INPUT_CLASS = `
  h-8 px-3 rounded-lg text-[12px]
  bg-chrome-bg border border-chrome-border-subtle
  text-chrome-text placeholder:text-chrome-text-secondary/50
  outline-none focus:ring-1 focus:ring-chrome-accent/50 focus:border-chrome-accent/30
  transition-all duration-150
`;

function FormButtons({
  saving,
  disabled,
  onCancel,
}: {
  saving: boolean;
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 justify-end pt-0.5">
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 text-[11px] rounded-lg text-chrome-text-secondary hover:bg-chrome-hover/50 transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving || disabled}
        className="
          px-3 py-1.5 text-[11px] rounded-lg font-medium
          bg-chrome-accent text-chrome-bg
          hover:bg-chrome-accent-hover
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
