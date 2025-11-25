import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full relative">
                {label && (
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg border border-white/15 bg-white/15 px-3 py-2 text-text-default text-base placeholder-text-muted transition-all duration-200',
                        'focus:ring-2 focus:ring-primary-main focus:border-primary-light focus:ring-offset-2 focus:ring-offset-bg-dark', // Focus ring uses new theme colors
                        'disabled:bg-bg-dark/50 disabled:text-text-muted disabled:cursor-not-allowed', // Adjusted disabled styles
                        error && 'border-status-error focus:ring-status-error focus:border-status-error', // Error state styling
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-status-error absolute bottom-[-1.5rem]">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
