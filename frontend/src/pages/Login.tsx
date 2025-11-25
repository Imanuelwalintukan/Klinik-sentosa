// Completed by Antigravity AI — Frontend Completion

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/motion';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-bg-dark text-text-white flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Liquid glass backdrop behind login card for subtle effect, allowing AnimatedBackground to show */}
            <div className="absolute inset-0 bg-transparent backdrop-blur-xl z-0"></div> 

            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="relative bg-white/15 rounded-2xl border border-white/15 shadow-2xl shadow-black/25 p-8 w-full max-w-md backdrop-filter backdrop-blur-xl z-10" // Glassmorphism card
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-main mb-2">Klinik Sentosa</h1>
                    <p className="text-text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="Enter your password"
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-white/15 rounded-md border border-white/15 text-text-muted">
                    <p className="text-sm font-semibold mb-2 text-primary-light">Demo Accounts:</p>
                    <div className="text-xs space-y-1">
                        <p>Admin: <span className="text-accent-cyan">admin@klinik.com</span> / <span className="text-primary-light">password123</span></p>
                        <p>Doctor: <span className="text-accent-cyan">strange@klinik.com</span> / <span className="text-primary-light">password123</span></p>
                        <p>Pharmacist: <span className="text-accent-cyan">pharmacist@klinik.com</span> / <span className="text-primary-light">password123</span></p>
                        <p>Staff: <span className="text-accent-cyan">alice@klinik.com</span> / <span className="text-primary-light">password123</span></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
