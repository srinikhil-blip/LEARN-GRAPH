import { useState } from "react";
import {
  Compass,
  Play,
  BookOpen,
  FileText,
  Code2,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Clock,
  Target,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { aiFeaturesApi } from "@/api/aiFeatures";
import type { LearningPathRecommendationOutput } from "@/types/aiFeatures";

interface LearningPathRecommenderProps {
  initialProgress?: number;
  initialWeakConcepts?: string[];
  onBack?: () => void;
}

export function LearningPathRecommender({
  initialProgress = 68,
  initialWeakConcepts = ["Edge Relaxation", "Limits & Continuity"],
  onBack,
}: LearningPathRecommenderProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [weakConcepts, setWeakConcepts] = useState<string[]>(initialWeakConcepts);
  const [isLoading, setIsLoading] = useState(false);
  const [pathData, setPathData] = useState<LearningPathRecommendationOutput | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [copied, setCopied] = useState(false);

  const handleRecommend = async () => {
    setIsLoading(true);
    try {
      const data = await aiFeaturesApi.recommendLearningPath({
        studentProgress: progress,
        weakConcepts,
        completedLessons: ["Graph Representations", "BFS & DFS Foundations"],
        quizScores: [
          { topic: "Graph Traversal", score: 85 },
          { topic: "Shortest Paths", score: 46 },
        ],
      });
      setPathData(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/25">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Cognitive Pathfinding
              </span>
              <Tag tone="cyan">Graph-Informed</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Next Learning Path Recommender
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          {pathData && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
              <button
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "visual" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Structured Path
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "json" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Output JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inputs Strip */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>Student Curriculum Progress: <strong>{progress}%</strong></span>
            <span className="text-cyan-600 font-bold">Knowledge Frontier: Next Steps</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-cyan-600"
          />
        </div>

        <Button
          variant="primary"
          className="shrink-0 py-2.5 px-4 text-xs shadow-md shadow-cyan-600/20 gap-2"
          onClick={handleRecommend}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Traversing Graph...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Generate Next Learning Path
            </>
          )}
        </Button>
      </div>

      {/* Main Results */}
      {!pathData && !isLoading && (
        <div className="h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <Target size={30} className="text-cyan-600 mb-2" />
          <h3 className="text-sm font-bold">Ready to Calculate Next Frontier</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Click <strong>"Generate Next Learning Path"</strong> to discover concepts, videos, readings, practice, and hands-on projects with detailed architectural rationales.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={handleRecommend}>
            Run Pathfinding Engine
          </Button>
        </div>
      )}

      {pathData && !isLoading && (
        <>
          {activeTab === "visual" ? (
            <div className="flex flex-col gap-6">
              {/* Architecture Why-Banner */}
              <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-900 dark:text-cyan-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                    <ShieldCheck size={16} /> Architectural Recommendation Rationale
                  </span>
                  <div className="flex items-center gap-2">
                    <Tag tone="cyan">{(pathData.confidenceScore * 100).toFixed(0)}% Confidence</Tag>
                    <span className="flex items-center gap-1 text-[var(--muted)]">
                      <Clock size={12} /> {pathData.estimatedTotalLearningTime}
                    </span>
                  </div>
                </div>
                <p className="leading-relaxed">{pathData.whySummary}</p>
              </div>

              {/* Next Concepts Sequence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
                  <span>RECOMMENDED CONCEPTS SEQUENCE</span>
                  <span>GRAPH TOPOLOGY: DAG ORDERED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pathData.nextConcepts.map((nc, idx) => (
                    <div
                      key={nc.name}
                      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <Tag tone={nc.urgency === "High" ? "red" : nc.urgency === "Next Frontier" ? "purple" : "blue"}>
                            {nc.urgency}
                          </Tag>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--foreground)]">{nc.name}</h4>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-1 leading-relaxed">
                          {nc.rationale}
                        </p>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                        <Clock size={11} /> {nc.estimatedMinutes} mins estimated
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Modal Resources (Videos, Books, Articles, Problems, Projects) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Videos */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-wider">
                    <Play size={14} className="text-red-500" /> Recommended Videos
                  </h4>
                  {pathData.videos.map((v) => (
                    <div key={v.title} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-xs text-[var(--foreground)]">{v.title}</strong>
                        <span className="text-[10px] text-[var(--muted)] shrink-0">{v.durationOrPages}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">{v.authorOrSource}</p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium pt-1 border-t border-[var(--line)]/50">
                        {v.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Books & Readings */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen size={14} className="text-amber-500" /> Books & Formal Literature
                  </h4>
                  {pathData.books.map((b) => (
                    <div key={b.title} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-xs text-[var(--foreground)]">{b.title}</strong>
                        <span className="text-[10px] text-[var(--muted)] shrink-0">{b.durationOrPages}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">{b.authorOrSource}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-1 border-t border-[var(--line)]/50">
                        {b.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Practice Problems */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-wider">
                    <Code2 size={14} className="text-emerald-500" /> Targeted Practice Problems
                  </h4>
                  {pathData.practiceProblems.map((p) => (
                    <div key={p.title} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-xs text-[var(--foreground)]">{p.title}</strong>
                        <Tag tone="zinc">{p.difficulty}</Tag>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">{p.authorOrSource}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-[var(--line)]/50">
                        {p.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Hands-On Projects */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-wider">
                    <Briefcase size={14} className="text-purple-500" /> Synthesis Portfolio Project
                  </h4>
                  {pathData.projects.map((proj) => (
                    <div key={proj.title} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-xs text-[var(--foreground)]">{proj.title}</strong>
                        <span className="text-[10px] text-[var(--muted)] shrink-0">{proj.estimatedHours}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 py-1">
                        {proj.technologies.map((t) => (
                          <Tag key={t} tone="purple">{t}</Tag>
                        ))}
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium pt-1 border-t border-[var(--line)]/50">
                        {proj.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* JSON Tab */
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-600">
                  Learning Path Recommendation JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(pathData, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-cyan-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(pathData, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
