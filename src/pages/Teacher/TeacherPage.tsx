import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { SparkChart } from "@/components/common/SparkChart";
import { MiniGraph } from "@/components/common/MiniGraph";
import {
  MOCK_TEACHER_STATS,
  MOCK_TEACHER_REPORT,
  MOCK_STUDENT_PERFORMANCE,
} from "@/mock/teacher.mock";
import { ROUTES } from "@/constants/routes";

export function TeacherPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredStudents = MOCK_STUDENT_PERFORMANCE.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        eyebrow="TEACHER STUDIO"
        title="Calculus II · Section A"
        description="32 students · Spring semester · Last synced 4 minutes ago"
        action={
          <>
            <Button variant="secondary">
              <Upload size={15} /> Upload assignment
            </Button>
            <Button onClick={() => navigate(ROUTES.QUIZ)}>
              <Plus size={15} /> Create quiz
            </Button>
          </>
        }
      />

      <div className="stat-grid teacher-stats">
        <article className="stat-card">
          <small>CLASS MASTERY</small>
          <h3>
            {MOCK_TEACHER_STATS.classMastery}<span>%</span>
          </h3>
          <Progress value={MOCK_TEACHER_STATS.classMastery} />
          <p>{MOCK_TEACHER_STATS.classMasteryDelta}</p>
        </article>

        <article className="stat-card">
          <small>ACTIVE THIS WEEK</small>
          <h3>
            {MOCK_TEACHER_STATS.activeStudents}<span> / {MOCK_TEACHER_STATS.totalStudents}</span>
          </h3>
          <SparkChart color="cyan" />
        </article>

        <article className="stat-card">
          <small>AT-RISK STUDENTS</small>
          <h3>{MOCK_TEACHER_STATS.atRiskCount}</h3>
          <p className="danger-text">Needs your attention</p>
        </article>

        <article className="stat-card">
          <small>ASSIGNMENT AVG.</small>
          <h3>
            {MOCK_TEACHER_STATS.assignmentAvg}<span>%</span>
          </h3>
          <p>Last 5 assignments</p>
        </article>
      </div>

      <div className="teacher-grid">
        <article className="panel class-graph">
          <div className="panel-title">
            <div>
              <span className="eyebrow">CLASS KNOWLEDGE GRAPH</span>
              <h2>Where the class stands</h2>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
            >
              Open graph <ArrowRight size={14} />
            </Button>
          </div>
          <MiniGraph />
          <div className="teacher-insight">
            <Sparkles />
            <p>
              <strong>AI insight:</strong> {MOCK_TEACHER_REPORT.aiInsight}
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">AI REPORT</span>
              <h2>This week’s pulse</h2>
            </div>
          </div>
          <div className="report-score">
            <span>{MOCK_TEACHER_REPORT.scoreGrade}</span>
            <div>
              <strong>{MOCK_TEACHER_REPORT.summary}</strong>
              <p>{MOCK_TEACHER_REPORT.momentumDelta}</p>
            </div>
          </div>
          {MOCK_TEACHER_REPORT.items.map((x, i) => (
            <div className="report-item" key={x}>
              <i className={`r${i}`} />
              <span>{x}</span>
            </div>
          ))}
          <Button className="wide" variant="secondary">
            Generate full report
          </Button>
        </article>
      </div>

      <article className="panel student-table">
        <div className="panel-title">
          <div>
            <span className="eyebrow">STUDENTS</span>
            <h2>Class performance</h2>
          </div>
          <div className="search-input small">
            <Search />
            <input
              placeholder="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Mastery</th>
              <th>Focus time</th>
              <th>Accuracy</th>
              <th>Last active</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((r, i) => (
              <tr key={r.id}>
                <td>
                  <span className={`table-avatar av${i % 4}`}>
                    {r.initials}
                  </span>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  <Progress value={r.mastery} />
                  <span>{r.mastery}%</span>
                </td>
                <td>{r.focusTime}</td>
                <td>{r.accuracy}</td>
                <td>{r.lastActive}</td>
                <td>
                  <Tag tone={r.status === "On track" ? "emerald" : r.status === "Watch" ? "amber" : "red"}>
                    {r.status}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </>
  );
}

export default TeacherPage;
