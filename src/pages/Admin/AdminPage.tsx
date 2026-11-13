import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  Database,
  Plus,
  Settings,
  Users,
  Layers,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { SparkChart } from "@/components/common/SparkChart";
import {
  MOCK_ADMIN_KPIS,
  MOCK_SYSTEM_HEALTH,
  MOCK_USER_GROWTH,
  MOCK_MODEL_CONFIG,
} from "@/mock/admin.mock";
import { CurriculumCMS } from "./CurriculumCMS";

export function AdminPage() {
  const [adminSection, setAdminSection] = useState<"overview" | "curriculum">("overview");

  const iconMap: Record<string, any> = {
    Users,
    BookOpen,
    Database,
    CreditCard,
  };

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Universal Administration & Curriculum CMS"
        description="Monitor learning infrastructure, manage database-driven curricula, and publish new academic syllabus versions."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={adminSection === "overview" ? "primary" : "secondary"}
              onClick={() => setAdminSection("overview")}
              className="gap-1.5 text-xs py-1.5"
            >
              <Activity size={14} /> System Health
            </Button>
            <Button
              variant={adminSection === "curriculum" ? "primary" : "secondary"}
              onClick={() => setAdminSection("curriculum")}
              className="gap-1.5 text-xs py-1.5"
            >
              <Layers size={14} /> Curriculum CMS
            </Button>
          </div>
        }
      />

      {adminSection === "curriculum" ? (
        <CurriculumCMS />
      ) : (
        <>
          <div className="admin-kpis">
            {MOCK_ADMIN_KPIS.map((kpi, i) => {
              const Icon = iconMap[kpi.iconName] || Users;
              return (
                <article key={kpi.label}>
                  <span className={`stat-icon a${i}`}>
                    <Icon />
                  </span>
                  <div>
                    <small>{kpi.label}</small>
                    <strong>{kpi.value}</strong>
                    <span>{kpi.delta}</span>
                  </div>
                </article>
              );
            })}
          </div>

      <div className="admin-grid">
        <article className="panel chart-panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">PLATFORM ACTIVITY</span>
              <h2>Daily active learners</h2>
            </div>
            <Button variant="secondary">
              30 days <ChevronDown size={13} />
            </Button>
          </div>
          <div className="admin-chart">
            <SparkChart />
            <SparkChart color="cyan" />
          </div>
        </article>

        <article className="panel system-health">
          <div className="panel-title">
            <div>
              <span className="eyebrow">SYSTEM HEALTH</span>
              <h2>All systems operational</h2>
            </div>
            <i />
          </div>
          {MOCK_SYSTEM_HEALTH.map((x) => (
            <div key={x.name}>
              <span>
                <i />
                {x.name}
              </span>
              <strong>{x.uptime}</strong>
            </div>
          ))}
        </article>

        <article className="panel admin-users">
          <div className="panel-title">
            <div>
              <span className="eyebrow">USER GROWTH</span>
              <h2>Community breakdown</h2>
            </div>
          </div>
          {MOCK_USER_GROWTH.map((x) => (
            <div className="admin-user-row" key={x.category}>
              <span>{x.category}</span>
              <strong>{x.count.toLocaleString()}</strong>
              <Progress value={x.percentage} tone={x.tone} />
              <small>{x.percentage}%</small>
            </div>
          ))}
        </article>

        <article className="panel model-settings">
          <div className="panel-title">
            <div>
              <span className="eyebrow">AI MODEL</span>
              <h2>Configuration</h2>
            </div>
            <Tag tone="emerald">
              <i /> {MOCK_MODEL_CONFIG.status}
            </Tag>
          </div>
          <label>
            Default tutor model
            <button>
              {MOCK_MODEL_CONFIG.modelName} <ChevronDown />
            </button>
          </label>
          <label>
            Monthly token budget
            <div>
              <span>
                {MOCK_MODEL_CONFIG.tokenBudgetUsedM}M / {MOCK_MODEL_CONFIG.tokenBudgetTotalM}M
              </span>
              <strong>
                {Math.round(
                  (MOCK_MODEL_CONFIG.tokenBudgetUsedM / MOCK_MODEL_CONFIG.tokenBudgetTotalM) * 100
                )}
                %
              </strong>
            </div>
            <Progress
              value={Math.round(
                (MOCK_MODEL_CONFIG.tokenBudgetUsedM / MOCK_MODEL_CONFIG.tokenBudgetTotalM) * 100
              )}
            />
          </label>
          <Button variant="secondary">
            <Settings size={15} /> Model settings
          </Button>
        </article>
      </div>
    </>
  )}
</>
  );
}

export default AdminPage;
