import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  url: string;
  title: string;
  favicon?: string;
}

const STORAGE_KEY = 'phosra-browser-bookmarks';

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveBookmarks(bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Ignore storage errors
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  // Persist to localStorage whenever bookmarks change
  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => {
      // Don't add duplicates
      if (prev.some((b) => b.url === bookmark.url)) {
        return prev;
      }
      return [...prev, bookmark];
    });
  }, []);

  const removeBookmark = useCallback((url: string) => {
    setBookmarks((prev) => prev.filter((b) => b.url !== url));
  }, []);

  const isBookmarked = useCallback(
    (url: string) => {
      return bookmarks.some((b) => b.url === url);
    },
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
