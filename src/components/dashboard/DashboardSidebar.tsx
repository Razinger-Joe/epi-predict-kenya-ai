import { useState, useEffect, useCallback } from "react";
import { Home, Calendar, Bell, BarChart3, Map, Settings, HelpCircle, LogOut, Activity, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Predictions", url: "/dashboard/predictions", icon: Calendar },
  { title: "Alerts", url: "/dashboard/alerts", icon: Bell, badge: "3" },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Counties", url: "/dashboard/counties", icon: Map },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

/* ------------------------------------------------------------------ */
/*  Shared nav list — used by both desktop sidebar and mobile drawer  */
/* ------------------------------------------------------------------ */
function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <Link
            key={item.title}
            to={item.url}
            onClick={onNavigate}
            className={`
              group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative
              min-h-[48px]
              ${isActive
                ? "text-primary bg-[var(--nav-active-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "text-muted-foreground hover:text-foreground hover:bg-[var(--hover-bg)]"
              }
            `}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
            )}

            <item.icon className={`w-[18px] h-[18px] transition-all duration-200 ${isActive
              ? "text-primary drop-shadow-[0_0_6px_var(--glow-accent)]"
              : "group-hover:rotate-[5deg]"
              }`} />

            <span className="flex-1">{item.title}</span>

            {item.badge && (
              <span className="badge-critical text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full leading-none">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar footer — user profile + help/logout                       */
/* ------------------------------------------------------------------ */
function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="p-4 border-t border-border space-y-3">
      <Link
        to="#"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-[var(--hover-bg)] transition-all min-h-[48px]"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Help & Support</span>
      </Link>
      <Link
        to="/login"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive/80 hover:text-destructive rounded-xl hover:bg-destructive/5 transition-all min-h-[48px]"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </Link>

      {/* User profile */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--hover-bg)] border border-border">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-primary-foreground">
            KH
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-status-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Kenyatta National</p>
          <p className="text-[10px] text-muted-foreground font-mono">Nairobi County</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo                                                               */
/* ------------------------------------------------------------------ */
function SidebarLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="p-6 border-b border-border">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 group">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-radar-spin" />
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="font-syne text-xl font-bold text-foreground tracking-tight">
          Epi<span className="text-primary">Predict</span>
        </span>
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  MOBILE DRAWER                                                      */
/* ================================================================== */
export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  /* Lock body scroll when drawer is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Close on Escape */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: "fadeInOverlay 200ms ease forwards" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="absolute top-0 left-0 bottom-0 w-[280px] flex flex-col epi-glass-sidebar safe-area-inset"
        style={{ animation: "slideInLeft 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-4 pt-4">
          <SidebarLogo onNavigate={onClose} />
          <button
            onClick={onClose}
            className="p-3 -mr-1 rounded-xl hover:bg-[var(--hover-bg)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <NavItems onNavigate={onClose} />
        </nav>

        <SidebarFooter onNavigate={onClose} />
      </aside>
    </div>
  );
}

/* ================================================================== */
/*  DESKTOP SIDEBAR (unchanged behaviour — hidden on mobile)           */
/* ================================================================== */
export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-[260px] flex-col epi-glass-sidebar border-l-[3px] border-l-primary min-h-screen sticky top-0">
      <SidebarLogo />

      <nav className="flex-1 py-4 px-3 space-y-1">
        <NavItems />
      </nav>

      <SidebarFooter />
    </aside>
  );
}
