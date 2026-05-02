import React from 'react';

// Simple SVG icons used in row action buttons

export function IconEdit({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8 8a2 2 0 01-.707.464l-3 1a1 1 0 01-1.265-1.265l1-3a2 2 0 01.464-.707l8-8z" />
    </svg>
  );
}

export function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}

export function IconUnlock({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a5 5 0 00-5 5v2H4a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm3 7H7V7a3 3 0 016 0v2z" />
    </svg>
  );
}

export function IconHistory({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

export function IconView({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );
}

export function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  );
}

export function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-5 w-5'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

export function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-5 w-5'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
    </svg>
  );
}

export function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

export function IconList({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 5a1 1 0 000 2h14a1 1 0 100-2H3zm0 5a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
    </svg>
  );
}

export function IconTree({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v2H3a1 1 0 100 2h2a1 1 0 001-1v-2h3v1a1 1 0 001 1h4a1 1 0 001-1v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v-1H7V9h3a1 1 0 000-2H7V5h3a1 1 0 000-2H4a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

/** Document with text lines — used for "View granted license". */
export function IconDocumentText({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

/** Triosoft purple logo mark — graphical element without text. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-8 w-8'} viewBox="0 0 63.14 63.14" xmlns="http://www.w3.org/2000/svg">
      <path d="m12.63,0h50.51c0,6.95-5.68,12.63-12.63,12.63H0C0,5.68,5.68,0,12.63,0" fill="#9977FF" fillRule="evenodd" />
      <path d="m12.63,25.26h12.63v12.63H0c0-6.95,5.68-12.63,12.63-12.63" fill="#9977FF" fillRule="evenodd" />
      <path d="m50.51,37.89h-12.63v-12.63h25.26c0,6.95-5.68,12.63-12.63,12.63" fill="#9977FF" fillRule="evenodd" />
      <path d="m12.63,50.51h12.63v12.63H0c0-6.95,5.68-12.63,12.63-12.63" fill="#9977FF" fillRule="evenodd" />
      <path d="m50.51,63.14h-12.63v-12.63h25.26c0,6.95-5.68,12.63-12.63,12.63" fill="#9977FF" fillRule="evenodd" />
    </svg>
  );
}

export function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}

export function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}

export function IconTag({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

export function IconClipboard({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  );
}

export function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 10a1 1 0 000 2h14a1 1 0 100-2H3zM3 16a1 1 0 000 2h14a1 1 0 100-2H3z" />
    </svg>
  );
}

export function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

export function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
