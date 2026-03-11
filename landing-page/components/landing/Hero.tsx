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
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          {/* Platform download buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* macOS – active */}
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL}/upload/clawdesktop-mac`}
              prefetch={false}
              className="flex items-center gap-2 rounded-full bg-neon-purple px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(229,95,77,0.5)]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              macOS
            </Link>

            {/* Windows – coming soon */}
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-full border border-border/40 bg-surface px-7 py-3 text-sm font-bold text-muted-foreground/50"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Windows · Sắp có
            </button>

            {/* Linux – coming soon */}
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-full border border-border/40 bg-surface px-7 py-3 text-sm font-bold text-muted-foreground/50"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00.11.135 9.056 9.056 0 01-1.45 1.47 2.986 2.986 0 00-.977 1.57 4.038 4.038 0 00.15 2.27c.267.852.787 1.566 1.388 2.057.601.491 1.27.764 1.952.764h.069c.525 0 1.053-.113 1.556-.335a5.39 5.39 0 001.305-.797c.24-.198.46-.415.657-.644.358.257.755.479 1.174.647.9.367 1.983.526 3.056.526 1.073 0 2.154-.159 3.056-.526a6.152 6.152 0 001.174-.647c.197.229.416.446.657.644.402.332.843.596 1.305.797.503.222 1.031.335 1.556.335h.069c.682 0 1.351-.273 1.952-.764.601-.491 1.121-1.205 1.388-2.057a4.038 4.038 0 00.15-2.27 2.986 2.986 0 00-.977-1.57 9.056 9.056 0 01-1.45-1.47.424.424 0 00.11-.135c.123-.805-.009-1.657-.287-2.489-.589-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491.956-5.965-3.27-6.298A6.843 6.843 0 0012.504 0z" />
              </svg>
              Linux · Sắp có
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px w-14 bg-border" />
            <span className="text-xs text-muted-foreground">hoặc dùng ngay</span>
            <div className="h-px w-14 bg-border" />
          </div>

          {/* Web + Demo row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://app.clawdesktop.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-neon-green/50 bg-neon-green/10 px-7 py-3 text-sm font-bold text-neon-green transition-all hover:bg-neon-green/20 hover:shadow-[0_0_20px_rgba(95,217,203,0.3)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Truy cập Web – không cần cài đặt
            </Link>
            <Link
              href="#demo"
              className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-neon-purple hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Xem demo
            </Link>
          </div>
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
          <div className="relative aspect-video w-full bg-surface-2">
            <iframe
              src="https://www.youtube.com/embed/CzgC3ANieqA?si=YnbydZfpU5wPapws"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full rounded-b-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
