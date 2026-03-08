"use client";

import { useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "Chủ shop Shopee",
    location: "TP. HCM",
    avatar: "MT",
    color: "green",
    stars: 5,
    text: 'Trước mình cứ nghĩ AI Desktop khó lắm, toàn cài rồi lỗi. Nhưng ClawDesktop thật sự chỉ 3 phút là xong, giao diện tiếng Việt rất dễ dùng. Giờ mình tự động trả lời comment Shopee 24/7, không cần ngồi canh nữa. Tiết kiệm được ít nhất 2-3 tiếng mỗi ngày!',
  },
  {
    name: "Trần Thị Lan Anh",
    role: "Freelancer Marketing",
    location: "Hà Nội",
    avatar: "LA",
    color: "purple",
    stars: 5,
    text: "Mình không biết code gì hết mà vẫn dùng được. Tính năng kéo-thả tạo workflow rất hay, mình đã tự tạo được quy trình đăng bài tự động lên nhiều nền tảng cùng lúc. Skill cực kỳ thiết thực, nhất là phần Zalo OA auto-reply.",
  },
  {
    name: "Phạm Đức Hùng",
    role: "Kinh doanh online",
    location: "Đà Nẵng",
    avatar: "PH",
    color: "green",
    stars: 5,
    text: "Dùng miễn phí mà đủ tính năng mình cần. Support cũng nhiệt tình, hỏi là được giải đáp ngay trong nhóm Zalo. Recommend cho tất cả mọi người đang kinh doanh online ở Việt Nam!",
  },
  {
    name: "Lê Thị Bích Ngọc",
    role: "Chủ cửa hàng thời trang",
    location: "Cần Thơ",
    avatar: "BN",
    color: "purple",
    stars: 5,
    text: "Skill check số dư ngân hàng và quản lý đơn hàng tiết kiệm cho mình rất nhiều thời gian. Trước hay bỏ lỡ đơn vì không check kịp, giờ tự động hoàn toàn rồi. Rất hài lòng với ClawDesktop!",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const cards = ref.current?.querySelectorAll(".test-card");
          cards?.forEach((card, i) => {
            setTimeout(() => card.classList.add("fade-in-up"), i * 100);
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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest neon-green">Người dùng nói gì</span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
            Hàng nghìn người Việt đã{" "}
            <span className="neon-green">tin dùng</span>
          </h2>
        </div>

        <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={`test-card opacity-0 flex flex-col rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-1 ${
                t.color === "green" ? "border-neon-green/20" : "border-neon-purple/20"
              }`}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5" aria-label="5 sao">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{`"${t.text}"`}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    t.color === "green"
                      ? "bg-neon-green/20 text-neon-green"
                      : "bg-neon-purple/20 text-accent"
                  }`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
