import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
    isInteractive?: boolean;
}

const cardVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
    hover: {
        scale: 1.01,
        y: -4,
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        transition: {
            duration: 0.2,
            ease: "easeOut"
        },
    },
    tap: {
        scale: 0.98,
    },
};

export const Card: React.FC<CardProps> = ({ children, className, title, action, isInteractive = false }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            whileHover={isInteractive ? "hover" : ""}
            whileTap={isInteractive ? "tap" : ""}
            variants={(isInteractive ? cardVariants : fadeIn) as any}
            className={cn(
                'glass-panel rounded-2xl',
                isInteractive && 'cursor-pointer glass-panel-hover',
                className
            )}
        >
            {(title || action) && (
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                    {title && <h3 className="text-lg font-semibold text-text-white tracking-tight">{title}</h3>}
                    {action}
                </div>
            )}
            <div className="p-6">{children}</div>
        </motion.div>
    );
};
