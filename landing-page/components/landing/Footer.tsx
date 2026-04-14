import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      {/* CTA Banner */}
      <div className="border-b border-border bg-neon-purple/5 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Bắt đầu ngay –{" "}
            <span className="neon-purple">miễn phí hoàn toàn</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tải về, cài 3 phút, dùng ngay. Không cần thẻ tín dụng, không cần đăng ký.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="https://app.clawdesktop.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-neon-purple px-8 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(229,95,77,0.4)] sm:w-auto"
            >
              Tải miễn phí ngay
            </Link>
            <Link
              href="https://zalo.me/0912205001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-border px-8 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-neon-purple hover:text-accent sm:w-auto"
            >
              Nhắn Zalo tư vấn
            </Link>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="OpenClaw" className="h-8 w-8 shrink-0" width={32} height={32} />
              <span className="text-base font-bold text-openclaw-gradient">
                ClawDesktop.vn
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Phiên bản Desktop tiếng Việt của OpenClaw. Dành cho người Việt, bởi người Việt.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="https://github.com/openclaw/openclaw"
                target="_blank"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-neon-green/50 hover:text-neon-green"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
              </Link>
              <Link
                href="https://zalo.me/0912205001"
                target="_blank"
                aria-label="Zalo OA"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-neon-green/50 hover:text-neon-green"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.305A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Sản phẩm</h3>
            <ul className="space-y-2">
              {[
                { label: "Tính năng", href: "#features" },
                { label: "Skill", href: "#vietnam-pack" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Hỗ trợ</h3>
            <ul className="space-y-2">
              {[
                { label: "FAQ", href: "#faq" },
                { label: "Cộng đồng Zalo", href: "https://zalo.me/0912205001" },
                { label: "Cập nhật mới", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Pháp lý</h3>
            <ul className="space-y-2">
              {[
                { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" },
                { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
                { label: "Chính sách hoàn tiền", href: "/chinh-sach-hoan-tien" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>
            © 2026 ClawDesktop.vn – All rights reserved. Dựa trên OpenClaw open-source. Sản phẩm của{" "}
            <Link href="https://www.lynxsolution.vn/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Lynx
            </Link>
            .
          </p>
          <p className="flex items-center gap-1">
            Made with{" "}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500" aria-label="tình yêu">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>{" "}
            cho người Việt
          </p>
        </div>
      </div>
    </footer>
  );
}
