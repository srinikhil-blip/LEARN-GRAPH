import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Edit3,
  Save,
  Tag as TagIcon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import catalogJson from "@/data/generatedCurriculumCatalog.json";

export interface CustomCourseInput {
  id: string;
  title: string;
  subject: string;
  tier: string;
  gradeOrYear: string;
  board?: string;
  university?: string;
  level: string;
  syllabus: string[];
  description?: string;
}

export function CurriculumCMS() {
  const [courses, setCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem("lg_custom_curricula");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...(catalogJson.courses || []), ...parsed];
      } catch (e) {
        return catalogJson.courses || [];
      }
    }
    return catalogJson.courses || [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "add_course" | "import_dataset" | "versions">("catalog");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New course form state
  const [newCourse, setNewCourse] = useState<CustomCourseInput>({
    id: "",
    title: "",
    subject: "Computer Science",
    tier: "Undergraduate",
    gradeOrYear: "B.Tech Semester 1",
    board: "AICTE / University",
    university: "National Accredited University",
    level: "Intermediate",
    syllabus: ["Foundational Principles", "Core Theoretical Framework", "Applied Problem Solving", "Advanced Capstone"],
    description: "",
  });

  const [syllabusInput, setSyllabusInput] = useState(
    "Foundational Principles, Core Theoretical Framework, Applied Problem Solving, Advanced Capstone"
  );

  // Dataset Import JSON text state
  const [jsonImportText, setJsonImportText] = useState("");
  const [activeVersionTag, setActiveVersionTag] = useState("v3.0.0-universal-2026");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.id.trim() || !newCourse.title.trim()) {
      showToast("Please provide both a Course ID and Title.");
      return;
    }

    const syllabusArray = syllabusInput
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const fullCourse = {
      ...newCourse,
      id: newCourse.id.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
      syllabus: syllabusArray.length > 0 ? syllabusArray : ["Introduction", "Core Theory", "Case Study"],
      lessons: `${syllabusArray.length * 6} lessons`,
      time: "24h 00m",
      progress: 0,
      rating: 5.0,
      chapters: syllabusArray.map((ch, idx) => ({
        id: `${newCourse.id}-ch${idx + 1}`,
        title: ch,
        lessonsCount: 6,
        lessons: [
          { id: `${newCourse.id}-ch${idx + 1}-l1`, title: `1. Foundations of ${ch}`, duration: "25m", type: "video" },
          { id: `${newCourse.id}-ch${idx + 1}-l2`, title: `2. Theoretical Derivations & Axioms`, duration: "35m", type: "reading" },
          { id: `${newCourse.id}-ch${idx + 1}-l3`, title: `3. Step-by-Step Worked Problems`, duration: "30m", type: "practice" },
          { id: `${newCourse.id}-ch${idx + 1}-l4`, title: `4. Applied Case Analysis`, duration: "40m", type: "reading" },
          { id: `${newCourse.id}-ch${idx + 1}-l5`, title: `5. Common Misconceptions & Invariants`, duration: "20m", type: "quiz" },
          { id: `${newCourse.id}-ch${idx + 1}-l6`, title: `6. Mastery Diagnostic Checkpoint`, duration: "45m", type: "quiz" },
        ],
      })),
    };

    const updated = [fullCourse, ...courses];
    setCourses(updated);

    // Save to localStorage
    const savedCustom = JSON.parse(localStorage.getItem("lg_custom_curricula") || "[]");
    localStorage.setItem("lg_custom_curricula", JSON.stringify([fullCourse, ...savedCustom]));

    showToast(`Course "${fullCourse.title}" successfully published to the live catalog!`);
    setActiveSubTab("catalog");

    // Reset form
    setNewCourse({
      id: "",
      title: "",
      subject: "Computer Science",
      tier: "Undergraduate",
      gradeOrYear: "B.Tech Semester 1",
      board: "AICTE / University",
      university: "National Accredited University",
      level: "Intermediate",
      syllabus: [],
      description: "",
    });
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      const incomingCourses: any[] = Array.isArray(parsed) ? parsed : parsed.courses || [];

      if (!incomingCourses.length) {
        showToast("No valid courses found in JSON structure.");
        return;
      }

      const formatted = incomingCourses.map((c) => ({
        ...c,
        id: c.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        syllabus: c.syllabus || ["Overview", "Mechanics", "Assessment"],
        lessons: `${(c.syllabus?.length || 3) * 6} lessons`,
        time: "18h 30m",
        chapters: (c.syllabus || ["Overview", "Mechanics", "Assessment"]).map((ch: string, idx: number) => ({
          id: `${c.id}-ch${idx + 1}`,
          title: ch,
          lessonsCount: 6,
          lessons: [
            { id: `${c.id}-ch${idx + 1}-l1`, title: `1. Foundations of ${ch}`, duration: "25m", type: "video" },
            { id: `${c.id}-ch${idx + 1}-l2`, title: `2. Theoretical Derivations & Axioms`, duration: "35m", type: "reading" },
            { id: `${c.id}-ch${idx + 1}-l3`, title: `3. Step-by-Step Worked Problems`, duration: "30m", type: "practice" },
            { id: `${c.id}-ch${idx + 1}-l4`, title: `4. Applied Case Analysis`, duration: "40m", type: "reading" },
            { id: `${c.id}-ch${idx + 1}-l5`, title: `5. Common Misconceptions & Invariants`, duration: "20m", type: "quiz" },
            { id: `${c.id}-ch${idx + 1}-l6`, title: `6. Mastery Diagnostic Checkpoint`, duration: "45m", type: "quiz" },
          ],
        })),
      }));

      const merged = [...formatted, ...courses];
      setCourses(merged);

      const savedCustom = JSON.parse(localStorage.getItem("lg_custom_curricula") || "[]");
      localStorage.setItem("lg_custom_curricula", JSON.stringify([...formatted, ...savedCustom]));

      showToast(`Successfully imported ${formatted.length} courses into the catalog!`);
      setJsonImportText("");
      setActiveSubTab("catalog");
    } catch (err: any) {
      showToast(`Invalid JSON format: ${err.message}`);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      selectedTier === "all" ||
      c.tier?.toLowerCase() === selectedTier.toLowerCase();

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 pt-4">
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: "catalog", label: `Curriculum Repository (${courses.length})`, icon: Layers },
            { id: "add_course", label: "Add Course / Syllabus", icon: Plus },
            { id: "import_dataset", label: "Import Datasets (JSON/CSV)", icon: Upload },
            { id: "versions", label: "Syllabus Versions", icon: TagIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Active Version: {activeVersionTag}
          </span>
        </div>
      </div>

      {/* ── Subtab 1: Curriculum Repository Explorer ─────────────────────── */}
      {activeSubTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search across courses, subjects, degrees, board standards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
              {["all", "School", "Undergraduate", "Postgraduate", "Professional", "Competitive Exams"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all ${
                    selectedTier === tier
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {tier === "all" ? "All Levels" : tier}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Course / Program</th>
                    <th className="py-3 px-4">Level / Tier</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Syllabus Chapters</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredCourses.slice(0, 30).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">
                            {c.iconSymbol || c.id.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <span className="block">{c.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Tag tone="indigo">{c.tier}</Tag>
                      </td>
                      <td className="py-3 px-4">{c.subject}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {c.chapters?.length || c.syllabus?.length || 0} chapters
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => window.open(`/courses/${c.id}`, "_blank")}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-indigo-600 transition-colors"
                          title="Open course details"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourses.length > 30 && (
              <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Showing top 30 of {filteredCourses.length} matching curricula. Use search to filter specific programs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Subtab 2: Add New Course / Syllabus ──────────────────────────── */}
      {activeSubTab === "add_course" && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              Publish New Academic Course & Syllabus
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administratively inject a new course into the universal repository without requiring code deployments.
            </p>
          </div>

          <form onSubmit={handleSaveNewCourse} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unique Course Identifier (Slug) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ug-btech-ai-robotics"
                  value={newCourse.id}
                  onChange={(e) => setNewCourse({ ...newCourse, id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Course Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Mobile Robotics & Computer Vision"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Education Level / Tier
                </label>
                <select
                  value={newCourse.tier}
                  onChange={(e) => setNewCourse({ ...newCourse, tier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="School">School (KG - 12)</option>
                  <option value="Undergraduate">Undergraduate (UG)</option>
                  <option value="Postgraduate">Postgraduate (PG)</option>
                  <option value="Professional">Professional Certification</option>
                  <option value="Competitive Exams">Competitive Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence"
                  value={newCourse.subject}
                  onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Accreditation / Board / University
                </label>
                <input
                  type="text"
                  placeholder="e.g. AICTE / CBSE / Stanford"
                  value={newCourse.board}
                  onChange={(e) => setNewCourse({ ...newCourse, board: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Syllabus Chapters (Comma or Newline separated) *
              </label>
              <textarea
                rows={4}
                value={syllabusInput}
                onChange={(e) => setSyllabusInput(e.target.value)}
                placeholder="1. Spatial Coordinate Systems and Kinematics, 2. Sensor Fusion and Kalman Filtering, 3. SLAM Algorithms, 4. ROS 2 Navigation Architecture"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Each chapter will automatically generate structured lessons, theory, worked exemplars, and diagnostic quizzes.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Course Description
              </label>
              <textarea
                rows={2}
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Comprehensive walkthrough of foundational and applied principles..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" className="text-xs py-2 px-5 gap-1.5">
                <Save size={14} /> Publish Course to Database
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Subtab 3: Import Datasets (JSON/CSV) ─────────────────────────── */}
      {activeSubTab === "import_dataset" && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload size={16} className="text-indigo-600" />
              Bulk Curriculum Dataset Importer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Import entire curricula frameworks from open standards (CBSE, NCERT, AICTE, ACM/IEEE, or University boards) via structured JSON.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Paste JSON Payload:
            </label>
            <textarea
              rows={8}
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              placeholder={`{\n  "courses": [\n    {\n      "id": "ug-quantum-computing",\n      "title": "Quantum Computing & Qiskit Architecture",\n      "subject": "Physics / Computer Science",\n      "tier": "Undergraduate",\n      "syllabus": [\n        "Qubits, Superposition & Bloch Sphere",\n        "Quantum Logic Gates & Circuits",\n        "Shor's & Grover's Algorithms",\n        "IBM Qiskit Hardware Implementation"\n      ]\n    }\n  ]\n}`}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-emerald-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setJsonImportText(`{\n  "courses": [\n    {\n      "id": "ug-sample-course-${Date.now()}",\n      "title": "Computational Neuroscience & Brain-Computer Interfaces",\n      "subject": "Biotechnology",\n      "tier": "Undergraduate",\n      "syllabus": [\n        "Hodgkin-Huxley Action Potential Dynamics",\n        "Neural Spike Train Encoding",\n        "EEG Signal Processing & Wavelet Transforms",\n        "Deep Learning for Neural Decoding"\n      ]\n    }\n  ]\n}`);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Load Sample Template
            </button>

            <Button onClick={handleImportJson} variant="primary" className="text-xs gap-1.5 py-2 px-5">
              <Upload size={14} /> Parse & Import Courses
            </Button>
          </div>
        </div>
      )}

      {/* ── Subtab 4: Syllabus Versions ──────────────────────────────────── */}
      {activeSubTab === "versions" && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TagIcon size={16} className="text-indigo-600" />
              Syllabus Version Control & Releases
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish and tag curriculum releases to support multiple concurrent cohorts (e.g. NEP 2020 vs legacy regulations).
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                tag: "v3.0.0-universal-2026",
                title: "Universal Curriculum Release 3.0",
                date: "November 2026",
                coursesCount: courses.length,
                status: "Active (Current)",
                isCurrent: true,
              },
              {
                tag: "v2.1.0-nep-aligned",
                title: "NEP 2020 Academic Reorganization",
                date: "October 2026",
                coursesCount: 154,
                status: "Archived",
                isCurrent: false,
              },
            ].map((v) => (
              <div
                key={v.tag}
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  v.isCurrent
                    ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{v.title}</span>
                    <Tag tone={v.isCurrent ? "emerald" : "indigo"}>{v.status}</Tag>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Tag: {v.tag} · {v.coursesCount} courses · {v.date}
                  </span>
                </div>

                {v.isCurrent ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Active
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveVersionTag(v.tag);
                      showToast(`Switched active curriculum version to ${v.tag}`);
                    }}
                    className="text-xs py-1"
                  >
                    Activate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
