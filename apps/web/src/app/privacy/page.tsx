"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function PrivacyPage() {
  return (
    <div className="fb bg-[var(--bg-root)] text-[var(--text-primary)] selection:bg-[#FF4F00] selection:text-white min-h-screen" style={{ overflowX: "clip" }}>
      <title>Privacy Policy | PairPrep</title>
      <meta name="description" content="PairPrep Privacy Policy. Learn how we handle your profile visibility, authentication, and data sharing." />
      {/* Vol / Edition banner */}
      <div className="border-b-2 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6 py-2 flex items-center justify-between fm text-[11px] uppercase tracking-[0.22em]">
          <span className="hidden sm:block">PairPrep Broadsheet</span>
          <span>Privacy Edition · Clear Disclosures</span>
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

      {/* Privacy Title */}
      <section className="border-b-4 border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
          <div className="fm text-[11px] md:text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-5 flex flex-wrap items-center gap-3">
            <span className="bg-[var(--text-primary)] text-[var(--bg-root)] px-2 py-1">Legal Desk</span>
            <span>Candid disclosures. No legalese.</span>
          </div>
          <h1 className="fd font-bold leading-[0.85] tracking-tight text-[var(--text-primary)] text-[8vw] lg:text-[7rem]">
            DEVELOPER<br />PRIVACY.
          </h1>
          <p className="text-xl md:text-2xl mt-8 max-w-3xl leading-relaxed text-[var(--text-secondary)]">
            We collect what we need to match you with peers and improve your interview skills. We do not sell your code, 
            scorecards, or profile. Here is our <span className="bg-[#FF4F00] text-white px-1.5 font-semibold">zero-BS</span> explanation of what we track.
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <main className="mx-auto max-w-[1000px] px-6 py-12">
        <div className="space-y-12">
          
          {/* Article 1 */}
          <div className="border-b-2 border-dashed border-[var(--border-default)] pb-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="fd font-bold text-3xl text-[#FF4F00]">01</span>
              <h2 className="fd font-bold text-2xl text-[var(--text-primary)]">GitHub Syncing</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              When you generate your profile, we pull your public GitHub details (metadata, avatar, public repositories, and commit velocity). 
              We use this to verify you are a real developer and to calculate matching weights for programming languages. 
              We do not request read/write access to your private repos unless you explicitly grant it for code reviews.
            </p>
            <div className="fm text-xs text-[var(--text-tertiary)] bg-[var(--bg-card)] border-2 border-[var(--border-default)] p-3 inline-block">
              $ git log --oneline // public metadata only
            </div>
          </div>

          {/* Article 2 */}
          <div className="border-b-2 border-dashed border-[var(--border-default)] pb-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="fd font-bold text-3xl text-[#FF4F00]">02</span>
              <h2 className="fd font-bold text-2xl text-[var(--text-primary)]">Scorecards &amp; Feedback</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Every mock interview generates a scorecard (ratings on algorithms, communication, problem-solving, and written feedback). 
              These scorecards are shared only between you and your match partner. They are used in the match engine to assign your 
              trust level. We do not sell or lease scorecards to recruiter databases or companies unless you explicitly choose to share them.
            </p>
          </div>

          {/* Article 3 */}
          <div className="border-b-2 border-dashed border-[var(--border-default)] pb-8">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="fd font-bold text-3xl text-[#FF4F00]">03</span>
              <h2 className="fd font-bold text-2xl text-[var(--text-primary)]">Meeting &amp; Session Logs</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Meeting links are auto-generated. We track session connection times, duration, and completion statuses to maintain matching health. 
              We do not record audio, video, or screenshare feeds during calls. They are fully peer-to-peer and secure.
            </p>
          </div>

          {/* Article 4 */}
          <div className="pb-4">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="fd font-bold text-3xl text-[#FF4F00]">04</span>
              <h2 className="fd font-bold text-2xl text-[var(--text-primary)]">Contact &amp; Requests</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              If you want your profile, GitHub sync files, or interview history completely purged, you can request it 
              from your Profile page or email us at <span className="underline font-semibold">support@pairprep.io</span>. 
              All data is deleted from active DB nodes immediately.
            </p>
            <div className="fm text-xs text-[var(--text-tertiary)] bg-[var(--bg-card)] border-2 border-[var(--border-default)] p-3 inline-block">
              $ rm -rf /users/your_uuid // purge request
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
              <Link href="/manifesto" className="text-[#111111] hover:underline">Manifesto</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
