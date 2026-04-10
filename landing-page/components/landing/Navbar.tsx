"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo – Lobster claw SVG */}
          <Link href="#" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="ClawDesktop" className="h-9 w-9 shrink-0" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight text-openclaw-gradient hidden sm:inline">
              ClawDesktop.vn
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {["Tính năng", "Giá", "Skill"].map((item) => (
              <Link
                key={item}
                href={`#${item === "Tính năng" ? "features" : item === "Giá" ? "pricing" : "vietnam-pack"}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="https://zalo.me/0912205001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:border-neon-purple hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.305A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
              </svg>
              Liên hệ Zalo
            </Link>
            <Link
              href="https://zalo.me/0912205001"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-neon-purple px-4 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-[0_0_16px_rgba(229,95,77,0.5)]"
            >
              Dùng thử ngay
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-md p-2 text-muted-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {[
              { label: "Tính năng", href: "#features" },
              { label: "Giá", href: "#pricing" },
              { label: "Skill", href: "#vietnam-pack" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="https://zalo.me/0912205001" target="_blank" rel="noopener noreferrer" className="w-full rounded-full border border-border py-2 text-center text-sm text-foreground">
                Liên hệ Zalo
              </Link>
              <Link href="https://zalo.me/0912205001" target="_blank" rel="noopener noreferrer" className="w-full rounded-full bg-neon-purple py-2 text-center text-sm font-semibold text-white">
                Dùng thử ngay
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
