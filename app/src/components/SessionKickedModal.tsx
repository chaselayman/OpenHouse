"use client";

import { AlertTriangle, LogIn } from "lucide-react";

interface SessionKickedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

/**
 * Modal displayed when user's session is invalidated by a login
 * from another device/browser
 */
export function SessionKickedModal({ isOpen, onConfirm }: SessionKickedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="glass-card rounded-xl p-8 w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-3">
          Session Ended
        </h2>

        <p className="text-slate-400 mb-6">
          You've been signed out because your account was accessed from another device or browser.
          For security, only one active session is allowed per account.
        </p>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-slate-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In Again
          </button>

          <p className="text-xs text-slate-500">
            If this wasn't you, please change your password immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
