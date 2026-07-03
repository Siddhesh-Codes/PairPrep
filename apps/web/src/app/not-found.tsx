'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fb bg-[var(--bg-root)] text-[var(--text-primary)] min-h-screen flex flex-col items-center justify-center p-6 select-none">
      <title>404: Page Not Found | PairPrep</title>
      <meta name="description" content="This route could not be found. Go back to PairPrep to find peer mock interview partners." />
      
      <div className="max-w-md w-full text-center border-4 border-[var(--border-default)] bg-[var(--bg-primary)] p-8 md:p-12 shadow-[8px_8px_0_#111111] dark:shadow-[8px_8px_0_rgba(255,79,0,0.35)] relative overflow-hidden">
        {/* Background Accent Grid or Dot */}
        <div className="absolute top-2 right-2 text-xs uppercase tracking-widest font-mono text-[var(--text-tertiary)] opacity-30 select-none">
          ERR_404
        </div>
        
        {/* Large 404 Number */}
        <h1 className="text-8xl md:text-9xl font-extrabold tracking-tighter mb-4 text-[var(--accent)] font-display" style={{ textShadow: '4px 4px 0 #111111' }}>
          404
        </h1>
        
        <h2 className="text-2xl font-bold uppercase tracking-wide mb-3 font-display border-b-2 border-[var(--border-default)] pb-4">
          Route Out of Bounds
        </h2>
        
        <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
          The path you are looking for has either been moved, deleted, or never existed. Let&apos;s establish truth and get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 font-bold text-center border-2 border-[var(--border-default)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all shadow-[3px_3px_0_#111111] hover:shadow-[1px_1px_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 font-bold text-center border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-[3px_3px_0_#111111] hover:shadow-[1px_1px_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Go Back
          </button>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--text-tertiary)] tracking-widest uppercase">
        ★ PairPrep Broadsheet
      </div>
    </div>
  );
}
