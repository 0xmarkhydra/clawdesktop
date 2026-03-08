"use client";

import { useEffect, useRef } from "react";

const packs = [
  {
    emoji: "💬",
    name: "Zalo OA Auto-Reply",
    desc: "Tự động trả lời tin nhắn Zalo OA theo kịch bản, 24/7 không nghỉ. Phân loại khách hàng thông minh.",
    hot: true,
  },
  {
    emoji: "🛒",
    name: "Shopee / Lazada Comment",
    desc: "Tự động like, trả lời bình luận sản phẩm, tăng tương tác và xếp hạng shop.",
    hot: true,
  },
  {
    emoji: "🏦",
    name: "Check Số Dư Ngân Hàng",
    desc: "Tự động kiểm tra số dư VCB, MB, Techcombank và thông báo giao dịch mới qua Zalo.",
    hot: false,
  },
  {
    emoji: "📝",
    name: "Đăng Bài Tự Động",
    desc: "Lên lịch và đăng bài tự động lên Facebook, Zalo, Shopee Feed cùng lúc theo giờ.",
    hot: false,
  },
  {
    emoji: "📦",
    name: "Quản Lý Đơn Hàng",
    desc: "Tổng hợp đơn hàng từ Shopee, Lazada, TikTok Shop vào một bảng duy nhất. Tự cập nhật trạng thái.",
    hot: false,
  },
  {
    emoji: "🤖",
    name: "Chatbot AI Tư Vấn",
    desc: "Chatbot AI trả lời tư vấn sản phẩm tự động, có thể tuỳ chỉnh kịch bản theo ngành hàng.",
    hot: true,
  },
  {
    emoji: "📊",
    name: "Báo Cáo Doanh Thu",
    desc: "Tự tổng hợp và gửi báo cáo doanh thu hàng ngày/tuần về Zalo cá nhân của bạn.",
    hot: false,
  },
  {
    emoji: "🔔",
    name: "Cảnh Báo Tồn Kho",
    desc: "Tự động cảnh báo khi hàng sắp hết, kết nối Shopee/Lazada để cập nhật số lượng.",
    hot: false,
  },
];

export default function VietnamPack() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const cards = ref.current?.querySelectorAll(".pack-card");
          cards?.forEach((card, i) => {
            setTimeout(() => card.classList.add("fade-in-up"), i * 70);
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
    <section id="vietnam-pack" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest neon-green">Skill</span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
            Skill thiết thực – Zalo, Shopee, ngân hàng...
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Cho freelancer, chủ shop và kinh doanh online. Dùng ngay, không cần cấu hình.
          </p>
        </div>

        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <div
              key={pack.name}
              className="pack-card opacity-0 relative rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-neon-green/40 hover:shadow-lg hover:shadow-neon-green/10"
            >
              {pack.hot && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-neon-purple px-2.5 py-0.5 text-xs font-bold text-white">
                  🔥 HOT
                </span>
              )}
              <div className="mb-3 text-3xl" aria-hidden="true">{pack.emoji}</div>
              <h3 className="mb-2 text-sm font-bold text-foreground">{pack.name}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{pack.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-neon-green/20 bg-neon-green/5 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Và còn{" "}
            <span className="font-bold neon-green">100+ skill khác</span> trong kho, cập nhật liên tục. Tất cả người dùng đều dùng được toàn bộ ngay khi phát hành.
          </p>
        </div>
      </div>
    </section>
  );
}
