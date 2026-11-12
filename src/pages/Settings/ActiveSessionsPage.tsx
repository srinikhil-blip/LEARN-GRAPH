import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  LogOut,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/api/auth";
import type { UserSession } from "@/types/auth";

export function ActiveSessionsPage() {
  const navigate = useNavigate();
  const { user, logout, logoutAll } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    authApi.getSessions().then((sess) => {
      setSessions(sess);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [user?.id]);

  const handleRevokeSingle = async (sessionId: string) => {
    if (!user) return;
    await authApi.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActionMessage("Session revoked successfully.");
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleLogoutAllDevices = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to log out from all devices? You will need to sign in again.")) {
      await logoutAll();
      navigate(ROUTES.LOGIN);
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone size={18} className="text-emerald-500" />;
    if (type === "tablet") return <Tablet size={18} className="text-amber-500" />;
    return <Laptop size={18} className="text-indigo-500" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="py-1 px-2.5 text-xs"
          onClick={() => navigate(ROUTES.SETTINGS)}
        >
          <ArrowLeft size={13} /> Back to Settings
        </Button>
      </div>

      <PageHeader
        eyebrow="ACCOUNT SECURITY & SESSIONS"
        title="Active Devices & Session Management"
        description="Monitor every active device logged into your personal LearnGraph account. Revoke unauthorized access instantly."
        action={
          <Button
            className="py-1.5 px-3 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5"
            onClick={handleLogoutAllDevices}
          >
            <LogOut size={14} /> Log Out All Devices
          </Button>
        }
      />

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Security Status Card */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Enterprise Session Security Active</h3>
            <p className="text-xs text-[var(--muted)]">
              JWT tokens are rotated automatically. Inactive sessions expire after 14 days of inactivity.
            </p>
          </div>
        </div>
        <Tag tone="emerald">Protected & Verified</Tag>
      </div>

      {/* Active Sessions List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Signed In Devices ({sessions.length})
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">Loading active sessions...</div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-[var(--soft)] border border-[var(--line)]">
                  {getDeviceIcon(sess.deviceType)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">{sess.deviceName}</h4>
                    {sess.isCurrent && <Tag tone="indigo">Current Session</Tag>}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {sess.location} · {sess.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Last active: {sess.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent ? (
                <Button
                  variant="secondary"
                  className="py-1 px-3 text-xs text-red-600 hover:bg-red-500/10"
                  onClick={() => handleRevokeSingle(sess.id)}
                >
                  Revoke Access
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="py-1 px-3 text-xs"
                  onClick={() => logout().then(() => navigate(ROUTES.LOGIN))}
                >
                  Log Out This Device
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActiveSessionsPage;
