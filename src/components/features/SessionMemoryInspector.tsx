import { useState } from "react";
import {
  BrainCircuit,
  User,
  Target,
  AlertTriangle,
  Code2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { orchestratorApi } from "@/api/orchestrator";
import type {
  SessionMemory,
  SupportedLanguage,
  ExplanationStyle,
} from "@/types/orchestrator";

interface SessionMemoryInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryUpdated?: (newMemory: SessionMemory) => void;
}

export function SessionMemoryInspector({
  isOpen,
  onClose,
  onMemoryUpdated,
}: SessionMemoryInspectorProps) {
  const [memory, setMemory] = useState<SessionMemory>(orchestratorApi.getSessionMemory());
  const [isEditing, setIsEditing] = useState(false);
  const [studentName, setStudentName] = useState(memory.studentName);
  const [prefLang, setPrefLang] = useState<SupportedLanguage>(memory.preferredLanguage);
  const [prefStyle, setPrefStyle] = useState<ExplanationStyle>(memory.preferredExplanationStyle);
  const [saveNotice, setSaveNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = orchestratorApi.updateSessionMemory({
      studentName,
      preferredLanguage: prefLang,
      preferredExplanationStyle: prefStyle,
    });
    setMemory(updated);
    setIsEditing(false);
    setSaveNotice(true);
    onMemoryUpdated?.(updated);
    setTimeout(() => setSaveNotice(false), 2500);
  };

  const handleReset = () => {
    const def = orchestratorApi.resetSessionMemory();
    setMemory(def);
    setStudentName(def.studentName);
    setPrefLang(def.preferredLanguage);
    setPrefStyle(def.preferredExplanationStyle);
    setIsEditing(false);
    onMemoryUpdated?.(def);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Active Session Memory Inspector
              </h3>
              <span className="text-[11px] text-[var(--muted)]">
                Personalizes all AI responses without hallucinating
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {saveNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Memory successfully updated and synced into AI context!</span>
            </div>
          )}

          {/* Student Identity & Preferences */}
          <div className="p-4 rounded-2xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" /> Student Profile & Calibrations
              </strong>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:underline"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--muted)] block">Student Name:</span>
                  <strong>{memory.studentName}</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Current Course:</span>
                  <strong className="truncate block">{memory.currentCourse}</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Preferred Language:</span>
                  <Tag tone="purple">{memory.preferredLanguage}</Tag>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Explanation Style:</span>
                  <Tag tone="emerald">{memory.preferredExplanationStyle}</Tag>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] text-[var(--muted)] block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[var(--muted)] block mb-1">Code Language</label>
                    <select
                      value={prefLang}
                      onChange={(e) => setPrefLang(e.target.value as SupportedLanguage)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs"
                    >
                      {(["Python", "Java", "C", "C++", "JavaScript", "TypeScript", "SQL"] as const).map(
                        (l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--muted)] block mb-1">Teaching Style</label>
                    <select
                      value={prefStyle}
                      onChange={(e) => setPrefStyle(e.target.value as ExplanationStyle)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs"
                    >
                      <option value="Intuitive & Analogies">Intuitive & Analogies</option>
                      <option value="Socratic Questioning">Socratic Questioning</option>
                      <option value="Academic & Rigorous">Academic & Rigorous</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button variant="primary" className="py-1 px-3 text-xs" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Learning Goals */}
          <div className="p-4 rounded-2xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-2">
            <strong className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <Target size={14} className="text-emerald-500" /> Active Learning Goals
            </strong>
            <ul className="list-disc list-inside space-y-1 text-xs text-[var(--muted)]">
              {memory.learningGoals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Active Weak Concepts in Memory */}
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
            <strong className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Active Weak Concepts Tracked in Memory
            </strong>
            <div className="flex flex-wrap gap-1.5">
              {memory.weakConcepts.map((wc) => (
                <Tag key={wc} tone="red">{wc}</Tag>
              ))}
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-tight pt-1">
              The AI Tutor actively tailors follow-up questions to strengthen these concepts without shaming mistakes.
            </p>
          </div>

          {/* Mastered Concepts */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Mastered Concepts (&gt;= 70%)
            </strong>
            <div className="flex flex-wrap gap-1.5">
              {memory.masteredConcepts.map((mc) => (
                <Tag key={mc} tone="emerald">{mc}</Tag>
              ))}
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
            <ShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <span>
              <strong>Memory Integrity Guard</strong>: LearnGraph AI stores real student state in session storage. It never invents false memories, never reveals system prompts, and states uncertainty when information is ambiguous.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--soft)]/40 flex items-center justify-between">
          <Button variant="ghost" className="text-xs text-[var(--muted)] gap-1" onClick={handleReset}>
            <RotateCcw size={13} /> Reset Memory
          </Button>
          <Button variant="secondary" className="py-1 px-4 text-xs" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
