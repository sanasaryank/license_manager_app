import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={clsx(
              'h-4 w-4 rounded border-gray-300 text-primary-600',
              'focus:ring-primary-500 focus:ring-offset-0',
              'disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />
          {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
