import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { Lock, Info, Search, Star, KeyRound } from 'lucide-react';
import { AutocompleteDropdown } from './AutocompleteDropdown';
import { requestChromeExpansion, releaseChromeExpansion } from '../lib/ipc';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  isEditing: boolean;
  isBookmarked: boolean;
  autoFillService?: string | null;
  onUrlChange: (url: string) => void;
  onNavigate: (url: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onToggleBookmark: () => void;
}

function SecurityIcon({ url }: { url: string }) {
  if (url.startsWith('https://')) {
    return <Lock size={13} className="text-emerald-400/70 flex-shrink-0" />;
  }
  if (url.startsWith('http://')) {
    return <Info size={13} className="text-amber-400/70 flex-shrink-0" />;
  }
  return <Search size={13} className="text-chrome-text-secondary/70 flex-shrink-0" />;
}

/** Strip protocol and www, show clean URL when not editing */
function cleanDisplayUrl(url: string): string {
  try {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function AddressBar({
  url,
  isLoading,
  isEditing,
  isBookmarked,
  autoFillService,
  onUrlChange,
  onNavigate,
  onFocus,
  onBlur,
  onToggleBookmark,
}: AddressBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteKeyHandler = useRef<((e: React.KeyboardEvent) => boolean) | null>(null);

  // Expand/collapse chrome when autocomplete shows/hides
  useEffect(() => {
    if (showAutocomplete) {
      requestChromeExpansion();
      return () => releaseChromeExpansion();
    }
  }, [showAutocomplete]);

  const handleFocus = useCallback(() => {
    onFocus();
    setShowAutocomplete(true);
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowAutocomplete(false);
      onBlur();
    }, 150);
  }, [onBlur]);

  const handleAutocompleteSelect = useCallback(
    (selectedUrl: string) => {
      onNavigate(selectedUrl);
      setShowAutocomplete(false);
      inputRef.current?.blur();
    },
    [onNavigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (autocompleteKeyHandler.current?.(e)) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        onNavigate(url);
        setShowAutocomplete(false);
        inputRef.current?.blur();
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        inputRef.current?.blur();
      }
    },
    [url, onNavigate]
  );

  const displayUrl = useMemo(() => (isEditing ? url : cleanDisplayUrl(url)), [isEditing, url]);

  return (
    <div className="relative flex-1">
      {/* Address bar pill */}
      <div
        className={`
          flex items-center gap-2 h-[38px]
          rounded-xl px-3.5
          transition-all duration-200
          ${
            isEditing
              ? 'bg-chrome-bg ring-1 ring-chrome-accent/60 shadow-glow'
              : 'bg-chrome-surface-2/80 hover:bg-chrome-hover/50 border border-chrome-border/60'
          }
        `}
      >
        <SecurityIcon url={url} />

        <input
          ref={inputRef}
          type="text"
          value={displayUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="
            flex-1 bg-transparent border-none outline-none
            text-[13px] text-chrome-text
            placeholder:text-chrome-text-secondary/60
            caret-chrome-accent
            min-w-0
          "
          placeholder="Search or enter URL"
        />

        {/* Loading progress bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-3 right-3 h-[2px] overflow-hidden rounded-full">
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-chrome-accent to-transparent animate-loading-bar" />
          </div>
        )}

        {/* Auto-fill indicator */}
        {autoFillService && (
          <div
            className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-chrome-accent/10"
            title={`Auto-fill available for ${autoFillService}`}
          >
            <KeyRound size={12} className="text-chrome-accent" />
          </div>
        )}

        {/* Bookmark star */}
        <button
          onClick={onToggleBookmark}
          className="
            flex-shrink-0 w-6 h-6 rounded-lg
            flex items-center justify-center
            hover:bg-chrome-text/5
            transition-all duration-150
          "
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        >
          {isBookmarked ? (
            <Star size={14} className="text-chrome-accent fill-chrome-accent" />
          ) : (
            <Star size={14} className="text-chrome-text-secondary/50" />
          )}
        </button>
      </div>

      {/* Autocomplete dropdown */}
      <AutocompleteDropdown
        query={url}
        visible={showAutocomplete}
        onSelect={handleAutocompleteSelect}
        onKeyCapture={(handler) => {
          autocompleteKeyHandler.current = handler;
        }}
      />
    </div>
  );
}
