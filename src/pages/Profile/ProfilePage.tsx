import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Flame,
  Network,
  Settings,
  Target,
  Trophy,
  GraduationCap,
  Save,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { SparkChart } from "@/components/common/SparkChart";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { userProgressService, type UserLearningState } from "@/services/userProgressService";
import type { CompetitiveExamTarget, UserEducationTier } from "@/types/auth";

const EXAM_OPTIONS: CompetitiveExamTarget[] = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "GATE CS/AI",
  "UPSC CSE",
  "SSC CGL",
  "Banking / IBPS",
  "CAT",
  "GRE",
  "GMAT",
  "IELTS / TOEFL",
  "FAANG Placement",
  "None",
];

const TIER_OPTIONS: UserEducationTier[] = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Diploma",
  "B.Tech",
  "BCA",
  "B.Sc",
  "MCA",
  "M.Tech",
  "MBA",
  "Lifelong Learner",
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [learningState, setLearningState] = useState<UserLearningState>(() =>
    userProgressService.getState()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setLearningState(userProgressService.getState());
    };
    window.addEventListener("learngraph:progress-updated", handleUpdate);
    return () => {
      window.removeEventListener("learngraph:progress-updated", handleUpdate);
    };
  }, []);

  const [targetExam, setTargetExam] = useState<CompetitiveExamTarget>(
    (user?.targetExam as CompetitiveExamTarget) || "GATE CS/AI"
  );
  const [educationLevel, setEducationLevel] = useState<UserEducationTier>(
    (user?.educationLevel as UserEducationTier) || "B.Tech"
  );
  const [explanationStyle, setExplanationStyle] = useState<
    "Intuitive & Analogies" | "Socratic Questioning" | "Academic & Rigorous"
  >(
    user?.preferences?.preferredExplanationStyle || "Socratic Questioning"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const iconMap: Record<string, any> = {
    Flame,
    BrainCircuit,
    Target,
    Clock3,
  };

  // Real statistics derived dynamically
  const totalLessons = useMemo(() => {
    return Object.values(learningState.completedLessons).reduce(
      (s, l) => s + l.length,
      0
    );
  }, [learningState.completedLessons]);

  const totalQuestions = learningState.quizAttempts.length * 10;
  const avgAccuracy = useMemo(() => {
    if (learningState.quizAttempts.length === 0) return 0;
    const avg =
      learningState.quizAttempts.reduce(
        (acc, q) => acc + (q.score / (q.maxScore || 100)) * 100,
        0
      ) / learningState.quizAttempts.length;
    return Math.round(avg);
  }, [learningState.quizAttempts]);

  const hoursLearned = parseFloat((learningState.studyTimeMinutes / 60).toFixed(1));
  const conceptsMastered = learningState.masteredConcepts.length;

  const handleSaveAcademicGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        targetExam,
        educationLevel,
        preferences: {
          ...(user?.preferences || {
            theme: "light",
            preferredLanguage: "en",
            preferredExplanationStyle: "Socratic Questioning",
            dailyStudyGoalMinutes: 60,
            emailNotifications: true,
          }),
          preferredExplanationStyle: explanationStyle,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LG";

  // Derive top skills from user's actual learning progress or target
  const userSkills = useMemo(() => {
    if (learningState.masteredConcepts.length > 0 || avgAccuracy > 0) {
      return [
        {
          name: "Problem Solving & Analysis",
          percentage: Math.min(100, avgAccuracy > 0 ? avgAccuracy : 40),
        },
        {
          name: targetExam.includes("GATE") || targetExam.includes("B.Tech") ? "Core Engineering" : "Core Subject Mastery",
          percentage: Math.min(100, Math.round(avgAccuracy * 0.9 + totalLessons * 5)),
        },
        {
          name: "Exam Pattern Readiness",
          percentage: Math.min(100, Math.round(avgAccuracy * 0.85 + learningState.quizAttempts.length * 8)),
        },
      ].filter((s) => s.percentage > 0);
    }
    return [];
  }, [learningState, avgAccuracy, targetExam, totalLessons]);

  return (
    <>
      <div className="profile-hero">
        <div className="profile-avatar">
          {initials}
          <span>
            <Check />
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag tone="indigo">LEVEL {user?.level || 1} · {user?.role?.toUpperCase() || "STUDENT"}</Tag>
            <Tag tone={user?.emailVerified ? "emerald" : "amber"}>
              {user?.emailVerified ? "Verified Account" : "Unverified"}
            </Tag>
          </div>
          <h1>{user?.name || "Student"}</h1>
          <p className="text-slate-300 text-xs">
            {user?.email} · {user?.educationLevel || "Undergraduate"} {user?.role || "student"} {user?.institution ? `· ${user.institution}` : ""} · Target:{" "}
            <strong className="text-indigo-400">{user?.targetExam || "GATE CS/AI"}</strong>
          </p>
          <div>
            <span>
              <Flame /> {learningState.streakDays} day streak
            </span>
            <span>
              <Trophy /> {learningState.achievements.length} achievements
            </span>
            <span>
              <Network /> {conceptsMastered} concepts mastered
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(ROUTES.COMPETITIVE_EXAMS)}>
            <GraduationCap size={15} /> Exam Hub
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.SETTINGS)}>
            <Settings size={15} /> Edit profile
          </Button>
        </div>
      </div>

      {/* Academic Goals & Adaptive Configuration Panel */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Target size={16} />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Academic Tier & AI Adaptation Target
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure your curriculum level, target standardized exam, and preferred pedagogical tutoring method.
            </p>
          </div>

          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={14} /> Profile goals updated!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAcademicGoals} className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Education Level / Tier
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as UserEducationTier)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Calibrates standard syllabus & difficulty prerequisites.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Competitive Exam Target
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value as CompetitiveExamTarget)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {EXAM_OPTIONS.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Customizes mock tests, predictive scoring & high-yield topics.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              AI Pedagogical Explanation Style
            </label>
            <select
              value={explanationStyle}
              onChange={(e) => setExplanationStyle(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Intuitive & Analogies">Intuitive & Analogies (Visual learner)</option>
              <option value="Socratic Questioning">Socratic Questioning (Step-by-step guidance)</option>
              <option value="Academic & Rigorous">Academic & Rigorous (Formal proofs & depth)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Guides how the AI Tutor formats hints, proofs, and analogies.
            </p>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={isSaving} className="gap-2">
              <Save size={15} /> {isSaving ? "Saving..." : "Save Learning Goals"}
            </Button>
          </div>
        </form>
      </section>

      <div className="profile-grid">
        {/* Learning Statistics */}
        <article className="panel profile-stats">
          <div className="panel-title">
            <div>
              <span className="eyebrow">LEARNING STATISTICS</span>
              <h2>Your journey so far</h2>
            </div>
          </div>
          <div>
            <span>
              <strong>{hoursLearned}</strong>
              <small>Hours learned</small>
            </span>
            <span>
              <strong>{conceptsMastered}</strong>
              <small>Concepts mastered</small>
            </span>
            <span>
              <strong>{totalQuestions.toLocaleString()}</strong>
              <small>Questions answered</small>
            </span>
            <span>
              <strong>{avgAccuracy}%</strong>
              <small>Average accuracy</small>
            </span>
          </div>
          <SparkChart />
        </article>

        {/* Achievements */}
        <article className="panel achievements">
          <div className="panel-title">
            <div>
              <span className="eyebrow">ACHIEVEMENTS</span>
              <h2>Recent milestones</h2>
            </div>
            <button className="text-button" onClick={() => navigate(ROUTES.COURSES)}>
              Explore
            </button>
          </div>
          {learningState.achievements.length > 0 ? (
            <div>
              {learningState.achievements.map((ach, i) => {
                const Icon = iconMap[ach.icon] || Flame;
                return (
                  <span key={ach.id} className={`badge b${i % 4}`}>
                    <i>
                      <Icon />
                    </i>
                    <strong>{ach.title}</strong>
                    <small>{ach.subtitle}</small>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
              <Trophy size={28} className="mx-auto text-slate-400 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No achievements unlocked yet</p>
              <p className="text-[11px] text-slate-400">Complete lessons and score 80%+ on previous paper quizzes to unlock milestones.</p>
            </div>
          )}
        </article>

        {/* Certificates */}
        <article className="panel certificates">
          <div className="panel-title">
            <div>
              <span className="eyebrow">CERTIFICATES</span>
              <h2>Verified learning</h2>
            </div>
          </div>
          {learningState.certificates.length > 0 ? (
            learningState.certificates.map((cert) => (
              <div key={cert.id}>
                <span>
                  <Award />
                </span>
                <div>
                  <strong>{cert.title}</strong>
                  <small>Issued {cert.issueDate} · Verified</small>
                </div>
                <button aria-label={`View certificate for ${cert.title}`}>
                  <ArrowRight />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
              <Award size={28} className="mx-auto text-slate-400 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No certificates earned yet</p>
              <p className="text-[11px] text-slate-400">Complete all chapters and the final diagnostic test of any course to receive verified credentials.</p>
            </div>
          )}
        </article>

        {/* Top Skills */}
        <article className="panel skill-profile">
          <div className="panel-title">
            <div>
              <span className="eyebrow">TOP SKILLS</span>
              <h2>Knowledge profile</h2>
            </div>
          </div>
          {userSkills.length > 0 ? (
            userSkills.map((skill) => (
              <div className="subject-row" key={skill.name}>
                <span>{skill.name}</span>
                <Progress value={skill.percentage} />
                <strong>{skill.percentage}%</strong>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
              <BrainCircuit size={28} className="mx-auto text-slate-400 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Knowledge profile calibrating</p>
              <p className="text-[11px] text-slate-400">Skills will automatically map here as you solve course quizzes and previous year papers.</p>
            </div>
          )}
        </article>
      </div>
    </>
  );
}

export default ProfilePage;
