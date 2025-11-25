import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { AnimatePresence, motion } from 'framer-motion';
import { modalOverlay, modalContent } from '../../lib/motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={modalOverlay}
                        onClick={onClose}
                    />

                    <motion.div
                        className={`relative bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl shadow-black/25 ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col z-10`}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={modalContent}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/15">
                            <h2 className="text-xl font-semibold text-text-default">{title}</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-text-muted hover:text-text-default"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 text-text-default">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

