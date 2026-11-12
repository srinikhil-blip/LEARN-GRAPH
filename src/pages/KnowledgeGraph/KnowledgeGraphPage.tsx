import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CircleHelp,
  Filter,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { useGraph } from "@/hooks/useGraph";
import { useGraphStore } from "@/store/useGraphStore";
import { ROUTES } from "@/constants/routes";

export function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const { graphData, conceptDetails, selectedConcept, setSelectedConcept } = useGraph();
  const {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sidebarOpen,
    closeSidebar,
  } = useGraphStore();

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  const filteredNodes = rawNodes.filter((node) => {
    if (searchQuery.trim() && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus && node.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const selectedDetails = conceptDetails || {
    id: "concept-limits",
    name: selectedConcept,
    category: "Foundational concept · Calculus",
    status: selectedConcept === "Limits" ? ("weak" as const) : ("learning" as const),
    masteryPercentage: selectedConcept === "Limits" ? 46 : 68,
    interactionsCount: 12,
    description:
      "A limit describes the value a function approaches as the input gets closer to a certain point. It’s the bridge between algebra and calculus.",
    resources: [
      {
        id: "res-1",
        type: "video" as const,
        title: "Understanding Limits Visually",
        duration: "8 min",
        meta: "Video · 8 min",
      },
      {
        id: "res-2",
        type: "practice" as const,
        title: "Targeted practice set",
        duration: "8 questions",
        meta: "8 questions · Adaptive",
      },
    ],
  };

  return (
    <div className="graph-page">
      <div className="graph-toolbar">
        <div>
          <h1>Knowledge Graph</h1>
          <span>{graphData?.totalConcepts || 84} concepts · {graphData?.subject || "Mathematics"}</span>
        </div>

        <div className="graph-search">
          <Search size={17} />
          <input
            placeholder="Find a concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd>⌘ F</kbd>
        </div>

        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            aria-expanded={filterMenuOpen}
          >
            <Filter size={15} /> Filters{" "}
            <span className="filter-count">{filterStatus ? 1 : 2}</span>
          </Button>
          {filterMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-xl z-50 p-2 text-xs">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${!filterStatus ? "bg-[var(--soft)] font-bold" : ""}`}
                onClick={() => {
                  setFilterStatus(null);
                  setFilterMenuOpen(false);
                }}
              >
                All Statuses
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-emerald-600 ${filterStatus === "mastered" ? "bg-[var(--soft)] font-bold" : ""}`}
                onClick={() => {
                  setFilterStatus("mastered");
                  setFilterMenuOpen(false);
                }}
              >
                Mastered
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-amber-600 ${filterStatus === "learning" ? "bg-[var(--soft)] font-bold" : ""}`}
                onClick={() => {
                  setFilterStatus("learning");
                  setFilterMenuOpen(false);
                }}
              >
                Learning
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-red-600 ${filterStatus === "weak" ? "bg-[var(--soft)] font-bold" : ""}`}
                onClick={() => {
                  setFilterStatus("weak");
                  setFilterMenuOpen(false);
                }}
              >
                Weak
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-blue-600 ${filterStatus === "upcoming" ? "bg-[var(--soft)] font-bold" : ""}`}
                onClick={() => {
                  setFilterStatus("upcoming");
                  setFilterMenuOpen(false);
                }}
              >
                Recommended
              </button>
            </div>
          )}
        </div>

        <Button variant="secondary" onClick={resetZoom}>
          <SlidersHorizontal size={15} /> View
        </Button>
      </div>

      <div className="graph-workspace">
        <div className="graph-canvas">
          <div className="graph-breadcrumb">
            <Tag>MATHEMATICS</Tag>
            <ChevronRight size={13} />
            <span>All concepts</span>
          </div>

          <svg
            viewBox="0 0 900 520"
            aria-label="Interactive mathematics knowledge graph"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
          >
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" />
              </pattern>
            </defs>
            <rect width="900" height="520" fill="url(#dots)" />

            {rawEdges.map((edge, i) => {
              const nodeA = rawNodes[edge.source];
              const nodeB = rawNodes[edge.target];
              if (!nodeA || !nodeB) return null;
              const isWeak = nodeA.status === "weak" || nodeB.status === "weak";
              return (
                <line
                  key={edge.id || i}
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  className={isWeak ? "edge weak" : "edge"}
                />
              );
            })}

            {filteredNodes.map((n) => (
              <g
                key={n.name}
                className={`graph-concept ${n.status} ${selectedConcept === n.name ? "selected" : ""}`}
                onClick={() => setSelectedConcept(n.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedConcept(n.name);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Concept ${n.name}, status ${n.status}`}
              >
                <circle className="halo" cx={n.x} cy={n.y} r={n.radius + 8} />
                <circle cx={n.x} cy={n.y} r={n.radius} />
                <text x={n.x} y={n.y - 2}>
                  {n.name}
                </text>
                <text className="node-percent" x={n.x} y={n.y + 16}>
                  {n.status === "mastered"
                    ? "92%"
                    : n.status === "weak"
                      ? "46%"
                      : n.status === "learning"
                        ? "68%"
                        : "Next"}
                </text>
              </g>
            ))}
          </svg>

          <div className="zoom-controls">
            <button onClick={zoomIn} aria-label="Zoom in">
              <ZoomIn />
            </button>
            <button onClick={zoomOut} aria-label="Zoom out">
              <ZoomOut />
            </button>
            <button onClick={resetZoom} aria-label="Reset zoom">
              <Target />
            </button>
          </div>

          <div className="legend">
            <span>
              <i className="mastered" />
              Mastered
            </span>
            <span>
              <i className="learning" />
              Learning
            </span>
            <span>
              <i className="weak" />
              Weak
            </span>
            <span>
              <i className="upcoming" />
              Upcoming
            </span>
          </div>
        </div>

        {sidebarOpen && (
          <aside className="concept-panel">
            <div className="concept-panel-head">
              <div>
                <Tag tone={selectedDetails.status === "weak" ? "red" : "indigo"}>
                  {selectedDetails.status === "weak" ? "NEEDS ATTENTION" : "IN PROGRESS"}
                </Tag>
                <h2>{selectedDetails.name}</h2>
                <p>{selectedDetails.category}</p>
              </div>
              <button
                className="icon-btn"
                onClick={closeSidebar}
                aria-label="Close concept panel"
              >
                <X />
              </button>
            </div>

            <div className="mastery-block">
              <div>
                <span>Mastery</span>
                <strong>{selectedDetails.masteryPercentage}%</strong>
              </div>
              <Progress
                value={selectedDetails.masteryPercentage}
                tone={selectedDetails.status === "weak" ? "red" : "indigo"}
              />
              <p>Based on {selectedDetails.interactionsCount} learning interactions</p>
            </div>

            <div className="concept-section">
              <h3>In plain language</h3>
              <p>{selectedDetails.description}</p>
              <button
                className="ai-explain"
                onClick={() => navigate(ROUTES.AI_TUTOR)}
              >
                <Sparkles size={16} />
                <span>
                  <strong>Explain it differently</strong>
                  <small>Ask AI Tutor for a visual analogy</small>
                </span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="concept-section">
              <h3>Recommended next</h3>
              {selectedDetails.resources.map((res) => (
                <div className="resource-row" key={res.id}>
                  <span className={`resource-icon ${res.type}`}>
                    {res.type === "video" ? <Play /> : <Target />}
                  </span>
                  <div>
                    <strong>{res.title}</strong>
                    <small>{res.meta}</small>
                  </div>
                  <ChevronRight />
                </div>
              ))}
            </div>

            <div className="concept-actions">
              <Button onClick={() => navigate(ROUTES.COURSES)}>
                <Play size={15} fill="currentColor" /> Start learning
              </Button>
              <Button variant="secondary" onClick={() => navigate(ROUTES.QUIZ)}>
                <CircleHelp size={15} /> Practice
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default KnowledgeGraphPage;
