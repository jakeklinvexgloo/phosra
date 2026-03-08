import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Shield, Monitor, Sun, Moon } from 'lucide-react';
import { requestChromeExpansion, releaseChromeExpansion } from '../lib/ipc';

interface SettingsPanelProps {
  profileName?: string;
}

function SettingsDropdown({
  profileName,
  onClose,
}: {
  profileName: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist preference
    try {
      localStorage.setItem('phosra-theme', next ? 'dark' : 'light');
    } catch {
      // storage unavailable — ignore
    }
  }, [isDark]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="
        absolute top-full right-0 mt-1.5
        bg-chrome-surface/95 glass border border-chrome-border-subtle
        rounded-xl shadow-glass-lg
        py-2 z-50 animate-scale-in
      "
      style={{ minWidth: '15rem' }}
    >
      <div className="h-[2px] bg-gradient-to-r from-transparent via-chrome-accent/30 to-transparent rounded-full mx-4 mb-1" />
      {/* Profile */}
      <div className="px-3.5 py-2 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-chrome-accent/30 to-purple-500/20 flex items-center justify-center">
          <span className="text-[12px] font-semibold text-chrome-accent">
            {profileName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="text-[12px] text-chrome-text font-medium">
            {profileName}
          </div>
          <div className="text-[10px] text-chrome-text-secondary">
            Active profile
          </div>
        </div>
      </div>

      <div className="h-px bg-chrome-border-subtle mx-2 my-1" />

      {/* Stealth mode */}
      <div className="px-3.5 py-2 flex items-center gap-2.5 rounded-lg mx-1.5">
        <Shield size={14} className="text-emerald-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-[12px] text-chrome-text">Stealth Mode</div>
        </div>
        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
          ON
        </span>
      </div>

      {/* DRM status */}
      <div className="px-3.5 py-2 flex items-center gap-2.5 rounded-lg mx-1.5">
        <Monitor size={14} className="text-chrome-text-secondary flex-shrink-0" />
        <div className="flex-1">
          <div className="text-[12px] text-chrome-text">DRM (Widevine)</div>
        </div>
        <span className="text-[10px] text-chrome-text-secondary bg-chrome-hover/50 px-2 py-0.5 rounded-md">
          Ready
        </span>
      </div>

      {/* Theme toggle */}
      <div className="px-3.5 py-2 flex items-center gap-2.5 rounded-lg mx-1.5">
        {isDark ? (
          <Moon size={14} className="text-chrome-accent flex-shrink-0" />
        ) : (
          <Sun size={14} className="text-chrome-accent flex-shrink-0" />
        )}
        <div className="flex-1">
          <div className="text-[12px] text-chrome-text">Theme</div>
        </div>
        <button
          onClick={toggleTheme}
          className="
            relative w-9 h-5 rounded-full transition-colors duration-200
            bg-chrome-hover border border-chrome-border-subtle
            focus:outline-none
          "
        >
          <span
            className={`
              absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 shadow-sm
              ${isDark ? 'left-[18px] bg-chrome-accent' : 'left-0.5 bg-chrome-text-secondary'}
            `}
          />
        </button>
      </div>

      <div className="h-px bg-chrome-border-subtle mx-2 my-1" />

      {/* CDP port */}
      <div className="px-3.5 py-2 flex items-center gap-2.5 rounded-lg mx-1.5">
        <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-mono text-chrome-text-secondary">
          {'{}'}
        </span>
        <div className="flex-1">
          <div className="text-[12px] text-chrome-text">CDP Port</div>
        </div>
        <span className="text-[10px] font-mono text-chrome-text-secondary">
          9222
        </span>
      </div>
    </div>
  );
}

export function SettingsButton({ profileName = 'default' }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestChromeExpansion();
      return () => releaseChromeExpansion();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          transition-all duration-150
          ${
            isOpen
              ? 'bg-chrome-hover text-chrome-text'
              : 'text-chrome-text-secondary hover:bg-chrome-hover/60 hover:text-chrome-text hover:ring-1 hover:ring-chrome-border-subtle'
          }
        `}
        title="Settings"
      >
        <Settings size={15} />
      </button>

      {isOpen && (
        <SettingsDropdown
          profileName={profileName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
