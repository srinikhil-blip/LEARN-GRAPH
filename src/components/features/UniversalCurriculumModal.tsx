import { useState } from "react";
import {
  X,
  Search,
  BookOpen,
  GraduationCap,
  Briefcase,
  Compass,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { curriculumApi } from "@/api/curriculumApi";
import type {
  CurriculumNode,
  EducationTier,
  TopicContentPayload,
} from "@/types/curriculum";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";

interface UniversalCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topic: TopicContentPayload) => void;
}

export function UniversalCurriculumModal({
  isOpen,
  onClose,
  onSelectTopic,
}: UniversalCurriculumModalProps) {
  const [activeTier, setActiveTier] = useState<EducationTier>("school");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const catalog = curriculumApi.getCurriculumCatalog();
  const currentTierNodes = catalog.filter((n) => n.tier === activeTier);
  const activeNode =
    currentTierNodes.find((n) => n.id === selectedNodeId) ||
    currentTierNodes[0] ||
    catalog[0];

  const searchResults = searchQuery.trim()
    ? curriculumApi.searchCurriculum({ term: searchQuery })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--foreground)] w-full max-w-5xl h-[85vh] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between gap-4 shrink-0 bg-[var(--soft)]/50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Compass size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                LearnGraph Universal Curriculum Catalog
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Structured knowledge hierarchy spanning Class 8 to M.Tech, FAANG Prep & 14 Career Paths
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Tier Filter Bar */}
        <div className="px-6 py-3 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[var(--surface)]">
          {/* Tier Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => {
                setActiveTier("school");
                setSelectedNodeId(null);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTier === "school" && !searchQuery
                  ? "bg-[var(--surface)] text-indigo-600 shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <BookOpen size={13} /> School (8–12)
            </button>

            <button
              onClick={() => {
                setActiveTier("undergraduate");
                setSelectedNodeId(null);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTier === "undergraduate" && !searchQuery
                  ? "bg-[var(--surface)] text-indigo-600 shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <GraduationCap size={13} /> Undergrad (B.Tech / BCA)
            </button>

            <button
              onClick={() => {
                setActiveTier("interview_prep");
                setSelectedNodeId(null);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTier === "interview_prep" && !searchQuery
                  ? "bg-[var(--surface)] text-indigo-600 shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Briefcase size={13} /> FAANG & Placements
            </button>

            <button
              onClick={() => {
                setActiveTier("career_roadmap");
                setSelectedNodeId(null);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTier === "career_roadmap" && !searchQuery
                  ? "bg-[var(--surface)] text-indigo-600 shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Sparkles size={13} /> 14 Career Roadmaps
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search concepts, topics, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {searchQuery.trim() ? (
            /* Search Results View */
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              <div className="text-xs font-semibold text-[var(--muted)] mb-2">
                Found {searchResults.length} concepts matching "{searchQuery}"
              </div>
              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-[var(--muted)] text-sm">
                  No matching topics found. Try searching for "Dijkstra", "Limits", or "Rate Limiter".
                </div>
              ) : (
                searchResults.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTopic(t);
                      onClose();
                    }}
                    className="p-4 rounded-xl border border-[var(--line)] hover:border-indigo-500/40 bg-[var(--surface)] hover:bg-indigo-500/5 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag tone="indigo">{t.subjectTitle}</Tag>
                        <Tag tone="emerald">{t.difficultyRating}</Tag>
                        <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                          <Clock size={11} /> {t.estimatedStudyTimeMinutes} min
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-600 transition-colors">
                        {t.topicTitle}
                      </h4>
                      <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                        {t.overview}
                      </p>
                    </div>

                    <Button className="py-1 px-3 text-xs shrink-0 group-hover:bg-indigo-600 text-white">
                      Load in AI Tutor <ArrowRight size={13} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Hierarchical Catalog View */
            <>
              {/* Left Sub-track selector */}
              <div className="w-64 border-r border-[var(--line)] bg-[var(--soft)]/30 p-3 overflow-y-auto space-y-1 shrink-0">
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Available Tracks
                </div>
                {currentTierNodes.map((node) => {
                  const isSelected = activeNode?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[var(--surface)] text-indigo-600 shadow-xs border border-[var(--line)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--soft)]"
                      }`}
                    >
                      <span className="truncate">{node.subCategory}</span>
                      <ChevronRight size={13} className={isSelected ? "text-indigo-600" : "opacity-40"} />
                    </button>
                  );
                })}
              </div>

              {/* Right Topic Details & Chapters */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {activeNode && (
                  <>
                    <div className="border-b border-[var(--line)] pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag tone="purple">{activeNode.tier.toUpperCase()}</Tag>
                        <span className="text-xs text-indigo-600 font-semibold">
                          Target: {activeNode.targetRoleOrOutcome}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {activeNode.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {activeNode.description}
                      </p>
                    </div>

                    {/* Subjects in this track */}
                    <div className="space-y-6">
                      {activeNode.subjects.map((subj) => (
                        <div key={subj.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-600">
                              <Layers size={14} />
                            </span>
                            <h4 className="text-sm font-bold text-[var(--foreground)]">
                              {subj.title}
                            </h4>
                            <span className="text-[11px] text-[var(--muted)]">
                              · {subj.chapters.length} Chapters
                            </span>
                          </div>

                          {subj.chapters.map((ch) => (
                            <div
                              key={ch.id}
                              className="p-4 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-xs font-bold text-[var(--foreground)]">
                                    {ch.title}
                                  </h5>
                                  <p className="text-[11px] text-[var(--muted)]">
                                    {ch.description} · ~{ch.estimatedHours} Hours
                                  </p>
                                </div>
                              </div>

                              {/* Topics list */}
                              <div className="grid grid-cols-1 gap-2 pt-1">
                                {ch.topics.map((t) => (
                                  <div
                                    key={t.id}
                                    onClick={() => {
                                      onSelectTopic(t);
                                      onClose();
                                    }}
                                    className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <Tag tone="emerald">{t.difficultyRating}</Tag>
                                        <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                                          <Clock size={10} /> {t.estimatedStudyTimeMinutes} min
                                        </span>
                                        <span className="text-[10px] text-purple-600 font-medium">
                                          Bloom: {t.bloomsTaxonomyLevel}
                                        </span>
                                      </div>
                                      <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-600 transition-colors">
                                        {t.topicTitle}
                                      </div>
                                      <div className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                                        {t.overview}
                                      </div>
                                    </div>

                                    <Button className="py-1 px-2.5 text-xs shrink-0 group-hover:bg-indigo-600 text-white">
                                      Launch Socratic Study <ArrowRight size={13} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--line)] bg-[var(--soft)]/50 flex items-center justify-between text-xs text-[var(--muted)] shrink-0">
          <span>Click any topic to immediately initialize an interactive OpenAI Socratic tutoring session.</span>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onClose}>
            Close Catalog
          </Button>
        </div>
      </div>
    </div>
  );
}
