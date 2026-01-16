'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { skeletonPulse } from '@/lib/animations';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className
}: SkeletonProps) {
  const baseClasses = 'bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <motion.div
      variants={skeletonPulse}
      animate="animate"
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

export function TextSkeleton({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-6 space-y-4', className)}>
      <Skeleton variant="rectangular" height="200px" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton variant="circular" width="32px" height="32px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({
  columns = 4,
  className
}: {
  columns?: number;
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-4 py-4', className)}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === 0 ? '20%' : '15%'}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({
  size = '40px',
  className
}: {
  size?: string;
  className?: string
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function ButtonSkeleton({
  width = '120px',
  className
}: {
  width?: string;
  className?: string
}) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height="40px"
      className={className}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="300px" height="32px" />
        <Skeleton variant="text" width="200px" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height="36px" />
            <Skeleton variant="text" width="50%" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <Skeleton variant="text" width="200px" className="mb-4" />
        <Skeleton variant="rectangular" height="300px" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <Skeleton variant="text" width="200px" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRowSkeleton key={index} columns={5} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border overflow-hidden', className)}>
      <Skeleton variant="rectangular" height="200px" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" width="30%" />
          <ButtonSkeleton width="80px" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 bg-white rounded-lg border', className)}>
      <AvatarSkeleton size="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
      <ButtonSkeleton width="100px" />
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="120px" height="16px" />
          <Skeleton variant="rectangular" height="40px" />
        </div>
      ))}
      <ButtonSkeleton width="100%" />
    </div>
  );
}
