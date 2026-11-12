import { useState, useEffect, type ReactNode } from "react";
import { useLocation, useNavigate, Link, Outlet, Navigate } from "react-router-dom";
import {
  X,
  Menu,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
  Shield,
  Laptop,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tag } from "@/components/ui/Tag";
import { UniversalSearchModal } from "@/components/common/UniversalSearchModal";
import { MAIN_NAVIGATION, ADMIN_NAVIGATION, AI_TOOLS_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/useNotificationStore";

export interface PrivateLayoutProps {
  children?: ReactNode;
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggleTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount } = useNotificationStore();

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setUniversalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate(ROUTES.LOGIN);
    }
  };

  // Strict Enterprise Authentication & Email Verification Guard
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (!user.emailVerified) {
    return (
      <Navigate
        to={`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(user.email)}`}
        replace
      />
    );
  }

  const isFullPage =
    location.pathname === ROUTES.KNOWLEDGE_GRAPH ||
    location.pathname === ROUTES.AI_TUTOR ||
    location.pathname === ROUTES.QUIZ;

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={universalSearchOpen}
        onClose={() => setUniversalSearchOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="side-logo">
          <Logo asLink={false} />
          <button onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
            <X />
          </button>
        </div>
        <nav>
          <label>LEARN</label>
          {MAIN_NAVIGATION.map(({ label, path, icon: Icon, badge }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                className={isActive ? "active" : ""}
                onClick={() => {
                  navigate(path);
                  setMobileOpen(false);
                }}
              >
                <Icon />
                <span>{label}</span>
                {badge && <Tag>{badge}</Tag>}
              </button>
            );
          })}
          <label>AI STUDIOS</label>
          {AI_TOOLS_NAVIGATION.map(({ label, path, icon: Icon, badge }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                className={isActive ? "active" : ""}
                onClick={() => {
                  navigate(path);
                  setMobileOpen(false);
                }}
              >
                <Icon />
                <span>{label}</span>
                {badge && <Tag>{badge}</Tag>}
              </button>
            );
          })}
          <label>MANAGE</label>
          {ADMIN_NAVIGATION.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                className={isActive ? "active" : ""}
                onClick={() => {
                  navigate(path);
                  setMobileOpen(false);
                }}
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="upgrade-card">
          <span>
            <Sparkles />
          </span>
          <strong>Unlock your full graph</strong>
          <p>Get unlimited AI tutoring and advanced analytics.</p>
          <button onClick={() => navigate(ROUTES.SETTINGS)}>
            Explore Pro <ArrowRight />
          </button>
        </div>

        {/* Sidebar Profile & Sign Out Bar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 mt-auto">
          <button
            className="side-profile flex-1 text-left"
            onClick={() => {
              navigate(ROUTES.PROFILE);
              setMobileOpen(false);
            }}
          >
            <span>
              {user?.initials || "AM"}
              <i />
            </span>
            <div>
              <strong>{user?.name || "Alex Morgan"}</strong>
              <small>{user?.educationLevel || "Student"} · Lv {user?.level || 18}</small>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close mobile navigation overlay"
        />
      )}

      <div className="app-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile navigation"
          >
            <Menu />
          </button>

          <div
            onClick={() => setUniversalSearchOpen(true)}
            className="flex-1 max-w-md cursor-pointer"
          >
            <SearchBar
              variant="global"
              placeholder="Search anything (Cmd+K / Ctrl+K)..."
              readOnly
              onClick={() => setUniversalSearchOpen(true)}
            />
          </div>

          <div className="top-actions relative">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun /> : <Moon />}
            </button>
            <button
              className="top-notification"
              onClick={() => navigate(ROUTES.NOTIFICATIONS)}
              aria-label="View notifications"
            >
              <Bell />
              {unreadCount > 0 && <i />}
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                className="top-avatar"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="View user profile menu"
              >
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "ST"}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 text-xs space-y-1 animate-fadeIn"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                    <Tag tone="indigo" className="mt-1.5">
                      {user?.emailVerified ? "Verified" : "Pending"} {user?.role || "Student"}
                    </Tag>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(ROUTES.PROFILE);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <UserIcon size={14} /> My Profile & Goals
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(ROUTES.SETTINGS);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Settings size={14} /> Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(ROUTES.ACTIVE_SESSIONS);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Laptop size={14} /> Active Sessions
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={isFullPage ? "full-page" : ""}>
          {children || <Outlet />}
        </main>
      </div>

      <button
        className="floating-settings"
        onClick={() => navigate(ROUTES.SETTINGS)}
        aria-label="Open settings"
      >
        <Settings />
      </button>
    </div>
  );
}
