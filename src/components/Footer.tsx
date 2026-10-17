import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-neutral-950/80 backdrop-blur-md mt-auto py-6 text-neutral-400">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 text-xs text-center sm:text-left">
          <span className="font-semibold text-white">CekUnfoll</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">Pengecek Unfollowers Instagram</span>
        </div>

        {/* Center: Developer pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-neutral-300 transition-colors shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Developed by</span>
          <a
            href="https://www.instagram.com/ilhamm.18/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2 flex items-center gap-0.5"
          >
            @ilhamm.18
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Right: Privacy notice */}
        <p className="text-[11px] text-neutral-500 text-center sm:text-right max-w-xs leading-relaxed">
          100% Aman & Privat. File diproses langsung di browser.
        </p>
      </div>
    </footer>
  );
};
