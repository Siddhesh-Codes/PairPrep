"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  hoverSpeed?: number;
  className?: string;
  innerClassName?: string;
}

function Marquee({ children, speed = 1, hoverSpeed = 1, className = "", innerClassName = "" }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const posRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      const track = trackRef.current;
      if (!track) return;

      const currentSpeed = isHovered ? hoverSpeed : speed;
      posRef.current -= currentSpeed;

      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, speed, hoverSpeed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={trackRef}
        className={`flex whitespace-nowrap ${innerClassName}`}
        style={{ width: "max-content", willChange: "transform" }}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [githubHandle, setGithubHandle] = useState("");
  const [emailOrGithub, setEmailOrGithub] = useState("");
  const router = useRouter();

  const handleGenerateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubHandle.trim()) {
      router.push(`/register?github=${encodeURIComponent(githubHandle.trim())}`);
    } else {
      router.push("/register");
    }
  };

  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrGithub.trim()) {
      router.push(`/register?email_or_github=${encodeURIComponent(emailOrGithub.trim())}`);
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="fb bg-[var(--bg-root)] text-[var(--text-primary)] selection:bg-[#FF4F00] selection:text-white" style={{ overflowX: "clip" }}>
      {/* Vol / Edition banner */}
      <div className="border-b-2 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6 py-2 flex items-center justify-between fm text-[11px] uppercase tracking-[0.22em]">
          <span className="hidden sm:block">Est. 2026 · Remote-first</span>
          <span>Mock Interview Edition · Practice Daily</span>
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
          <Link href="#top" className="flex items-center gap-2.5 shrink-0 text-[var(--text-primary)] hover:text-[#FF4F00] transition-colors">
            <img 
              src="/PairPrep.png" 
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#111] p-1 object-contain" 
              decoding="async" 
              loading="lazy" 
              alt="PairPrep Logo" 
            />
            <span className="fd font-bold text-4xl md:text-5xl tracking-tight">PairPrep</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-9 fm text-sm uppercase tracking-[0.18em]">
            <Link href="#journey" className="navlink pb-1 text-[var(--text-primary)] hover:text-[#FF4F00]">Journey</Link>
            <Link href="#partners" className="navlink pb-1 text-[var(--text-primary)] hover:text-[#FF4F00]">Partners</Link>
            <Link href="#feedback" className="navlink pb-1 text-[var(--text-primary)] hover:text-[#FF4F00]">Feedback</Link>
          </nav>
          <Link href="#join" className="sticker fd font-bold text-base bg-[#FF4F00] text-white border-2 border-[var(--border-default)] px-5 py-2.5 shadow-[5px_5px_0_var(--border-default)]">
            Start now →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="border-b-4 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6 pt-7 pb-6">
          <div className="fm text-[11px] md:text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-5 flex flex-wrap items-center gap-3">
            <span className="bg-[#111] text-[#F4F0EC] px-2 py-1">The Front Page</span>
            <span>Brutal honesty, included free of charge.</span>
          </div>
          <h1 className="fd font-bold leading-[0.82] tracking-tight text-[var(--text-primary)] text-[11vw] lg:text-[10.5rem]">
            FAIL HERE,<br />NOT AT{" "}
            <span className="relative inline-block text-[#FF4F00]">
              GOOGLE.
              <span className="pointer-events-none absolute left-[-1%] top-[47%] h-[9px] w-[102%] bg-[#111] -rotate-1"></span>
            </span>
          </h1>
        </div>
        <div className="border-t-4 border-[var(--border-default)] grid lg:grid-cols-2">
          {/* Hero Left */}
          <div className="p-7 lg:p-10 lg:border-r-4 border-[var(--border-default)] flex flex-col justify-between gap-8">
            <p className="text-xl md:text-[1.7rem] leading-snug max-w-xl">
              Practice technical interviews with real engineers. Get matched, get on a call, get{" "}
              <span className="bg-[#FF4F00] text-white px-1.5 font-semibold">brutally honest</span> feedback.
            </p>
            <ul className="fm text-sm space-y-3 border-y-2 border-dashed border-[var(--border-default)] py-5">
              <li className="flex items-center gap-3">
                <span className="text-[#FF4F00] text-lg shrink-0">
                  <i className="ti ti-arrow-right"></i>
                </span>{" "}
                Matched by stack <span className="text-[var(--text-secondary)]">&amp;</span> availability
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FF4F00] text-lg shrink-0">
                  <i className="ti ti-arrow-right"></i>
                </span>{" "}
                External meeting link, auto-generated
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#FF4F00] text-lg shrink-0">
                  <i className="ti ti-arrow-right"></i>
                </span>{" "}
                Structured scorecard after every call
              </li>
            </ul>
            <Link href="#join" className="sticker self-start fd font-bold text-lg md:text-xl bg-[#FF4F00] text-white border-[3px] border-[var(--border-default)] px-7 py-4 shadow-[7px_7px_0_var(--border-default)] inline-flex items-center gap-3">
              <span className="text-2xl">
                <i className="ti ti-brand-github"></i>
              </span>{" "}
              Drop your GitHub handle →
            </Link>
          </div>

          {/* Hero Right / Intake Form */}
          <div className="p-7 lg:p-10 bg-[#111] flex flex-col justify-center" id="join">
            <div className="flex items-center justify-between fm text-[11px] uppercase tracking-[0.25em] text-[#F4F0EC]/55 mb-5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4F00] animate-pulse"></span> Intake open · matched in 24h
              </span>
              <span className="hidden sm:inline">v1.0</span>
            </div>
            <form onSubmit={handleGenerateProfile} className="bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 md:p-7 shadow-[8px_8px_0_#FF4F00]">
              <div className="fm text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4 flex items-center justify-between border-b-2 border-dashed border-[var(--border-default)] pb-3">
                <span># new_candidate.form</span>
                <span className="text-[#FF4F00]">● required</span>
              </div>
              <label className="block fm text-sm font-semibold mb-2">GitHub handle</label>
              <div className="flex items-stretch border-2 border-[var(--border-default)] mb-5 bg-[var(--bg-card)]">
                <span className="fm text-sm bg-[var(--bg-primary)] border-r-2 border-[var(--border-default)] px-3 flex items-center text-[var(--text-secondary)]">
                  github.com/
                </span>
                <input 
                  type="text" 
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  className="fm text-sm flex-1 px-3 py-3 outline-none bg-[var(--bg-card)] min-w-0" 
                  placeholder="your-handle" 
                  required
                />
              </div>
              <button type="submit" className="sticker w-full fd font-bold text-lg bg-[#FF4F00] text-white border-2 border-[var(--border-default)] px-5 py-3 shadow-[6px_6px_0_var(--border-default)]">
                Generate my profile →
              </button>
              <p className="fm text-[11px] text-[var(--text-secondary)] mt-3">{"// no resume. no cover letter. just commits."}</p>
            </form>
          </div>
        </div>
      </section>

      {/* Scrolling Ticker Section I */}
      <section className="bg-[#111] text-[#F4F0EC] overflow-hidden border-b-4 border-[var(--border-default)]">
        <Marquee speed={0.8} hoverSpeed={0.8} className="py-3 fd font-medium text-lg uppercase tracking-wide">
          <span className="px-6">DSA</span><span className="px-6 text-[#FF4F00]">System Design</span><span className="px-6">React</span><span className="px-6 text-[#FF4F00]">Go</span>
          <img src="/PairPrep.png" className="w-6 h-6 mx-3 inline-block rounded-md bg-[#111] p-0.5" decoding="async" loading="lazy" alt="logo" />
          <span className="px-6">12,400+ Mocks Run</span><span className="px-6 text-[#FF4F00]">38 Stacks</span><span className="px-6">4.8 Avg Debrief</span><span className="px-6 text-[#FF4F00]">Python</span><span className="px-6">Rust</span><span className="px-6 text-[#FF4F00]">Behavioral</span>
        </Marquee>
      </section>

      {/* How It Works Spine */}
      <section id="journey" className="py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-[var(--border-default)] pb-5">
            <div>
              <div className="fm text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-2">Section II — How it works</div>
              <h2 className="fd font-bold text-5xl md:text-7xl leading-[0.9]">THE PRACTICE<br />JOURNEY</h2>
            </div>
            <p className="fm text-sm text-[var(--text-secondary)] max-w-xs md:text-right">
              Four commits from sign-up to a brutally honest debrief. Follow the spine. <span className="text-[#FF4F00]">↓</span>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1000px] px-6 relative pt-16 pb-8">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[6px] bg-[#111] -translate-x-1/2"></div>
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 z-30 w-16 h-16 rounded-full bg-[#111] items-center justify-center">
            <img src="/PairPrep.png" className="w-8 h-8 rounded-lg bg-[#111] p-1" decoding="async" loading="lazy" alt="logo" />
          </div>

          {/* Step 1 */}
          <div className="relative mb-12">
            <div className="hidden lg:block absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="fd font-bold text-3xl leading-none">00:00</div>
              <div className="fm text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mt-1.5">you sign up</div>
            </div>
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF4F00] border-[3px] border-[var(--border-default)] items-center justify-center shadow-[3px_3px_0_var(--border-default)] text-2xl">
              <i className="ti ti-git-commit"></i>
            </div>
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-y-1/2 h-[4px] w-[7%] bg-[#111]"></div>
            <div className="relative z-10 lg:w-[46%] lg:ml-auto">
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275] }}
                className="spine-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 md:p-7 shadow-[8px_8px_0_var(--border-default)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="fd font-bold text-5xl text-[#FF4F00] leading-none">01</span>
                  <span className="fm text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">git commit -m &quot;profile&quot;</span>
                </div>
                <h3 className="fd font-bold text-2xl md:text-3xl mb-2">Build your stack profile</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Link GitHub, list your languages, pick the rounds you want to drill. Takes two minutes, no resume required.</p>
                <div className="flex flex-wrap gap-2 mt-4 fm text-xs">
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">Go</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">React</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">System Design</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-12">
            <div className="hidden lg:block absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="fd font-bold text-3xl leading-none">+0:02</div>
              <div className="fm text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mt-1.5">we match you</div>
            </div>
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF4F00] border-[3px] border-[var(--border-default)] items-center justify-center shadow-[3px_3px_0_var(--border-default)] text-2xl">
              <i className="ti ti-git-branch"></i>
            </div>
            <div className="hidden lg:block absolute right-1/2 top-1/2 -translate-y-1/2 h-[4px] w-[7%] bg-[#111]"></div>
            <div className="relative z-10 lg:w-[46%]">
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275], delay: 0.05 }}
                className="spine-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 md:p-7 shadow-[8px_8px_0_var(--border-default)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="fd font-bold text-5xl text-[#FF4F00] leading-none">02</span>
                  <span className="fm text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">schedule --tz</span>
                </div>
                <h3 className="fd font-bold text-2xl md:text-3xl mb-2">Lock a time</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Set availability and timezone. We match you with a partner whose calendar and stack line up — no endless back-and-forth.</p>
                <div className="mt-4 fm text-xs border-2 border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 inline-block">Tue 18:00 IST ↔ 07:30 PST</div>
              </motion.div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative mb-12">
            <div className="hidden lg:block absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="fd font-bold text-3xl leading-none">+1 day</div>
              <div className="fm text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mt-1.5">call goes live</div>
            </div>
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF4F00] border-[3px] border-[var(--border-default)] items-center justify-center shadow-[3px_3px_0_var(--border-default)] text-2xl">
              <i className="ti ti-git-commit"></i>
            </div>
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-y-1/2 h-[4px] w-[7%] bg-[#111]"></div>
            <div className="relative z-10 lg:w-[46%] lg:ml-auto">
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275], delay: 0.1 }}
                className="spine-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 md:p-7 shadow-[8px_8px_0_var(--border-default)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="fd font-bold text-5xl text-[#FF4F00] leading-none">03</span>
                  <span className="fm text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">call --start</span>
                </div>
                <h3 className="fd font-bold text-2xl md:text-3xl mb-2">Get on the call</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">An external meeting link is auto-generated the moment a match locks. Nothing to install, nothing to configure.</p>
                <div className="mt-4 fm text-xs border-2 border-[var(--border-default)] bg-[#111] text-[#F4F0EC] px-3 py-2 inline-flex items-center gap-2">
                  <i className="ti ti-link"></i> meet.pairprep.io/x9f2-qz
                </div>
              </motion.div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative mb-4">
            <div className="hidden lg:block absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="fd font-bold text-3xl leading-none">+1:30</div>
              <div className="fm text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mt-1.5">debrief filed</div>
            </div>
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF4F00] border-[3px] border-[var(--border-default)] items-center justify-center shadow-[3px_3px_0_var(--border-default)] text-2xl">
              <i className="ti ti-git-branch"></i>
            </div>
            <div className="hidden lg:block absolute right-1/2 top-1/2 -translate-y-1/2 h-[4px] w-[7%] bg-[#111]"></div>
            <div className="relative z-10 lg:w-[46%]">
              <motion.div 
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275], delay: 0.15 }}
                className="spine-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] p-6 md:p-7 shadow-[8px_8px_0_var(--border-default)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="fd font-bold text-5xl text-[#FF4F00] leading-none">04</span>
                  <span className="fm text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">feedback --honest</span>
                </div>
                <h3 className="fd font-bold text-2xl md:text-3xl mb-2">Brutally honest feedback</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Both sides leave structured scores and notes. It builds your trust score and sharpens every future match.</p>
                <div className="flex flex-wrap gap-2 mt-4 fm text-xs">
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">Algo 8/10</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">Comms 6/10</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">PS 7/10</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 bottom-0 z-30 w-14 h-14 rounded-full bg-[#111] text-[#F4F0EC] items-center justify-center text-2xl">
            <i className="ti ti-arrow-down"></i>
          </div>
        </div>
      </section>

      {/* Partners Desk */}
      <section id="partners" className="py-16 border-t-4 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="border-b-4 border-[var(--border-default)] pb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="fm text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-2">Section III — The community desk</div>
              <h2 className="fd font-bold text-5xl md:text-7xl leading-[0.9]">REAL PARTNERS.<br />REAL REPS.</h2>
            </div>
            <p className="fm text-sm text-[var(--text-secondary)] max-w-xs">
              No grayscale logo wall. Actual engineers who&apos;ll get on a call and tell you the truth. <span className="text-[#FF4F00]">Pinned, not polished.</span>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-6 mt-16 pb-6 flex flex-col items-center lg:flex-row lg:items-start gap-12 lg:gap-8">
          {/* Column 1 */}
          <div className="w-full max-w-[340px] lg:max-w-none lg:flex-1 flex flex-col gap-12">
            {/* Marcus Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(-2.5deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <span className="absolute -top-3.5 -right-3 fd font-bold text-[11px] bg-[#FF4F00] text-[var(--text-primary)] border-[3px] border-[var(--border-default)] px-2 py-1 z-20" style={{ transform: "rotate(6deg)" }}>★ VERIFIED</span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Marcus Webb, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Marcus Webb</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">14 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@mwebb · Go + Rust</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Ex-Amazon</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Strong in Graph Theory</li>
                </ul>
                <div className="mt-3 fd font-semibold text-[11px] uppercase tracking-wide inline-block border-2 border-[var(--border-default)] px-2 py-1">Free Thu–Sat</div>
              </div>
            </div>

            {/* Aisha Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(2deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Aisha Bello, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Aisha Bello</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">22 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@aishab · TS + Python</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Staff engineer</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Behavioral round killer</li>
                </ul>
                <div className="mt-3 fd font-semibold text-[11px] uppercase tracking-wide inline-flex items-center gap-1.5 border-2 border-[var(--border-default)] bg-[#111] text-[#F4F0EC] px-2 py-1">
                  <span className="text-[#FF4F00]">★</span> 4.9 debrief avg
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="w-full max-w-[340px] lg:max-w-none lg:flex-1 flex flex-col gap-12 lg:mt-16">
            {/* Priya Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(1.5deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Priya Nair, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Priya Nair</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">27 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@priyacodes · Python + TS</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> System design specialist</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Mentors juniors</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Whiteboard maximalist</li>
                </ul>
              </div>
            </div>

            {/* Sara Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(-2deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Sara Lindqvist, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Sara Lindqvist</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">31 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@saralind · Java + Go</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Ex-Stripe</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Loves DP problems</li>
                </ul>
                <div className="mt-3 fd font-semibold text-[11px] uppercase tracking-wide inline-block border-2 border-[var(--border-default)] px-2 py-1">Free weekends</div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="w-full max-w-[340px] lg:max-w-none lg:flex-1 flex flex-col gap-12 lg:mt-7">
            {/* Dani Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(2.5deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <span className="absolute -top-3.5 -right-3 fd font-bold text-[11px] bg-[var(--bg-card)] text-[var(--text-primary)] border-[3px] border-[var(--border-default)] px-2 py-1 z-20 flex items-center gap-1.5" style={{ transform: "rotate(5deg)" }}>
                <span className="w-2 h-2 rounded-full bg-[#FF4F00] animate-pulse"></span> LIVE NOW
              </span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Dani Ortiz, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Dani Ortiz</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">9 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@dani_o · React + Node</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Frontend perf nerd</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Brutally honest</li>
                </ul>
              </div>
            </div>

            {/* Lena Card */}
            <div className="pin-card bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-3" style={{ transform: "rotate(-3deg)" }}>
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-5 rounded-full bg-[#FF4F00] border-2 border-[var(--border-default)] z-10"></span>
              <span className="absolute -bottom-4 -right-3 fd font-bold text-sm bg-[#FF4F00] text-[var(--text-primary)] border-[3px] border-[var(--border-default)] shadow-[3px_3px_0_var(--border-default)] px-3 py-1.5 z-20" style={{ transform: "rotate(4deg)" }}>you&apos;re next →</span>
              <div className="overflow-hidden border-2 border-[var(--border-default)]">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&crop=faces&w=600&h=400&q=80&sat=-100" 
                  alt="Lena Fischer, practice partner" 
                  className="w-full h-44 object-cover grayscale" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="fd font-bold text-lg leading-none">Lena Fischer</h3>
                  <span className="fm text-[11px] text-[#FF4F00] shrink-0">18 mocks</span>
                </div>
                <div className="fm text-xs text-[var(--text-secondary)] mt-1">@lenaf · C++ + Rust</div>
                <ul className="fm text-xs mt-3 space-y-1.5 border-t-2 border-dashed border-[var(--border-default)] pt-3">
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Competitive programmer</li>
                  <li className="flex gap-2"><span className="text-[#FF4F00]">▸</span> Codeforces purple</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Debrief Section */}
      <section id="feedback" className="py-16 border-t-4 border-[var(--border-default)]">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="border-b-4 border-[var(--border-default)] pb-5 mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="fm text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-2">Section IV — The debrief desk</div>
              <h2 className="fd font-bold text-5xl md:text-7xl leading-[0.9]">BRUTALLY HONEST<br />DEBRIEFS</h2>
            </div>
            <p className="fm text-sm text-[var(--text-secondary)] max-w-sm">
              Every session ends with a structured scorecard — not a vibe check. Honest reps train the match engine, so your next partner is sharper than your last.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Column Left (Main card) */}
            <div className="lg:col-span-7 bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[10px_10px_0_var(--border-default)] p-7" style={{ transform: "rotate(-1deg)" }}>
              <div className="flex items-center justify-between border-b-2 border-[var(--border-default)] pb-3 mb-5">
                <div className="fd font-bold text-base uppercase tracking-widest">Debrief No. 4471</div>
                <div className="fm text-[11px] bg-[#111] text-white px-2 py-1">React · Mid-level</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="border-2 border-[var(--border-default)] p-3 text-center">
                  <div className="fd font-bold text-3xl">8<span className="text-base text-[var(--text-secondary)]">/10</span></div>
                  <div className="fm text-[10px] uppercase tracking-wide text-[var(--text-secondary)] mt-1">Algorithms</div>
                </div>
                <div className="border-2 border-[var(--border-default)] p-3 text-center bg-[#FF4F00] text-white">
                  <div className="fd font-bold text-3xl">6<span className="text-base text-white/70">/10</span></div>
                  <div className="fm text-[10px] uppercase tracking-wide mt-1">Communication</div>
                </div>
                <div className="border-2 border-[var(--border-default)] p-3 text-center">
                  <div className="fd font-bold text-3xl">7<span className="text-base text-[var(--text-secondary)]">/10</span></div>
                  <div className="fm text-[10px] uppercase tracking-wide text-[var(--text-secondary)] mt-1">Problem Solving</div>
                </div>
              </div>
              <blockquote className="fd font-bold text-3xl md:text-4xl leading-[1.05] mb-5">&quot;Your DP was clean. Your comms weren&apos;t.&quot;</blockquote>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
                You jumped straight to the optimal solution without narrating the brute force. Strong engineers think out loud — interviewers can&apos;t score silence.
              </p>
              <div className="flex items-center justify-between border-t-2 border-dashed border-[var(--border-default)] pt-4 fm text-xs gap-3">
                <span className="text-[var(--text-secondary)]">— reviewed by @senior_dev · Staff @ FAANG</span>
                <span className="bg-[#111] text-[#F4F0EC] px-2 py-1 shrink-0">trust +12</span>
              </div>
            </div>

            {/* Column Right (Two stacked cards) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Go Card */}
              <div className="bg-[var(--bg-card)] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_var(--border-default)] p-6" style={{ transform: "rotate(1deg)" }}>
                <div className="flex items-center justify-between border-b-2 border-[var(--border-default)] pb-3 mb-4">
                  <div className="fd font-bold text-sm uppercase tracking-widest">Debrief No. 4388</div>
                  <div className="fm text-[11px] bg-[#111] text-white px-2 py-1">Go · Senior</div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4 fm text-xs">
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">Algo 9/10</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">Comms 8/10</span>
                  <span className="border-2 border-[var(--border-default)] px-2 py-1">PS 9/10</span>
                </div>
                <blockquote className="fd font-bold text-xl leading-tight">&quot;Talk through brute force FIRST. Then optimize.&quot;</blockquote>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-dashed border-[var(--border-default)]">
                  <p className="fm text-xs text-[var(--text-secondary)]">— @gopher_eth · Ex-Google</p>
                  <span className="fd font-bold text-[11px] uppercase bg-[#FF4F00] text-[var(--text-primary)] border-2 border-[var(--border-default)] px-2 py-1">✓ would pair again</span>
                </div>
              </div>

              {/* Python Card */}
              <div className="bg-[#111] text-[#F4F0EC] border-[3px] border-[var(--border-default)] shadow-[8px_8px_0_#FF4F00] p-6" style={{ transform: "rotate(-1.5deg)" }}>
                <div className="flex items-center justify-between border-b-2 border-[#F4F0EC]/40 pb-3 mb-4">
                  <div className="fd font-bold text-sm uppercase tracking-widest">Debrief No. 4402</div>
                  <div className="fm text-[11px] bg-[#FF4F00] text-white px-2 py-1">Python · Junior</div>
                </div>
                <blockquote className="fd font-bold text-2xl leading-tight text-[#FF4F00] mb-4">&quot;Stop coding before you&apos;ve stated the approach.&quot;</blockquote>
                <div className="flex items-center gap-3 mb-4">
                  <span className="fm text-[10px] uppercase tracking-[0.25em] text-[#F4F0EC]/60">Next focus</span>
                  <span className="fm text-xs border-2 border-[#F4F0EC]/40 px-2 py-1">recursion + state</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-[#F4F0EC]/30">
                  <p className="fm text-xs text-[#F4F0EC]/60">— @pyninja · Senior @ Stripe</p>
                  <span className="fm text-[11px] text-[#FF4F00] font-medium">Algo 5/10 ↑ +2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Ticker Section II ("NO EXCUSES") */}
      <section className="bg-[#FF4F00] border-y-4 border-[var(--border-default)] overflow-hidden cursor-pointer">
        <Marquee speed={1.5} hoverSpeed={4.5} className="py-5 fd font-bold text-[7vw] leading-none text-[var(--text-primary)]">
          <span className="px-6">NO EXCUSES</span>
          <span className="px-6">—</span>
          <span className="px-6 text-[#FF4F00]" style={{ WebkitTextStroke: "2px #111" }}>NO EXCUSES</span>
          <span className="px-6">—</span>
        </Marquee>
      </section>

      {/* Broadsheet Footer */}
      <footer className="bg-[#FF4F00] text-[var(--text-primary)]">
        <div className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <h2 className="fd font-bold text-6xl md:text-8xl leading-[0.85]">Ready for<br />your first<br />mock?</h2>
            </div>
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-5 fm text-sm md:text-base font-semibold uppercase tracking-widest">
                <span className="text-6xl leading-none">
                  <i className="ti ti-arrow-down-right"></i>
                </span>{" "}
                Drop it here. We match within 24h.
              </div>
              <form onSubmit={handleFooterSubmit} className="bg-[var(--bg-primary)] border-[3px] border-[var(--border-default)] p-2.5 flex items-center gap-2 shadow-[10px_10px_0_var(--border-default)]">
                <input 
                  type="text" 
                  value={emailOrGithub}
                  onChange={(e) => setEmailOrGithub(e.target.value)}
                  className="flex-1 bg-transparent px-5 py-5 fm text-base md:text-lg outline-none min-w-0" 
                  placeholder="you@email.com / github handle" 
                  required
                />
                <button type="submit" className="sticker bg-[#111] text-white fd font-bold text-xl md:text-2xl px-8 py-5 border-2 border-[var(--border-default)] shrink-0">Go →</button>
              </form>
              <p className="fm text-xs mt-3">{"// free forever for candidates. partners earn rep."}</p>
            </div>
          </div>
          <div className="mt-14 pt-5 border-t-2 border-[var(--border-default)] flex flex-wrap items-center justify-between gap-4 fm text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <img 
                src="/PairPrep.png" 
                className="w-5 h-5 rounded-md bg-[#111] p-0.5 object-contain" 
                decoding="async" 
                loading="lazy" 
                alt="PairPrep Logo" 
              />
              PairPrep © 2026 — Fail here first.
            </span>
            <div className="flex gap-6">
              <a href="#" className="text-[var(--text-primary)] hover:underline flex items-center gap-1">
                <i className="ti ti-brand-github"></i> GitHub
              </a>
              <Link href="/manifesto" className="text-[var(--text-primary)] hover:underline">Manifesto</Link>
              <Link href="/privacy" className="text-[var(--text-primary)] hover:underline">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
