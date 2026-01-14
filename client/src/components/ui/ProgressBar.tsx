'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { progressVariants, circularProgressVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

export type ProgressColor = 'indigo' | 'purple' | 'pink' | 'cyan' | 'green' | 'red' | 'yellow';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses: Record<ProgressColor, string> = {
  indigo: 'bg-indigo-600',
  purple: 'bg-purple-600',
  pink: 'bg-pink-600',
  cyan: 'bg-cyan-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600'
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

export function ProgressBar({
  value,
  max = 100,
  color = 'indigo',
  showLabel = false,
  size = 'md',
  className
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={percentage}
          className={cn('h-full rounded-full', colorClasses[color])}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
}

const circularColorClasses: Record<ProgressColor, string> = {
  indigo: 'stroke-indigo-600',
  purple: 'stroke-purple-600',
  pink: 'stroke-pink-600',
  cyan: 'stroke-cyan-600',
  green: 'stroke-green-600',
  red: 'stroke-red-600',
  yellow: 'stroke-yellow-600'
};

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'indigo',
  showLabel = true,
  className
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          variants={circularProgressVariants}
          initial="initial"
          animate="animate"
          custom={percentage}
          className={circularColorClasses[color]}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  color?: ProgressColor;
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  color = 'indigo',
  className
}: StepProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    isCompleted && `${colorClasses[color]} text-white`,
                    isCurrent && `${colorClasses[color]} text-white ring-4 ring-${color}-200`,
                    isPending && 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                {labels && labels[index] && (
                  <span
                    className={cn(
                      'text-xs font-medium text-center max-w-[80px]',
                      (isCompleted || isCurrent) ? 'text-gray-900' : 'text-gray-500'
                    )}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>
              {index < totalSteps - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn('h-full', colorClasses[color])}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  color?: ProgressColor;
  className?: string;
}

export function ProgressDots({
  currentStep,
  totalSteps,
  color = 'indigo',
  className
}: ProgressDotsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= currentStep;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              isCompleted ? colorClasses[color] : 'bg-gray-300',
              stepNumber === currentStep && 'w-6'
            )}
          />
        );
      })}
    </div>
  );
}

export interface LoadingBarProps {
  color?: ProgressColor;
  height?: number;
  className?: string;
}

export function LoadingBar({ color = 'indigo', height = 4, className }: LoadingBarProps) {
  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', className)} style={{ height }}>
      <motion.div
        className={cn('h-full rounded-full', colorClasses[color])}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ width: '50%' }}
      />
    </div>
  );
}
