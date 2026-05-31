"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Layers, Briefcase, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import AuthModal from "./AuthModal";
import { wsManager } from "@/lib/ws-manager";
import { useToastStore } from "@/stores/toast-store";

const links = [
  { href: "/",               label: "Markets",   icon: BarChart2  },
  { href: "/trade/BTC_USDT", label: "Trade",     icon: Layers     },
  { href: "/portfolio",      label: "Portfolio", icon: Briefcase  },
  { href: "/orders",         label: "Orders",    icon: BookOpen   },
];

export default function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const token    = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const pushToast = useToastStore((s) => s.push);

  function logout() {
    wsManager.send({ method: "UNSUBSCRIBE", params: ["balances", "orders", "trades"] });
    wsManager.clearPrivateSubscriptions();
    setToken(null);
    pushToast({ title: "Logged out", description: "Private streams disconnected.", tone: "info" });
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-[var(--border)]"
        style={{ background: "rgba(11,14,17,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black"
              style={{ background: "var(--green)", color: "#0b0e11", letterSpacing: "-0.05em" }}
            >
              EX
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
                ExchangeX
              </div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>Spot Trading</div>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href.replace("/BTC_USDT", ""));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "text-[var(--text)] bg-[var(--panel-3)]"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]"
                  )}
                >
                  <Icon size={14} strokeWidth={2} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {token ? (
              <button
                onClick={logout}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-[var(--muted)]"
                style={{ color: "var(--muted)" }}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="rounded-lg px-4 py-1.5 text-[13px] font-bold transition-opacity hover:opacity-80"
                style={{ background: "var(--green)", color: "#0b0e11" }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}