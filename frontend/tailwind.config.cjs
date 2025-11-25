/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Base neutrals - adapted for professional, medical look
                'bg-dark': '#0F172A',     // Slate-900, deep professional background
                'bg-light': '#F8FAFC',    // Slate-50, clean light surface
                'bg-card': 'rgba(30, 41, 59, 0.6)', // Glassmorphic card background (more transparent)
                'bg-card-hover': 'rgba(30, 41, 59, 0.75)', // Slightly more opaque on hover
                'bg-glass': 'rgba(15, 23, 42, 0.6)', // Darker glass for deep depth

                'text-default': '#F1F5F9', // Slate-100, high readability on dark
                'text-muted': '#94A3B8',   // Slate-400, for labels/descriptions
                'text-white': '#FFFFFF',   // Pure white for headings/important text

                // Primary brand color - Cool blues/teals for medical theme
                'primary-main': '#0D9488', // Teal-600, professional medical teal
                'primary-light': '#2DD4BF',// Teal-400, brighter accent
                'primary-dark': '#0F766E', // Teal-700, deep interaction state

                // Secondary - Soft Cyan
                'secondary-main': '#06B6D4', // Cyan-500
                'secondary-light': '#67E8F9', // Cyan-300

                // Accent colors - Subtle and cool
                'accent-cyan': '#06B6D4',  // Cyan-600, for highlights
                'accent-teal': '#14B8A6',  // Teal-500, for secondary accents
                'accent-info': '#3B82F6',  // Blue-500, general info

                // Medical Background Gradient Colors
                'bg-medical-dark': '#022C22',  // Deep Teal/Slate mix
                'bg-medical-mid': '#115E59',   // Mid Teal
                'bg-medical-light': '#134E4A', // Darker Teal for depth
                'bg-medical-accent': '#2DD4BF', // Bright Teal pop

                // Status colors - Standard, slightly adjusted for consistency
                'status-success': '#10B981',// Emerald-500
                'status-warning': '#F59E0B',// Amber-500
                'status-error': '#EF4444',  // Red-500
                'status-info': '#3B82F6',   // Blue-500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.2)',
                'glow': '0 0 15px rgba(13, 148, 136, 0.3)', // Subtle teal glow
            },
            backdropBlur: {
                'xs': '2px',
                'sm': '4px',
                'md': '12px', // Increased for better glass effect
            }
        },
    },
    plugins: [],
}
