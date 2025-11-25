export const pageTransition = {
  initial: { opacity: 0, x: -20 }, // Less pronounced slide
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }, // Less pronounced slide
  transition: { duration: 0.35, ease: [0.42, 0, 0.58, 1] }, // Smooth ease-in-out
};

export const fadeIn = {
  initial: { opacity: 0, y: 10 }, // Subtle slide up
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] }, // Smooth ease-in-out
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 15 }, // Subtle slide up for items
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 }, // Faster item fade in
};

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }, // Faster overlay transition
};

export const modalContent = {
  initial: { scale: 0.95, opacity: 0 }, // Subtler scale
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { type: 'spring', damping: 25, stiffness: 350 }, // Tuned spring for elegance
};

export const hoverTap = {
  hover: {
    scale: 1.02, // Very subtle hover expand
    transition: { duration: 0.2, ease: "easeOut" }, // Quick transition, ease-out
  },
  tap: { scale: 0.99 }, // Very subtle tap
};
