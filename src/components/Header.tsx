import React from 'react';
import { Sparkles, RotateCcw, ExternalLink } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  onReset: () => void;
  onLoadDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasData, onReset, onLoadDemo }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 text-left group cursor-pointer transition-transform active:scale-95"
          >
            {/* Instagram story gradient border logo */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-shadow">
              <div className="w-8 h-8 rounded-[10px] bg-neutral-950 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4.5 h-4.5 text-rose-400 group-hover:text-rose-300 transition-colors"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                CekUnfoll
                <span className="hidden sm:inline text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">
                  v2.0
                </span>
              </span>
            </div>
          </button>

        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          {hasData ? (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 rounded-xl border border-white/10 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Ganti File</span>
            </button>
          ) : (
            <button
              onClick={onLoadDemo}
              className="relative group overflow-hidden flex items-center justify-center px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md shadow-rose-600/20 hover:shadow-rose-600/30 transition-all active:scale-95 cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95"
            >
              <span>Uji Coba Analisis Akun</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
