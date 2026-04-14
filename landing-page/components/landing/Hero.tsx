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
            Hơn 10,000 người Việt đang dùng mỗi ngày
          </span>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Chạy trên máy của bạn. Dữ liệu thuộc về bạn.
          <br />
          100+ kỹ năng. Hoàn toàn miễn phí và mã nguồn mở.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="https://app.clawdesktop.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-neon-purple px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(229,95,77,0.4)]"
          >
            Tải miễn phí ngay
          </Link>
          <Link
            href="https://zalo.me/0912205001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-all hover:border-[#0068FF]/50 hover:text-[#0068FF]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.149 0 11.5c0 3.23 1.342 6.147 3.498 8.254L2.25 24l4.498-1.498A11.88 11.88 0 0 0 12 23c6.627 0 12-5.149 12-11.5S18.627 0 12 0zm0 21c-1.698 0-3.296-.426-4.686-1.176l-3.314 1.1 1.068-3.198A9.47 9.47 0 0 1 2.5 11.5C2.5 6.253 6.71 2 12 2s9.5 4.253 9.5 9.5S17.29 21 12 21z" />
            </svg>
            Nhắn Zalo tư vấn
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
          <div className="relative aspect-video w-full bg-surface-2">
            <iframe
              src="https://www.youtube.com/embed/CzgC3ANieqA?si=YnbydZfpU5wPapws&autoplay=1&mute=1&playsinline=1"
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
