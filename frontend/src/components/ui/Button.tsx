import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { hoverTap } from '../../lib/motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Combine custom props with Framer Motion's button props
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "style"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}) => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative';

    const variantStyles = {
        primary: 'bg-primary-main text-white shadow-lg shadow-primary-main/20 hover:bg-primary-dark hover:shadow-primary-main/30 focus-visible:ring-primary-main',
        secondary: 'bg-secondary-main text-white shadow-lg shadow-secondary-main/20 hover:bg-secondary-light hover:shadow-secondary-main/30 focus-visible:ring-secondary-main',
        danger: 'bg-status-error text-white shadow-lg shadow-status-error/20 hover:bg-red-600 hover:shadow-status-error/30 focus-visible:ring-status-error',
        outline: 'border border-primary-main text-primary-main hover:bg-primary-main/10 focus-visible:ring-primary-main',
        ghost: 'text-text-default hover:bg-white/10 hover:text-white focus-visible:ring-primary-main',
        success: 'bg-status-success text-white shadow-lg shadow-status-success/20 hover:bg-emerald-600 hover:shadow-status-success/30 focus-visible:ring-status-success',
        warning: 'bg-status-warning text-white shadow-lg shadow-status-warning/20 hover:bg-amber-600 hover:shadow-status-warning/30 focus-visible:ring-status-warning',
    };

    const sizeStyles = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <motion.button
            whileHover="hover"
            whileTap="tap"
            variants={hoverTap as any}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
