import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Bookmark } from '../hooks/useBookmarks';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  visible: boolean;
  onNavigate: (url: string) => void;
}

function BookmarkFavicon({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const domain = getDomainFromUrl(url);

  if (failed) {
    return <Globe size={11} className="text-chrome-text-secondary/50 flex-shrink-0" />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
      alt={title}
      width={12}
      height={12}
      className="rounded-sm flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export function BookmarksBar({
  bookmarks,
  visible,
  onNavigate,
}: BookmarksBarProps) {
  if (!visible || bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-0.5 h-[28px] border-t border-chrome-border-subtle overflow-x-auto">
      {bookmarks.map((bookmark) => (
        <button
          key={bookmark.url}
          onClick={() => onNavigate(bookmark.url)}
          className="
            flex items-center gap-1.5 px-2 py-1
            rounded-md text-[11px] text-chrome-text-secondary
            hover:bg-chrome-hover/50 hover:text-chrome-text
            transition-all duration-150
            flex-shrink-0 max-w-[180px]
          "
          title={bookmark.url}
        >
          <BookmarkFavicon url={bookmark.url} title={bookmark.title || ''} />
          <span className="truncate">
            {bookmark.title || getDomainFromUrl(bookmark.url)}
          </span>
        </button>
      ))}
    </div>
  );
}

function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
