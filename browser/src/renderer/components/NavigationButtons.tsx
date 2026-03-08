import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';

interface NavigationButtonsProps {
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
}

function NavButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        transition-all duration-150
        ${
          disabled
            ? 'text-white/30 cursor-default'
            : 'text-white hover:bg-chrome-hover/60 active:scale-95'
        }
      `}
    >
      {children}
    </button>
  );
}

export function NavigationButtons({
  isLoading,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <NavButton onClick={onGoBack} disabled={!canGoBack} title="Go back">
        <ChevronLeft size={16} />
      </NavButton>

      <NavButton onClick={onGoForward} disabled={!canGoForward} title="Go forward">
        <ChevronRight size={16} />
      </NavButton>

      {isLoading ? (
        <NavButton onClick={onReload} title="Stop loading">
          <X size={16} />
        </NavButton>
      ) : (
        <NavButton onClick={onReload} title="Reload this page">
          <RotateCw size={14} />
        </NavButton>
      )}
    </div>
  );
}
