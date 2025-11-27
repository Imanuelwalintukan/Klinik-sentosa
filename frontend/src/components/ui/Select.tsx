import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full relative">
                {label && (
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-base transition-all duration-200',
                        'focus:ring-2 focus:ring-primary-main focus:border-primary-light focus:ring-offset-2 focus:ring-offset-bg-dark', // Focus ring uses new theme colors
                        'disabled:bg-bg-dark/50 disabled:text-text-muted disabled:cursor-not-allowed', // Adjusted disabled styles
                        error && 'border-status-error focus:ring-status-error focus:border-status-error', // Error state styling
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option
                            key={String(option.value)}
                            value={option.value}
                            className="bg-gray-900 text-white"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-status-error absolute bottom-[-1.5rem]">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
