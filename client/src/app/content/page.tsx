'use client';

import { useState, useRef } from 'react';
import { Logo, CheckCircleIcon, ShieldCheckIcon } from '@/components/ui';
import ReportContentModal from '@/components/ReportContentModal';

export default function ContentViewPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(462); // 7:42 in seconds
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center flex-1 mx-4">
            Exclusive Studio Tour
          </h1>
          <div className="w-8 sm:w-20 md:w-32"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Success Banner */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm text-emerald-700">
              UNLOCKED - Enjoy Your Exclusive Access
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Video Player */}
          <div className="mb-6">
            <div
              ref={videoRef}
              className="relative bg-black rounded-2xl overflow-hidden shadow-xl aspect-video group"
            >
              {/* Live Stream Badge */}
              <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE STREAM
              </div>

              {/* Video Content Area */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Play Button Overlay */}
                {!isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    className="w-20 h-20 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-all"
                  >
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}

                {isPlaying && (
                  <div className="text-white text-sm mb-4">Video playing...</div>
                )}

                <p className="text-gray-400 text-sm">Secure Content Streaming</p>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Current Time */}
                  <span className="text-white text-sm font-medium">
                    {formatTime(currentTime)}
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-indigo-500
                        [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:h-3
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-indigo-500
                        [&::-moz-range-thumb]:border-0"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                      }}
                    />
                  </div>

                  {/* Duration */}
                  <span className="text-white text-sm font-medium">
                    {formatTime(duration)}
                  </span>

                  {/* Volume Button */}
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {isMuted ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Information */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Exclusive Premium Content
              </h2>
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Protected</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You have full access to this content. This material is protected by advanced security measures including streaming-only delivery and dynamic watermarking. Enjoy and share responsibly.
            </p>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            {/* Access Status */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Full Access Granted</div>
                <div className="text-sm text-gray-500">Content secured with streaming & watermarking</div>
              </div>
            </div>

            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <span className="font-medium text-gray-700">Report Content</span>
            </button>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentTitle="Premium Workout Sessions Vol. 3"
        contentType="Video Content"
        contentDuration="24 minutes"
      />
    </>
  );
}
