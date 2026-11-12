import { useState } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  Coffee,
  CheckCircle2,
  Copy,
  CalendarDays,
  Target,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { orchestratorApi } from "@/api/orchestrator";
import type { StudySchedulePayload } from "@/types/orchestrator";

interface StudySchedulePlannerViewProps {
  onBack?: () => void;
}

export function StudySchedulePlannerView({ onBack }: StudySchedulePlannerViewProps) {
  const [examDate, setExamDate] = useState("2026-11-28");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedulePayload, setSchedulePayload] = useState<StudySchedulePayload | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "json">("calendar");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await orchestratorApi.generateStudySchedule({
        examDate,
        hoursPerDay,
        weakConcepts: ["Edge Relaxation in Dijkstra", "Negative Edge Weights"],
        difficulty,
      });
      setSchedulePayload(data);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
            <Calendar size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Cognitive Time Allocation
              </span>
              <Tag tone="emerald">Spaced Repetition & Pomodoro</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Personalized Study Schedule Generator
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          {schedulePayload && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "calendar" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Schedule Timetable
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

      {/* Input Form Controls */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">
            Target Exam Date
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>Available Study Time:</span>
            <span className="font-bold text-emerald-600">{hoursPerDay} hrs/day</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">
            Difficulty Focus
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  difficulty === d
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-[var(--soft)] text-[var(--muted)] border-[var(--line)]"
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full py-2.5 text-xs shadow-md shadow-emerald-600/20 gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Generate Schedule
            </>
          )}
        </Button>
      </div>

      {/* Main Results View */}
      {!schedulePayload && !isGenerating && (
        <div className="h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <CalendarDays size={32} className="text-emerald-600 mb-2" />
          <h3 className="text-sm font-bold">Ready to Formulate Timetable</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Select your exam date and daily commitment to generate Pomodoro blocks, spaced repetition intervals, and mock exam milestones.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={handleGenerate}>
            Generate Sample Schedule
          </Button>
        </div>
      )}

      {schedulePayload && !isGenerating && (
        <>
          {activeTab === "calendar" ? (
            <div className="space-y-6">
              {/* Top Countdown & Milestones Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag tone="emerald">{schedulePayload.daysRemaining} Days to Exam</Tag>
                    <Tag tone="zinc">{schedulePayload.dailyHoursAvailable}h Daily Commitment</Tag>
                  </div>
                  <strong className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Exam Date: {schedulePayload.examDate}
                  </strong>
                </div>

                {/* Progress Checkpoints */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {schedulePayload.progressCheckpoints.map((cp) => (
                    <div key={cp.milestone} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-0.5">
                      <strong className="text-emerald-600 dark:text-emerald-400 block">{cp.milestone}</strong>
                      <span className="text-[10px] text-[var(--muted)]">{cp.criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goals Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedulePayload.weeklyGoals.map((wg) => (
                  <div key={wg.weekNumber} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600">WEEK {wg.weekNumber} GOAL</span>
                      <Tag tone="emerald">{wg.focusArea}</Tag>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {wg.targetConcepts.map((tc) => (
                        <Tag key={tc} tone="zinc">{tc}</Tag>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                      <strong>Target Checkpoint:</strong> {wg.checkpointGoal}
                    </p>
                  </div>
                ))}
              </div>

              {/* Daily Timetable Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--muted)] uppercase">
                  Daily Breakdown & Pomodoro Study Slots
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {schedulePayload.dailyPlan.map((dp) => (
                    <div key={dp.dayNumber} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                        <div>
                          <strong className="text-xs font-bold block">{dp.dayName}</strong>
                          <span className="text-[10px] text-[var(--muted)]">{dp.dateString}</span>
                        </div>
                        <Tag tone="emerald">{dp.totalStudyHours}h</Tag>
                      </div>

                      {/* Study Slots */}
                      <div className="space-y-2">
                        {dp.slots.map((slot, sIdx) => (
                          <div key={sIdx} className="p-2.5 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] text-xs space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono text-emerald-600 font-bold">{slot.timeSlot}</span>
                              <Tag tone="blue">{slot.activityType}</Tag>
                            </div>
                            <strong className="text-[var(--foreground)] block">{slot.topic}</strong>
                            <ul className="list-disc list-inside text-[10px] text-[var(--muted)]">
                              {slot.objectives.map((obj, oIdx) => (
                                <li key={oIdx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Break Schedule */}
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                        <Coffee size={12} className="shrink-0 text-amber-500" />
                        <span>{dp.pomodoroBreakSchedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spaced Revision & Mock Exam Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spaced Revision Intervals */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Timer size={15} className="text-blue-500" /> Spaced Revision Intervals (Ebbinghaus Curve)
                  </h4>
                  <div className="space-y-2 text-xs">
                    {schedulePayload.revisionSchedule.map((rs, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-blue-600">{rs.interval}</strong>
                          <span className="text-[10px] text-[var(--muted)]">{rs.technique}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rs.conceptsToReview.map((c) => (
                            <Tag key={c} tone="zinc">{c}</Tag>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Tests & Break Reminders */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck size={15} className="text-emerald-500" /> Scheduled Mock Assessments
                  </h4>
                  <div className="space-y-2 text-xs">
                    {schedulePayload.mockTests.map((mt, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-[var(--foreground)]">{mt.title}</strong>
                          <Tag tone="emerald">Pass Target: {mt.passTargetScore}%</Tag>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] block">Date: {mt.testDate} · {mt.durationMinutes} mins</span>
                      </div>
                    ))}
                  </div>

                  {/* Health and Break Reminders */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1 mt-2">
                    <strong className="flex items-center gap-1 font-semibold">
                      <Coffee size={13} className="text-amber-500" /> Cognitive Rest & Break Reminders:
                    </strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {schedulePayload.breakReminders.map((br, bIdx) => (
                        <li key={bIdx}>{br}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Output JSON */
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600">
                  Study Schedule Payload JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(schedulePayload, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-emerald-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(schedulePayload, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
