import React, { useState, useCallback, useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { NavigationButtons } from './components/NavigationButtons';
import { AddressBar } from './components/AddressBar';
import { BookmarksBar } from './components/BookmarksBar';
import { SettingsButton } from './components/SettingsPanel';
import { StreamingServicesBar } from './components/StreamingServicesBar';
import { useTabs } from './hooks/useTabs';
import { useNavigation } from './hooks/useNavigation';
import { useBookmarks } from './hooks/useBookmarks';
import { ipc } from './lib/ipc';
import type { AutoFillNotification, MfaChallengeNotification } from './lib/ipc';

/** Phosra burst mark for the chrome bar — brand green, compact. */
function PhosraMark() {
  return (
    <svg
      width="22"
      height="24"
      viewBox="0 0 66 73"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60 hover:opacity-100 transition-opacity duration-200"
    >
      <path d="M32.5152 53.8069C29.9079 59.9238 29.9079 66.0408 32.5152 72.1577C35.1225 66.0408 35.1225 59.9238 32.5152 53.8069Z" fill="#00D47E" />
      <path d="M32.5152 0C29.9079 6.11695 29.9079 12.2339 32.5152 18.3508C35.1225 12.2339 35.1225 6.11695 32.5152 0Z" fill="#00D47E" />
      <path d="M40.5035 51.4317C41.0019 58.1757 43.7583 63.4731 48.7727 67.324C48.2743 60.5801 45.5179 55.2826 40.5035 51.4317Z" fill="#00D47E" />
      <path d="M16.2576 4.8338C16.756 11.5778 19.5124 16.8752 24.5268 20.7261C24.0284 13.9822 21.272 8.68471 16.2576 4.8338Z" fill="#00D47E" />
      <path d="M46.3512 44.9432C49.8218 50.5071 54.596 53.5656 60.6739 54.1187C57.2033 48.5547 52.4291 45.4962 46.3512 44.9432Z" fill="#00D47E" />
      <path d="M4.35619 18.0396C7.82677 23.6036 12.601 26.6621 18.6789 27.2151C15.2083 21.6511 10.4341 18.5926 4.35619 18.0396Z" fill="#00D47E" />
      <path d="M48.4919 36.0795C54.0047 38.9725 59.5175 38.9725 65.0303 36.0795C59.5175 33.1864 54.0047 33.1864 48.4919 36.0795Z" fill="#00D47E" />
      <path d="M0 36.0792C5.51282 38.9723 11.0256 38.9723 16.5385 36.0792C11.0256 33.1862 5.51282 33.1862 0 36.0792Z" fill="#00D47E" />
      <path d="M46.3514 27.2154C52.4293 26.6624 57.2035 23.6039 60.6741 18.0399C54.5962 18.5929 49.822 21.6514 46.3514 27.2154Z" fill="#00D47E" />
      <path d="M4.35626 54.1187C10.4341 53.5657 15.2084 50.5072 18.679 44.9432C12.6011 45.4963 7.82684 48.5548 4.35626 54.1187Z" fill="#00D47E" />
      <path d="M40.5037 20.7286C45.5181 16.8777 48.2745 11.5802 48.7729 4.83625C43.7585 8.68715 41.0021 13.9846 40.5037 20.7286Z" fill="#00D47E" />
      <path d="M16.2579 67.3262C21.2722 63.4753 24.0286 58.1779 24.527 51.4339C19.5126 55.2848 16.7562 60.5822 16.2579 67.3262Z" fill="#00D47E" />
    </svg>
  );
}

export default function App() {
  const { tabs, activeTab, activeTabId, createTab, closeTab, switchTab } = useTabs();
  const {
    url,
    setUrl,
    isLoading,
    isEditing,
    setIsEditing,
    navigate,
    goBack,
    goForward,
    reload,
  } = useNavigation(activeTab);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } =
    useBookmarks();

  const [showBookmarks, setShowBookmarks] = useState(true);
  const [autoFillService, setAutoFillService] = useState<string | null>(null);
  const [mfaToast, setMfaToast] = useState<{ tabId: number; serviceName: string } | null>(null);

  // Restore persisted theme preference (default: dark)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('phosra-theme');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // storage unavailable — keep default (dark via HTML class)
    }
  }, []);

  // Listen for auto-fill availability notifications from main process
  useEffect(() => {
    if (!ipc) return;
    const unsub = ipc.onAutoFillAvailable((data: AutoFillNotification) => {
      if (data.tabId === activeTabId && data.service) {
        setAutoFillService(data.service.displayName);
      } else if (data.tabId === activeTabId) {
        setAutoFillService(null);
      }
    });
    return unsub;
  }, [activeTabId]);

  // Listen for MFA challenge notifications from main process
  useEffect(() => {
    if (!ipc) return;
    const unsub = ipc.onMfaChallenge((data: MfaChallengeNotification) => {
      setMfaToast({ tabId: data.tabId, serviceName: data.serviceName });
    });
    return unsub;
  }, []);

  // Auto-dismiss MFA toast after 15 seconds
  useEffect(() => {
    if (!mfaToast) return;
    const timer = setTimeout(() => setMfaToast(null), 15000);
    return () => clearTimeout(timer);
  }, [mfaToast]);

  // Dismiss MFA toast when the tab navigates away from login
  useEffect(() => {
    if (mfaToast && activeTabId === mfaToast.tabId && activeTab?.url) {
      const url = activeTab.url.toLowerCase();
      const loginIndicators = ['login', 'signin', 'sign-in', 'auth', 'verify', 'two-factor', '2fa', 'mfa', 'otp', 'challenge'];
      const stillOnLogin = loginIndicators.some((kw) => url.includes(kw));
      if (!stillOnLogin) {
        setMfaToast(null);
      }
    }
  }, [activeTab?.url, mfaToast, activeTabId]);

  const currentUrl = activeTab?.url ?? '';
  const currentTitle = activeTab?.title ?? '';
  const bookmarked = isBookmarked(currentUrl);

  const handleToggleBookmark = useCallback(() => {
    if (!currentUrl) return;
    if (bookmarked) {
      removeBookmark(currentUrl);
    } else {
      addBookmark({ url: currentUrl, title: currentTitle });
    }
  }, [currentUrl, currentTitle, bookmarked, addBookmark, removeBookmark]);

  const handleBookmarkNavigate = useCallback(
    (bookmarkUrl: string) => {
      navigate(bookmarkUrl);
    },
    [navigate]
  );

  return (
    <div className="h-screen flex flex-col bg-chrome-bg">
      {/* Tab bar row */}
      <div className="flex items-center gap-1 px-2 pt-1.5">
        {/* macOS traffic light spacer */}
        <div className="w-[70px] flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={switchTab}
          onCloseTab={closeTab}
          onCreateTab={createTab}
        />
        {/* Phosra burst mark */}
        <div className="flex-shrink-0 pl-1 pr-1" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <PhosraMark />
        </div>
      </div>

      {/* Navigation + Address bar row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-chrome-surface/40">
        <NavigationButtons
          isLoading={isLoading}
          canGoBack={activeTab?.canGoBack ?? false}
          canGoForward={activeTab?.canGoForward ?? false}
          onGoBack={goBack}
          onGoForward={goForward}
          onReload={reload}
        />
        <AddressBar
          url={url}
          isLoading={isLoading}
          isEditing={isEditing}
          isBookmarked={bookmarked}
          autoFillService={autoFillService}
          onUrlChange={setUrl}
          onNavigate={navigate}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onToggleBookmark={handleToggleBookmark}
        />
        <SettingsButton />
      </div>

      {/* Streaming services bar */}
      <StreamingServicesBar onNavigate={navigate} />

      {/* MFA challenge toast */}
      {mfaToast && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[12px] border-b animate-slide-down cursor-pointer"
          style={{
            backgroundColor: 'rgba(245,158,11,0.1)',
            borderColor: 'rgba(245,158,11,0.2)',
          }}
          onClick={() => {
            if (mfaToast.tabId !== activeTabId) {
              switchTab(mfaToast.tabId);
            }
            setMfaToast(null);
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-amber-300/90 flex-1">
            <strong>{mfaToast.serviceName}</strong> needs verification. Check the tab to complete sign-in.
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMfaToast(null);
            }}
            className="text-[11px] text-chrome-text-secondary hover:text-chrome-text px-2 py-0.5 rounded hover:bg-chrome-hover/50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bookmarks bar (optional, collapsible) */}
      <BookmarksBar
        bookmarks={bookmarks}
        visible={showBookmarks}
        onNavigate={handleBookmarkNavigate}
      />
    </div>
  );
}
