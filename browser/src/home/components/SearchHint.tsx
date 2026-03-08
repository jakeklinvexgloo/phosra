import React from 'react';

export function SearchHint() {
  return (
    <div className="mt-12 flex items-center gap-1.5">
      <span
        className="text-sm"
        style={{ color: 'rgba(125, 135, 153, 0.5)' }}
      >
        Press{' '}
        <kbd
          className="inline-block rounded px-1.5 py-0.5 text-xs font-mono"
          style={{
            background: 'rgba(26, 31, 46, 0.4)',
            border: '1px solid var(--chrome-border-subtle)',
            color: 'rgba(125, 135, 153, 0.7)',
          }}
        >
          /
        </kbd>{' '}
        to search or browse
      </span>
    </div>
  );
}
