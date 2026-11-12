import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Code2,
  Command,
  Languages,
  LockKeyhole,
  Moon,
  Sun,
  Zap,
  ChevronRight,
  ShieldCheck,
  Laptop,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { useThemeStore } from "@/store/useThemeStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ROUTES } from "@/constants/routes";

function ConnectedAppCard({
  name,
  text,
  color,
}: {
  name: string;
  text: string;
  color: string;
}) {
  return (
    <div className="connected-app">
      <span className={color}>{name[0]}</span>
      <div>
        <strong>{name}</strong>
        <p>{text}</p>
      </div>
      <Button variant="secondary">{text === "Not connected" ? "Connect" : "Manage"}</Button>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { dark, toggleTheme, setDark } = useThemeStore();
  const {
    activeTab,
    setActiveTab,
    settings,
    toggleReduceMotion,
    toggleHighContrast,
    toggleNotificationSetting,
  } = useSettingsStore();

  const [savedMessage, setSavedMessage] = useState(false);

  const tabs = [
    ["Appearance", Sun],
    ["Notifications", Bell],
    ["Privacy & security", LockKeyhole],
    ["Connected apps", Zap],
    ["Language", Languages],
    ["API settings", Code2],
  ];

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <>
      <PageHeader
        eyebrow="ACCOUNT"
        title="Settings"
        description="Manage your experience, privacy, and connected learning tools."
      />

      <div className="settings-layout">
        <aside>
          {tabs.map(([x, Icon]: any) => (
            <button
              key={x}
              className={activeTab === x ? "active" : ""}
              onClick={() => setActiveTab(x)}
            >
              <Icon size={17} />
              {x}
              <ChevronRight size={14} />
            </button>
          ))}
        </aside>

        <section className="settings-panel">
          <h2>{activeTab}</h2>
          <p>Customize how LearnGraph works for you.</p>

          {activeTab === "Appearance" ? (
            <>
              <div className="setting-group">
                <label>Theme</label>
                <div className="theme-options">
                  <button
                    type="button"
                    className={!dark ? "selected" : ""}
                    onClick={() => dark && toggleTheme()}
                  >
                    <span className="theme-preview light">
                      <i />
                      <i />
                      <i />
                    </span>
                    <strong>
                      <Sun /> Light
                    </strong>
                  </button>
                  <button
                    type="button"
                    className={dark ? "selected" : ""}
                    onClick={() => !dark && toggleTheme()}
                  >
                    <span className="theme-preview dark">
                      <i />
                      <i />
                      <i />
                    </span>
                    <strong>
                      <Moon /> Dark
                    </strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDark(false)}
                  >
                    <span className="theme-preview system">
                      <i />
                      <i />
                      <i />
                    </span>
                    <strong>
                      <Command /> System
                    </strong>
                  </button>
                </div>
              </div>

              <div className="setting-row">
                <div>
                  <strong>Reduce motion</strong>
                  <p>Minimize animations and transitions.</p>
                </div>
                <button
                  type="button"
                  className={`switch ${settings.reduceMotion ? "on" : ""}`}
                  onClick={toggleReduceMotion}
                  aria-label="Toggle reduce motion"
                >
                  <i />
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <strong>High contrast</strong>
                  <p>Increase contrast for interface elements.</p>
                </div>
                <button
                  type="button"
                  className={`switch ${settings.highContrast ? "on" : ""}`}
                  onClick={toggleHighContrast}
                  aria-label="Toggle high contrast"
                >
                  <i />
                </button>
              </div>
            </>
          ) : activeTab === "Privacy & security" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Laptop size={18} />
                  </span>
                  <div>
                    <strong className="block text-sm">Active Devices & Sessions</strong>
                    <p className="text-xs text-[var(--muted)]">Manage devices logged into your account and revoke access.</p>
                  </div>
                </div>
                <Button
                  className="py-1 px-3 text-xs"
                  onClick={() => navigate(ROUTES.ACTIVE_SESSIONS)}
                >
                  Manage Sessions <ArrowRight size={13} />
                </Button>
              </div>

              <div className="setting-row">
                <div>
                  <strong>Two-Factor Authentication (2FA)</strong>
                  <p>Require verification code on unrecognized device sign-ins.</p>
                </div>
                <Tag tone="indigo">Enabled (Email)</Tag>
              </div>

              <div className="setting-row">
                <div>
                  <strong>Strict Data Isolation</strong>
                  <p>Your notes, graphs, and chat history are cryptographically segregated.</p>
                </div>
                <Tag tone="emerald">Verified Active</Tag>
              </div>
            </div>
          ) : activeTab === "Connected apps" ? (
            <>
              {settings.connectedApps.map((app) => (
                <ConnectedAppCard
                  key={app.id}
                  name={app.name}
                  text={app.statusText}
                  color={app.color}
                />
              ))}
            </>
          ) : (
            <>
              {[
                ["Study reminders", "studyReminders"],
                ["Weekly progress report", "weeklyProgressReport"],
                ["AI recommendations", "aiRecommendations"],
                ["Course and quiz updates", "courseUpdates"],
              ].map(([label, key]) => {
                const isOn = settings.notifications[key as keyof typeof settings.notifications];
                return (
                  <div className="setting-row" key={label}>
                    <div>
                      <strong>{label}</strong>
                      <p>Control how LearnGraph uses this setting.</p>
                    </div>
                    <button
                      type="button"
                      className={`switch ${isOn ? "on" : ""}`}
                      onClick={() =>
                        toggleNotificationSetting(key as keyof typeof settings.notifications)
                      }
                      aria-label={`Toggle ${label}`}
                    >
                      <i />
                    </button>
                  </div>
                );
              })}
            </>
          )}

          <div className="settings-actions">
            <Button variant="secondary" onClick={() => setActiveTab("Appearance")}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {savedMessage ? "Saved!" : "Save changes"}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

export default SettingsPage;
