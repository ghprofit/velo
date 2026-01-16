'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { card3DTilt } from '@/lib/animations';
import { cn } from '@/lib/utils';

export type GlowColor = 'indigo' | 'purple' | 'pink' | 'cyan' | 'none';

export interface Card3DProps {
  children: ReactNode;
  glowColor?: GlowColor;
  enableTilt?: boolean;
  className?: string;
}

const glowColorClasses: Record<GlowColor, string> = {
  indigo: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.4),0_0_40px_rgba(99,102,241,0.2)]',
  purple: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4),0_0_40px_rgba(168,85,247,0.2)]',
  pink: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.4),0_0_40px_rgba(236,72,153,0.2)]',
  cyan: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4),0_0_40px_rgba(6,182,212,0.2)]',
  none: ''
};

export function Card3D({
  children,
  glowColor = 'indigo',
  enableTilt = true,
  className
}: Card3DProps) {
  if (!enableTilt) {
    return (
      <div
        className={cn(
          'bg-white rounded-xl shadow-lg border border-gray-100 transition-shadow duration-300',
          glowColor !== 'none' && glowColorClasses[glowColor],
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="perspective-1000">
      <motion.div
        initial="rest"
        whileHover="hover"
        variants={card3DTilt}
        className={cn(
          'transform-style-3d bg-white rounded-xl shadow-lg border border-gray-100 transition-shadow duration-300',
          glowColor !== 'none' && glowColorClasses[glowColor],
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

export interface StatCard3DProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: GlowColor;
  className?: string;
}

export function StatCard3D({
  title,
  value,
  icon,
  trend,
  glowColor = 'indigo',
  className
}: StatCard3DProps) {
  return (
    <Card3D glowColor={glowColor} className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && (
            <div className="p-2 bg-linear-to-br from-indigo-50 to-purple-50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card3D>
  );
}

export interface FeatureCard3DProps {
  icon: ReactNode;
  title: string;
  description: string;
  glowColor?: GlowColor;
  className?: string;
}

export function FeatureCard3D({
  icon,
  title,
  description,
  glowColor = 'indigo',
  className
}: FeatureCard3DProps) {
  return (
    <Card3D glowColor={glowColor} className={className}>
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Card3D>
  );
}

export interface ProductCard3DProps {
  image: string;
  title: string;
  price: string | number;
  badge?: string;
  onAction?: () => void;
  actionLabel?: string;
  glowColor?: GlowColor;
  className?: string;
}

export function ProductCard3D({
  image,
  title,
  price,
  badge,
  onAction,
  actionLabel = 'View Details',
  glowColor = 'indigo',
  className
}: ProductCard3DProps) {
  return (
    <Card3D glowColor={glowColor} className={cn('overflow-hidden', className)}>
      <div className="relative">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        {badge && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
            {badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">${price}</span>
          {onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </Card3D>
  );
}

export interface TestimonialCard3DProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating?: number;
  glowColor?: GlowColor;
  className?: string;
}

export function TestimonialCard3D({
  quote,
  author,
  role,
  avatar,
  rating,
  glowColor = 'purple',
  className
}: TestimonialCard3DProps) {
  return (
    <Card3D glowColor={glowColor} className={className}>
      <div className="p-6">
        {rating && (
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg
                key={index}
                className={cn(
                  'w-5 h-5',
                  index < rating ? 'text-yellow-400' : 'text-gray-300'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        <p className="text-gray-700 mb-4 italic">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-semibold">
              {author.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
      </div>
    </Card3D>
  );
}
