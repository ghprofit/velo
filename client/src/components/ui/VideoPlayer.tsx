'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  protectContent?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  playbackRate: PlaybackSpeed;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  showSpeedMenu: boolean;
}

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Utility function to format time
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Animation variants
const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.1 } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
};

export function VideoPlayer({
  src,
  poster,
  className,
  autoPlay = false,
  loop = false,
  protectContent = true,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
}: VideoPlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // State
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isPiP: false,
    playbackRate: 1,
    isLoading: true,
    hasError: false,
    errorMessage: null,
    showSpeedMenu: false,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => {
        console.error('Failed to play:', err);
        onError?.(err);
      });
    } else {
      video.pause();
    }
  }, [onError]);

  // Seek handler
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar || !video.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPosition * video.duration;

    video.currentTime = newTime;
    setState((s) => ({ ...s, currentTime: newTime }));
  }, []);

  // Volume change handler
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = newVolume === 0;
    setState((s) => ({
      ...s,
      volume: newVolume,
      isMuted: newVolume === 0,
    }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setState((s) => ({ ...s, isMuted: video.muted }));
  }, []);

  // Playback rate change
  const handlePlaybackRateChange = useCallback((rate: PlaybackSpeed) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setState((s) => ({ ...s, playbackRate: rate, showSpeedMenu: false }));
  }, []);

  // Toggle speed menu
  const toggleSpeedMenu = useCallback(() => {
    setState((s) => ({ ...s, showSpeedMenu: !s.showSpeedMenu }));
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Toggle Picture-in-Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setState((s) => ({ ...s, isPlaying: true }));
      onPlay?.();
    };

    const handlePause = () => {
      setState((s) => ({ ...s, isPlaying: false }));
      onPause?.();
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setState((s) => ({
          ...s,
          currentTime: video.currentTime,
          duration: video.duration || 0,
        }));
        onTimeUpdate?.(video.currentTime, video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setState((s) => ({
        ...s,
        duration: video.duration,
        isLoading: false,
      }));
    };

    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setState((s) => ({ ...s, buffered: bufferedPercent }));
      }
    };

    const handleWaiting = () => {
      setState((s) => ({ ...s, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState((s) => ({ ...s, isLoading: false }));
    };

    const handleError = () => {
      const error = video.error;
      const message = error?.message || 'Failed to load video';
      setState((s) => ({
        ...s,
        hasError: true,
        errorMessage: message,
        isLoading: false,
      }));
      onError?.(new Error(message));
    };

    const handleEnded = () => {
      setState((s) => ({ ...s, isPlaying: false }));
      onEnded?.();
    };

    const handleEnterPiP = () => setState((s) => ({ ...s, isPiP: true }));
    const handleLeavePiP = () => setState((s) => ({ ...s, isPiP: false }));

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [isDragging, onPlay, onPause, onEnded, onError, onTimeUpdate]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((s) => ({ ...s, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      // Only handle if container is focused
      if (!container.contains(document.activeElement) && document.activeElement !== container) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setState((s) => ({ ...s, volume: video.volume, isMuted: false }));
          video.muted = false;
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setState((s) => ({ ...s, volume: video.volume }));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (state.showSpeedMenu) {
            setState((s) => ({ ...s, showSpeedMenu: false }));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, toggleFullscreen, state.showSpeedMenu]);

  // Content protection
  useEffect(() => {
    if (!protectContent) return;

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    video.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      video.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [protectContent]);

  // Close speed menu when clicking outside
  useEffect(() => {
    if (!state.showSpeedMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-speed-menu]')) {
        setState((s) => ({ ...s, showSpeedMenu: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [state.showSpeedMenu]);

  // Progress percentage
  const progressPercent = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  // Volume icon
  const VolumeIcon = state.isMuted || state.volume === 0
    ? VolumeX
    : state.volume < 0.5
      ? Volume1
      : Volume2;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-2xl overflow-hidden select-none',
        'ring-1 ring-gray-800 shadow-xl',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500',
        state.isFullscreen && 'rounded-none ring-0',
        className
      )}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        preload="metadata"
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        controlsList={protectContent ? 'nodownload' : undefined}
        onClick={togglePlayPause}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      <AnimatePresence>
        {state.isLoading && !state.hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-white/80 text-sm font-medium">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {state.hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="flex flex-col items-center gap-4 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Failed to load video</p>
                <p className="text-white/60 text-sm">{state.errorMessage || 'An unexpected error occurred'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Container */}
      {!state.hasError && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'bg-gradient-to-t from-black/90 via-black/60 to-transparent',
            'px-3 sm:px-4 pb-3 sm:pb-4 pt-12 sm:pt-16'
          )}
        >
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="relative h-1 sm:h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 sm:mb-4 group/progress"
            onClick={handleSeek}
          >
            {/* Buffered Progress */}
            <div
              className="absolute h-full bg-white/30 rounded-full transition-all duration-300"
              style={{ width: `${state.buffered}%` }}
            />

            {/* Current Progress */}
            <div
              className="absolute h-full bg-indigo-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Seek Handle */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                'w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg',
                'opacity-0 group-hover/progress:opacity-100',
                'transition-opacity duration-200'
              )}
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play/Pause Button */}
              <motion.button
                onClick={togglePlayPause}
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-full',
                  'bg-indigo-600 hover:bg-indigo-700',
                  'flex items-center justify-center',
                  'text-white shadow-lg',
                  'transition-colors duration-200'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                <AnimatePresence mode="wait">
                  {state.isPlaying ? (
                    <motion.div
                      key="pause"
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Volume Control */}
              <div className="flex items-center gap-1 sm:gap-2 group/volume">
                <motion.button
                  onClick={toggleMute}
                  className="text-white/90 hover:text-white p-1.5 sm:p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={state.isMuted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>

                {/* Volume Slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={handleVolumeChange}
                  className={cn(
                    'w-0 group-hover/volume:w-16 sm:group-hover/volume:w-20',
                    'h-1 bg-white/30 rounded-full',
                    'appearance-none cursor-pointer',
                    'transition-all duration-300',
                    '[&::-webkit-slider-thumb]:appearance-none',
                    '[&::-webkit-slider-thumb]:w-2.5',
                    '[&::-webkit-slider-thumb]:h-2.5',
                    '[&::-webkit-slider-thumb]:sm:w-3',
                    '[&::-webkit-slider-thumb]:sm:h-3',
                    '[&::-webkit-slider-thumb]:rounded-full',
                    '[&::-webkit-slider-thumb]:bg-indigo-500',
                    '[&::-webkit-slider-thumb]:hover:bg-indigo-400',
                    '[&::-webkit-slider-thumb]:cursor-pointer'
                  )}
                  aria-label="Volume"
                />
              </div>

              {/* Time Display */}
              <div className="text-white/90 text-xs sm:text-sm font-medium tabular-nums hidden xs:flex">
                <span>{formatTime(state.currentTime)}</span>
                <span className="mx-1 text-white/50">/</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Playback Speed */}
              <div className="relative" data-speed-menu>
                <motion.button
                  onClick={toggleSpeedMenu}
                  className={cn(
                    'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md',
                    'bg-white/10 hover:bg-white/20',
                    'text-white/90 text-xs sm:text-sm font-medium',
                    'transition-colors duration-200'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Playback speed"
                >
                  {state.playbackRate}x
                </motion.button>

                {/* Speed Menu Dropdown */}
                <AnimatePresence>
                  {state.showSpeedMenu && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={cn(
                        'absolute bottom-full right-0 mb-2',
                        'bg-gray-900/95 backdrop-blur-sm rounded-lg',
                        'py-1 sm:py-2 min-w-[80px] sm:min-w-[100px] shadow-xl',
                        'ring-1 ring-white/10'
                      )}
                    >
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handlePlaybackRateChange(speed)}
                          className={cn(
                            'w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-left',
                            'hover:bg-indigo-600/50 transition-colors',
                            state.playbackRate === speed
                              ? 'text-indigo-400 font-semibold'
                              : 'text-white/80'
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Picture-in-Picture */}
              {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                <motion.button
                  onClick={togglePiP}
                  className={cn(
                    'p-1.5 sm:p-2 rounded-md',
                    'text-white/80 hover:text-white',
                    'hover:bg-white/10',
                    'transition-colors duration-200',
                    state.isPiP && 'text-indigo-400'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}

              {/* Fullscreen Toggle */}
              <motion.button
                onClick={toggleFullscreen}
                className={cn(
                  'p-1.5 sm:p-2 rounded-md',
                  'text-white/80 hover:text-white',
                  'hover:bg-white/10',
                  'transition-colors duration-200'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {state.isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Center Play Button (when paused and not loading) */}
      <AnimatePresence>
        {!state.isPlaying && !state.isLoading && !state.hasError && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlayPause}
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-16 h-16 sm:w-20 sm:h-20 rounded-full',
              'bg-indigo-600/90 hover:bg-indigo-600',
              'flex items-center justify-center',
              'text-white shadow-2xl',
              'transition-colors duration-200'
            )}
            aria-label="Play"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPlayer;
