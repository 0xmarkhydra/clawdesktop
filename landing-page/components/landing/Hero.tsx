"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("fade-in-up");
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 bg-cosmic-speckles">
      {/* Grid background – OpenClaw teal/coral */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(95,217,203,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(95,217,203,0.4) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      {/* Ambient glows like openclaw.ai – coral left, teal right */}
      <div className="pointer-events-none absolute -top-40 -left-20 size-[28rem] rounded-full bg-neon-purple opacity-[0.12] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-20 -right-20 h-80 w-80 rounded-full bg-neon-green opacity-[0.12] blur-3xl" aria-hidden="true" />

      <div ref={ref} className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 fade-in-up">
        {/* Logo – lobster icon centered, prominent like OpenClaw Việt Nam */}
        <div className="mb-6 flex justify-center">
          <img
            src="/logo.svg"
            alt=""
            className="h-16 w-16 drop-shadow-[0_0_24px_rgba(255,77,77,0.35)] sm:h-20 sm:w-20"
            width={80}
            height={80}
            aria-hidden
          />
        </div>

        {/* Main title – gradient coral → peach/orange */}
        <h1
          className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{
            background: "linear-gradient(90deg, #ff4d4d 0%, #f97316 50%, #fb923c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          OpenClaw Desktop
        </h1>

        {/* Tagline – coral, smaller weight */}
        <p className="mt-3 text-sm font-medium tracking-wide text-[#ff4d4d] sm:text-base">
          TRỢ LÝ AI TỰ CHỦ CHO NGƯỜI VIỆT
        </p>

        {/* Badge */}
        <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#ff4d4d]/30 bg-[#ff4d4d]/10 px-4 py-2 text-sm font-medium">
          <span
            className="bg-clip-text font-semibold text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ff4d4d 0%, #991b1b 100%)" }}
          >
            Hàng nghìn người Việt đang dùng mỗi ngày
          </span>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Chạy trên máy của bạn. Dữ liệu thuộc về bạn.
          <br />
          4000+ kỹ năng. Hoàn toàn miễn phí và mã nguồn mở.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#pricing"
            className="flex items-center gap-2 rounded-full bg-neon-purple px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(229,95,77,0.5)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Tải ngay miễn phí (Windows/Mac)
          </Link>
          <Link
            href="#demo"
            className="flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:border-neon-purple hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Xem demo 60 giây
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-4 border-t border-border pt-10 sm:gap-8">
          {[
            { value: "3 phút", label: "Thời gian cài đặt" },
            { value: "10,000+", label: "Người dùng VN" },
            { value: "100+", label: "Skill sẵn dùng" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold neon-green sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Demo placeholder */}
        <div id="demo" className="mt-14 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-neon-green" />
            <span className="ml-2 text-xs text-muted-foreground">ClawX Desktop VN – demo.mp4</span>
          </div>
          <div className="relative flex aspect-video items-center justify-center bg-surface-2">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-green/50 bg-neon-green/10 transition-transform hover:scale-105 cursor-pointer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 neon-green" aria-hidden="true">
                  <path d="M6 4.5v15l12-7.5L6 4.5Z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Video demo: Cài OpenClaw trong 3 phút</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
