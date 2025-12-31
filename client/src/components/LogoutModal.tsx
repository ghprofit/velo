'use client';

import { useState } from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [rememberSession, setRememberSession] = useState(false);

  const handleLogout = () => {
    // Handle remember session preference
    if (rememberSession) {
      localStorage.setItem('rememberSession', 'true');
    }
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>

        {/* Title & Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Confirm Logout</h2>
          <p className="text-gray-600 leading-relaxed">
            Are you sure you want to log out from your admin session?<br />
            You&apos;ll need to sign in again to continue managing the platform.
          </p>
        </div>

        {/* Remember Session Checkbox */}
        <div className="mb-6">
          <label className="flex items-center justify-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Remember my session next time
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Velo Admin v1.0. Secure session management enabled.
        </p>
      </div>
    </div>
  );
}
