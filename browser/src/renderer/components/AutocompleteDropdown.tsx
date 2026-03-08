import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { filterSuggestions, type SuggestedSite } from '../lib/suggested-sites';

interface AutocompleteDropdownProps {
  query: string;
  visible: boolean;
  onSelect: (url: string) => void;
  onKeyCapture: (handler: (e: React.KeyboardEvent) => boolean) => void;
}

const categoryColors: Record<string, string> = {
  Streaming: 'text-purple-400',
  AI: 'text-blue-400',
  Social: 'text-pink-400',
  'Kids & Education': 'text-emerald-400',
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function SiteFavicon({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(url);

  if (failed) {
    return <Globe size={13} className="text-chrome-text-secondary flex-shrink-0" />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={name}
      width={16}
      height={16}
      className="rounded-sm flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export function AutocompleteDropdown({
  query,
  visible,
  onSelect,
  onKeyCapture,
}: AutocompleteDropdownProps) {
  const [highlighted, setHighlighted] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const results = filterSuggestions(query);

  useEffect(() => {
    setHighlighted(-1);
  }, [query, visible]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!visible || results.length === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        return true;
      }
      if (e.key === 'Enter' && highlighted >= 0) {
        e.preventDefault();
        onSelect(results[highlighted].url);
        return true;
      }
      return false;
    },
    [visible, results, highlighted, onSelect]
  );

  useEffect(() => {
    onKeyCapture(handleKey);
  }, [handleKey, onKeyCapture]);

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlighted]) {
        (items[highlighted] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlighted]);

  if (!visible || results.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="
        absolute top-full left-0 right-0 mt-1.5
        bg-chrome-surface/95 glass border border-chrome-border-subtle
        rounded-xl shadow-glass-lg
        py-1.5 z-50 max-h-[320px] overflow-y-auto
        animate-scale-in
      "
    >
      {results.map((site, i) => (
        <button
          key={site.url}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(site.url);
          }}
          onMouseEnter={() => setHighlighted(i)}
          className={`
            w-full px-3 py-2 flex items-center gap-2.5 text-left
            transition-colors duration-100 rounded-lg mx-0
            ${i === highlighted ? 'bg-chrome-hover/70' : ''}
          `}
        >
          <SiteFavicon url={site.url} name={site.name} />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-chrome-text truncate">{site.name}</div>
            <div className="text-[10px] text-chrome-text-secondary/60 truncate">{getDomain(site.url)}</div>
          </div>
          <span
            className={`text-[10px] font-medium flex-shrink-0 ${categoryColors[site.category] ?? 'text-chrome-text-secondary'}`}
          >
            {site.category}
          </span>
        </button>
      ))}
    </div>
  );
}
