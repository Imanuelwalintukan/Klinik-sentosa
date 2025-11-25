import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full relative">
                {label && (
                    <label className="block text-sm font-medium text-text-muted mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg border border-white/10 bg-bg-card px-4 py-2.5 text-text-default text-base placeholder-text-muted/50 transition-all duration-200',
                        'focus:ring-2 focus:ring-primary-main focus:border-primary-main focus:ring-offset-2 focus:ring-offset-bg-dark focus:outline-none',
                        'hover:border-white/20 hover:bg-bg-card-hover',
                        'disabled:bg-bg-dark/50 disabled:text-text-muted disabled:cursor-not-allowed disabled:border-transparent',
                        error && 'border-status-error focus:ring-status-error focus:border-status-error',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-status-error font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
