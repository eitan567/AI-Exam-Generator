
import React from 'react';

// This icon is now ClipboardDocCheckIcon
const ClipboardDocCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25 1.125-2.25 2.25v15c0 1.125 1.125 2.25 2.25 2.25h11.25c1.125 0 2.25-1.125 2.25-2.25v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
  </svg>
);

export default ClipboardDocCheckIcon;
