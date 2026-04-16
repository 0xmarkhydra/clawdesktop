"use client";

import { useState, useEffect, useRef } from "react";

const faqs = [
  {
    q: "ClawDesktop.vn có liên quan gì đến OpenClaw chính thức không?",
    a: "ClawDesktop.vn là phiên bản desktop không chính thức của OpenClaw, dựa trên OpenClaw official (open-source). Tôi đã Việt hoá toàn bộ giao diện và thêm skill. OpenClaw là dự án open-source và tôi tuân thủ đầy đủ giấy phép.",
  },
  {
    q: "Làm sao để lấy bản cài đặt / dùng thử?",
    a: "Website không còn nút tải công khai. Bạn nhắn Zalo tại zalo.me/0912205001 để xin bản dùng thử; team sẽ hướng dẫn và gửi file cài phù hợp khi phù hợp.",
  },
  {
    q: "Tôi cần có kiến thức kỹ thuật gì để cài không?",
    a: "Hoàn toàn không cần! ClawDesktop được thiết kế dành riêng cho người không biết code. Sau khi nhận file cài, chỉ cần bấm cài – như cài bất kỳ phần mềm thông thường nào. Giao diện và hướng dẫn đều bằng tiếng Việt.",
  },
  {
    q: "ClawDesktop có an toàn không? Dữ liệu của tôi có bị lộ không?",
    a: "ClawDesktop chạy hoàn toàn local trên máy tính của bạn – không upload dữ liệu lên server của tôi. API key và thông tin cá nhân được mã hoá ngay trên máy bạn. Tôi không có quyền truy cập vào dữ liệu của bạn.",
  },
  {
    q: "OpenClaw Desktop có mất phí không?",
    a: "Hoàn toàn miễn phí và mã nguồn mở. Không có phí ẩn, không subscription.",
  },
  {
    q: "Skill có những gì và có được cập nhật thêm không?",
    a: "Hiện có 100+ skill cho Zalo OA, Shopee, Lazada, các ngân hàng VN, Facebook, TikTok Shop... và đang được cập nhật liên tục. Tất cả người dùng đều được cập nhật skill mới, không mất phí.",
  },
  {
    q: "Nếu gặp lỗi thì được hỗ trợ như thế nào?",
    a: "Tham gia cộng đồng Zalo tại zalo.me/0912205001 để được hỗ trợ. Phản hồi trong 30 phút trong giờ làm việc.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest neon-purple">FAQ</span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
            Câu hỏi <span className="neon-green">thường gặp</span>
          </h2>
        </div>

        <div ref={ref} className="opacity-0 space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-neon-green/30">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === idx}
              >
                <span className="text-sm font-semibold text-foreground leading-relaxed">{faq.q}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open === idx ? "rotate-180 neon-green" : ""}`}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {open === idx && (
                <div className="border-t border-border px-6 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
