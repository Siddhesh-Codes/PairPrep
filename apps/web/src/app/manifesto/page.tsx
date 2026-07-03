"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function ManifestoPage() {
  return (
    <div className="fb bg-[var(--bg-root)] text-[var(--text-primary)] selection:bg-[#FF4F00] selection:text-white min-h-screen" style={{ overflowX: "clip" }}>
      <title>Manifesto | PairPrep</title>
      <meta name="description" content="Read the PairPrep Manifesto. Learn about our vision for a trust-first, peer-to-peer mock interview platform for developers." />
      {/* Vol / Edition banner */}
      <div className="border-b-2 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6 py-2 flex items-center justify-between fm text-[11px] uppercase tracking-[0.22em]">
          <span className="hidden sm:block">PairPrep Broadsheet</span>
          <span>Manifesto Edition · Establish Truth</span>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block">★ Vol. 01 — No. 24</span>
            <div className="neobrutalist-theme-toggle flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b-4 border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-[1440px] px-6 py-4 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 text-[var(--text-primary)] hover:text-[#FF4F00] transition-colors">
            <img 
              src="/PairPrep.png" 
              className="w-9 h-9 rounded-xl bg-[#111] p-1 object-contain" 
              alt="PairPrep Logo" 
            />
            <span className="fd font-bold text-4xl tracking-tight">PairPrep</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 fm text-xs uppercase tracking-[0.18em]">
            <Link href="/" className="navlink pb-1 text-[var(--text-primary)] hover:text-[#FF4F00]">Home</Link>
            <Link href="/dashboard" className="navlink pb-1 text-[var(--text-primary)] hover:text-[#FF4F00]">Dashboard</Link>
          </nav>
          <Link href="/dashboard" className="sticker fd font-bold text-xs bg-[#FF4F00] text-white border-2 border-[var(--border-default)] px-4 py-2 shadow-[4px_4px_0_var(--border-default)]">
            Workspace →
          </Link>
        </div>
      </header>

      {/* Manifesto Title */}
      <section className="border-b-4 border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
          <div className="fm text-[11px] md:text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-5 flex flex-wrap items-center gap-3">
            <span className="bg-[var(--text-primary)] text-[var(--bg-root)] px-2 py-1">Editorial Desk</span>
            <span>Why brutal honesty is the only path to competence.</span>
          </div>
          <h1 className="fd font-bold leading-[0.85] tracking-tight text-[var(--text-primary)] text-[8vw] lg:text-[7rem]">
            THE PAIRPREP<br />MANIFESTO.
          </h1>
          <p className="text-xl md:text-2xl mt-8 max-w-3xl leading-relaxed text-[var(--text-secondary)]">
            We are sick of the mock interview theater. The polite nodding. The sugar-coated scorecards. 
            The gentle <span className="bg-[#FF4F00] text-white px-1.5 font-semibold">&quot;you did great!&quot;</span> that precedes a rejection email. 
            PairPrep exists to establish cold, hard truth.
          </p>
        </div>
      </section>

      {/* The Tenets Grid */}
      <main className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Tenet 1 */}
          <div className="bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 shadow-[6px_6px_0_var(--border-default)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[var(--border-default)] pb-3 mb-4">
                <span className="fd font-bold text-xl text-[#FF4F00]">ARTICLE I</span>
                <span className="fm text-[10px] uppercase text-[var(--text-tertiary)]">candid feedback</span>
              </div>
              <h2 className="fd font-bold text-2xl mb-3 text-[var(--text-primary)]">Brutal Honesty Over Polite Coddling</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                Sugar-coated feedback is worse than no feedback. It breeds false confidence and blindsides you in real loops. 
                Our community contract mandates direct, actionable, and sometimes painful critiques. We do not evaluate vibes. 
                We evaluate execution.
              </p>
            </div>
            <div className="border-t-2 border-dashed border-[var(--border-default)] pt-4 mt-6 fm text-xs text-[var(--text-tertiary)]">
              {"// score the code, not the feelings."}
            </div>
          </div>

          {/* Tenet 2 */}
          <div className="bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 shadow-[6px_6px_0_var(--border-default)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[var(--border-default)] pb-3 mb-4">
                <span className="fd font-bold text-xl text-[#FF4F00]">ARTICLE II</span>
                <span className="fm text-[10px] uppercase text-[var(--text-tertiary)]">credentials</span>
              </div>
              <h2 className="fd font-bold text-2xl mb-3 text-[var(--text-primary)]">Commits Over Pedigree</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                We don&apos;t care about your resume format. We don&apos;t care if you didn&apos;t go to an Ivy League. 
                Your GitHub history, your code structure, your algorithmic choices, and your communication style are your credentials. 
                Resumes are stories. Code is proof.
              </p>
            </div>
            <div className="border-t-2 border-dashed border-[var(--border-default)] pt-4 mt-6 fm text-xs text-[var(--text-tertiary)]">
              {"// git commit -m \"proof of work\""}
            </div>
          </div>

          {/* Tenet 3 */}
          <div className="bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 shadow-[6px_6px_0_var(--border-default)] flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[var(--border-default)] pb-3 mb-4">
                <span className="fd font-bold text-xl text-[#FF4F00]">ARTICLE III</span>
                <span className="fm text-[10px] uppercase text-[var(--text-tertiary)]">the contract</span>
              </div>
              <h2 className="fd font-bold text-2xl mb-3 text-[var(--text-primary)]">Symmetrical Peer Exchange</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                PairPrep is not a service you buy. It is a guild you join. To receive a high-fidelity mock interview, 
                you must give one. This symmetry forces you to sit on both sides of the table, teaching you to think 
                like an interviewer and elevating the system quality for everyone.
              </p>
            </div>
            <div className="border-t-2 border-dashed border-[var(--border-default)] pt-4 mt-6 fm text-xs text-[var(--text-tertiary)]">
              {"// give reps to get reps."}
            </div>
          </div>

        </div>

        {/* Big Callout Box */}
        <div className="mt-12 bg-[#FF4F00] text-white border-[3px] border-[var(--border-default)] p-8 md:p-10 shadow-[8px_8px_0_var(--border-default)]">
          <div className="max-w-3xl">
            <h3 className="fd font-bold text-3xl md:text-4xl mb-4 uppercase">THE RULE OF NO EXCUSES</h3>
            <p className="fm text-sm md:text-base leading-relaxed opacity-90 mb-6">
              When you fail a mock, you do not blame the prompt, the compiler, or your partner. You analyze the scorecard, 
              write the refactor, and schedule the next session. This is the only path to mastery.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
              <span className="bg-[var(--bg-root)] text-[var(--text-primary)] px-3 py-1.5 border border-[var(--border-default)]">No Sugarcoating</span>
              <span className="bg-[var(--bg-root)] text-[var(--text-primary)] px-3 py-1.5 border border-[var(--border-default)]">No Pedigree Bias</span>
              <span className="bg-[var(--bg-root)] text-[var(--text-primary)] px-3 py-1.5 border border-[var(--border-default)]">No Resumes</span>
            </div>
          </div>
        </div>
      </main>

      {/* Broadsheet Footer */}
      <footer className="bg-[#FF4F00] text-[#111] border-t-4 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b-2 border-[#111] pb-6 fm text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <img 
                src="/PairPrep.png" 
                className="w-5 h-5 rounded-md bg-[#111] p-0.5 object-contain" 
                alt="PairPrep Logo" 
              />
              PairPrep © 2026 — Fail here first.
            </span>
            <div className="flex gap-6">
              <Link href="/" className="text-[#111111] hover:underline">Home</Link>
              <Link href="/dashboard" className="text-[#111111] hover:underline">Dashboard</Link>
              <Link href="/privacy" className="text-[#111111] hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
