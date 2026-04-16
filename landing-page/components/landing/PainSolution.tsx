"use client";

import { useEffect, useRef } from "react";

const before = [
  "Mở terminal, gõ lệnh npm install... rồi lỗi ngay",
  "Không biết Python là gì, cài gì trước cài gì sau",
  "Mất cả buổi chiều vẫn chưa chạy được",
  "Đọc docs tiếng Anh nhức đầu, bỏ cuộc",
];

const after = [
  "Nhắn Zalo nhận bản cài – bấm cài xong, giao diện tiếng Việt 100%",
  "Kéo-thả skill, không cần biết code",
  "3 phút là chạy được, dùng ngay",
  "Hướng dẫn tiếng Việt đầy đủ, có support 24/7",
];

export default function PainSolution() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { entry.target.classList.add("fade-in-up"); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="opacity-0">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-neon-purple">Trước & Sau khi dùng ClawDesktop</span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
              Bạn có đang gặp{" "}
              <span className="neon-purple">vấn đề này</span> với OpenClaw không?
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Before */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-red-400" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-400">TRƯỚC đây...</h3>
              </div>
              <ul className="space-y-4">
                {before.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 text-red-500">✗</span>
                    <span className="text-sm leading-relaxed text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-neon-green/20 bg-neon-green/5 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-green/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-neon-green" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold neon-green">SAU khi dùng ClawDesktop</h3>
              </div>
              <ul className="space-y-4">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 neon-green">✓</span>
                    <span className="text-sm leading-relaxed text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
