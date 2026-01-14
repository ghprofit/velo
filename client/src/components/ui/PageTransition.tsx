'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: pageTransition.initial,
        animate: pageTransition.animate,
        exit: pageTransition.exit
      }}
      transition={pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
