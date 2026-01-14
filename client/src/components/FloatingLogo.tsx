'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface FloatingLogoProps {
  /**
   * Position on screen
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

  /**
   * Size of logo in pixels
   * @default 80
   */
  size?: number;

  /**
   * Animation type
   * @default 'float-rotate'
   */
  animation?: 'float' | 'rotate' | 'float-rotate' | 'pulse' | 'orbit';

  /**
   * Opacity (0-1)
   * @default 0.15
   */
  opacity?: number;

  /**
   * Z-index layer
   * @default 0
   */
  zIndex?: number;
}

export default function FloatingLogo({
  position = 'top-right',
  size = 80,
  animation = 'float-rotate',
  opacity = 0.15,
  zIndex = 0,
}: FloatingLogoProps) {

  // Position styles
  const positionStyles = {
    'top-left': 'top-10 left-10',
    'top-right': 'top-10 right-10',
    'bottom-left': 'bottom-10 left-10',
    'bottom-right': 'bottom-10 right-10',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  // Animation variants
  const animations = {
    float: {
      animate: {
        y: [0, -20, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      },
    },
    rotate: {
      animate: {
        rotate: [0, 360],
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear' as const,
        },
      },
    },
    'float-rotate': {
      animate: {
        y: [0, -15, 0],
        rotate: [0, 360],
        transition: {
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [opacity, opacity * 0.7, opacity],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      },
    },
    orbit: {
      animate: {
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        transition: {
          duration: 15,
          repeat: Infinity,
          ease: 'linear' as const,
        },
      },
    },
  };

  return (
    <motion.div
      className={`fixed ${positionStyles[position]} pointer-events-none`}
      style={{
        zIndex,
        opacity,
        mixBlendMode: 'multiply',
      }}
      {...animations[animation]}
    >
      <div
        className="relative"
        style={{ width: size, height: size * 1.6 }}
      >
        <Image
          src="/assets/logo_svgs/Brand_Icon(black).svg"
          alt=""
          fill
          style={{ objectFit: 'contain' }}
          priority={false}
        />
      </div>
    </motion.div>
  );
}
