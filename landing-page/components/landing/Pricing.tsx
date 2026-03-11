"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Miễn Phí",
    price: "0đ",
    period: "mãi mãi",
    highlight: true,
    badge: null,
    desc: "OpenClaw Desktop hoàn toàn miễn phí – đủ tính năng cho mọi người. Hiện tại hỗ trợ cài đặt trên macOS.",
    features: [
      "Cài đặt 1 click (macOS)",
      "100+ skill (Zalo, Shopee, ngân hàng...)",
      "Skill Builder kéo-thả không giới hạn",
      "Giao diện tiếng Việt 100%",
      "Auto-update tự động",
      "Cộng đồng Zalo hỗ trợ",
      "Skill mới cập nhật liên tục",
    ],
    disabled: [] as string[],
    cta: "Tải ClawDesktop cho macOS",
    ctaStyle: "bg-neon-green text-black font-bold hover:opacity-90 hover:shadow-[0_0_30px_rgba(95,217,203,0.5)]",
    href: `${process.env.NEXT_PUBLIC_API_URL}/upload/clawdesktop-mac`,
  },
];

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const cards = ref.current?.querySelectorAll(".price-card");
          cards?.forEach((card, i) => {
            setTimeout(() => card.classList.add("fade-in-up"), i * 150);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest neon-purple">Tải xuống</span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
            Hoàn toàn <span className="neon-green">miễn phí</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Tải xuống và dùng ngay. Không phí, mã nguồn mở.
          </p>
        </div>

        <div ref={ref} className="mx-auto max-w-md">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`price-card opacity-0 relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlight
                  ? "border-neon-green/50 bg-neon-green/5 shadow-xl shadow-neon-green/10"
                  : "border-border bg-surface"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neon-green px-4 py-1 text-xs font-bold text-black">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? "neon-green" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.desc}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 neon-green" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground/40" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted-foreground/50 line-through">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full rounded-full py-3.5 text-center text-sm transition-all ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
