"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, Layers3, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import AuthModal from "./AuthModal";
import { wsManager } from "@/lib/ws-manager";
import { useToastStore } from "@/stores/toast-store";

const links = [
  { href: "/", label: "Markets", icon: BarChart3 },
  { href: "/trade/BTC_USDT", label: "Trade", icon: Layers3 },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/orders", label: "Orders", icon: BriefcaseBusiness },
];

export default function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const pushToast = useToastStore((s) => s.push);

  function logout() {
    wsManager.send({
      method: "UNSUBSCRIBE",
      params: ["balances", "orders", "trades"],
    });
    wsManager.clearPrivateSubscriptions();
    setToken(null);
    pushToast({
      title: "Logged out",
      description: "Private account streams have been disconnected.",
      tone: "info",
    });
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(11,14,17,0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--yellow)] text-black font-bold">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">ExchangeX</div>
              <div className="text-[11px] text-[var(--muted)]">Spot Trading</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
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
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-[var(--panel-3)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}

            {token ? (
              <button
                onClick={logout}
                className="rounded-xl bg-[var(--panel-3)] px-3 py-2 text-sm"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-[var(--yellow)] px-3 py-2 text-sm font-semibold text-black"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}