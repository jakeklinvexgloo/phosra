import React, { useCallback, useState } from 'react';
import { X, Plus, Loader2, Globe } from 'lucide-react';
import { TabInfo } from '../lib/ipc';

interface TabBarProps {
  tabs: TabInfo[];
  activeTabId: number | null;
  onSwitchTab: (id: number) => void;
  onCloseTab: (id: number) => void;
  onCreateTab: () => void;
}

function Favicon({ favicon, isLoading }: { favicon?: string; isLoading: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  const showImg = !isLoading && !!favicon && !imgFailed;
  const showGlobe = !isLoading && (!favicon || imgFailed);

  return (
    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
      {isLoading ? (
        <Loader2 size={12} className="animate-spin text-chrome-accent" />
      ) : showImg ? (
        <img
          src={favicon}
          alt=""
          width={14}
          height={14}
          className="rounded-sm transition-opacity duration-200"
          onError={() => setImgFailed(true)}
        />
      ) : showGlobe ? (
        <Globe size={12} className="text-chrome-text-secondary/80" />
      ) : null}
    </span>
  );
}

function Tab({
  tab,
  isActive,
  onSwitch,
  onClose,
  tabCount,
}: {
  tab: TabInfo;
  isActive: boolean;
  onSwitch: () => void;
  onClose: () => void;
  tabCount: number;
}) {
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose]
  );

  const maxWidth = Math.max(60, Math.min(240, Math.floor(800 / tabCount)));

  return (
    <button
      onClick={onSwitch}
      className={`
        group relative flex items-center gap-1.5 h-[34px] px-3
        rounded-lg text-[12px] leading-none
        transition-all duration-150 cursor-default
        ${
          isActive
            ? 'bg-chrome-surface text-chrome-text border-b-2 border-chrome-accent/40'
            : 'bg-transparent text-chrome-text-secondary hover:bg-chrome-hover/60 hover:text-chrome-text'
        }
      `}
      style={{ minWidth: 60, maxWidth, flex: '1 1 0' }}
      title={tab.title || tab.url}
    >
      <Favicon favicon={tab.favicon} isLoading={tab.isLoading} />

      <span className="flex-1 truncate text-left">
        {tab.title || 'New Tab'}
      </span>

      {/* Close button */}
      <span
        onClick={handleClose}
        className={`
          flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center
          transition-all duration-100
          opacity-0 group-hover:opacity-100
          ${isActive ? 'opacity-60 hover:opacity-100' : ''}
          hover:bg-chrome-text/10
        `}
        role="button"
        tabIndex={-1}
      >
        <X size={11} className="text-chrome-text-secondary" />
      </span>
    </button>
  );
}

export function TabBar({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateTab,
}: TabBarProps) {
  return (
    <div className="flex items-center gap-0.5 flex-1 min-w-0 h-[36px]">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          tabCount={tabs.length}
          onSwitch={() => onSwitchTab(tab.id)}
          onClose={() => onCloseTab(tab.id)}
        />
      ))}

      {/* New tab button */}
      <button
        onClick={onCreateTab}
        className="
          flex-shrink-0 w-7 h-7 rounded-lg
          flex items-center justify-center
          text-chrome-text/50
          hover:bg-chrome-accent/10 hover:text-chrome-accent
          transition-all duration-150
          ml-0.5
        "
        title="New tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
