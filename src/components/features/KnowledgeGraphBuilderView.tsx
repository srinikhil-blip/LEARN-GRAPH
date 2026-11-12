import { useState } from "react";
import {
  Network,
  Share2,
  Copy,
  CheckCircle2,
  Database,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type {
  KnowledgeGraphBuilderOutput,
  GraphNodeItem,
} from "@/types/conceptExtraction";

interface KnowledgeGraphBuilderViewProps {
  graphData: KnowledgeGraphBuilderOutput;
  onBackToExtractor?: () => void;
  onSyncToNeo4j?: () => void;
}

export function KnowledgeGraphBuilderView({
  graphData,
  onBackToExtractor,
  onSyncToNeo4j,
}: KnowledgeGraphBuilderViewProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(
    graphData.nodes.find((n) => n.labels.includes("Concept")) || graphData.nodes[0] || null
  );
  const [activeTab, setActiveTab] = useState<"visual" | "cypher" | "json">("visual");
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleCopyCypher = () => {
    if (!graphData.cypherScript) return;
    navigator.clipboard.writeText(graphData.cypherScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      onSyncToNeo4j?.();
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1000);
  };

  // Node position calculation helper for visual layout
  const getNodeCoordinates = (index: number, total: number) => {
    const centerX = 360;
    const centerY = 240;
    const radius = 170;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const nodePositions = graphData.nodes.reduce((acc, node, idx) => {
    acc[node.id] = getNodeCoordinates(idx, graphData.nodes.length);
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  // Incoming and Outgoing relationships for selected node
  const incomingRels = graphData.relationships.filter(
    (r) => selectedNode && r.to === selectedNode.id
  );
  const outgoingRels = graphData.relationships.filter(
    (r) => selectedNode && r.from === selectedNode.id
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/25">
            <Network size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Neo4j Knowledge Graph Builder
              </span>
              <Tag tone="purple">{graphData.graph_metadata.total_nodes} Nodes</Tag>
              <Tag tone="blue">{graphData.graph_metadata.total_relationships} Edges</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Semantic Graph & Dependency Network
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBackToExtractor && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBackToExtractor}>
              Back to Extractor
            </Button>
          )}

          <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "visual"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveTab("cypher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "cypher"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Cypher Script
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "json"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Graph JSON
            </button>
          </div>

          <Button
            variant="primary"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-1.5 py-1 px-3 text-xs shadow-sm shadow-purple-600/20"
          >
            {isSyncing ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Syncing to Neo4j...
              </>
            ) : syncSuccess ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-300" />
                Synced to Neo4j!
              </>
            ) : (
              <>
                <Database size={15} />
                Sync to Neo4j AuraDB
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Graph Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Canvas or Code Tab */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 overflow-hidden min-h-[500px] flex flex-col shadow-sm">
            {activeTab === "visual" && (
              <>
                {/* Canvas Floating Controls */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] shadow-xs text-xs">
                  <span className="flex items-center gap-1.5 px-2 py-1 text-purple-600 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Concept
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 text-blue-600 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Topic
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 text-emerald-600 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Skill
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 rounded-xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] shadow-xs">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
                    className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--foreground)]"
                    title="Zoom in"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
                    className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--foreground)]"
                    title="Zoom out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--foreground)]"
                    title="Reset zoom"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* SVG Graph Visualization */}
                <div className="w-full flex-1 flex items-center justify-center overflow-auto p-4">
                  <svg
                    viewBox="0 0 720 480"
                    className="w-full max-w-[700px] h-auto select-none transition-transform duration-200"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                  >
                    <defs>
                      <marker
                        id="arrow-prereq"
                        viewBox="0 0 10 10"
                        refX="22"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
                      </marker>
                      <marker
                        id="arrow-partof"
                        viewBox="0 0 10 10"
                        refX="22"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                      </marker>
                      <marker
                        id="arrow-improves"
                        viewBox="0 0 10 10"
                        refX="22"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                      </marker>
                    </defs>

                    {/* Edge Lines */}
                    {graphData.relationships.map((rel, idx) => {
                      const fromPos = nodePositions[rel.from];
                      const toPos = nodePositions[rel.to];
                      if (!fromPos || !toPos) return null;

                      const isSelectedRel =
                        selectedNode && (rel.from === selectedNode.id || rel.to === selectedNode.id);

                      const strokeColor =
                        rel.type === "PREREQUISITE"
                          ? "#8b5cf6"
                          : rel.type === "PART_OF"
                          ? "#3b82f6"
                          : rel.type === "IMPROVES"
                          ? "#10b981"
                          : "#94a3b8";

                      const markerId =
                        rel.type === "PREREQUISITE"
                          ? "arrow-prereq"
                          : rel.type === "IMPROVES"
                          ? "arrow-improves"
                          : "arrow-partof";

                      return (
                        <g key={`rel-${idx}`} className="transition-opacity">
                          <line
                            x1={fromPos.x}
                            y1={fromPos.y}
                            x2={toPos.x}
                            y2={toPos.y}
                            stroke={strokeColor}
                            strokeWidth={isSelectedRel ? 2.5 : 1.5}
                            strokeDasharray={rel.type === "RELATED_TO" ? "4,4" : undefined}
                            opacity={isSelectedRel ? 1 : 0.45}
                            markerEnd={`url(#${markerId})`}
                          />
                          {/* Label Pill on Edge */}
                          <text
                            x={(fromPos.x + toPos.x) / 2}
                            y={(fromPos.y + toPos.y) / 2 - 4}
                            fill="var(--muted)"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="bg-[var(--surface)] select-none pointer-events-none"
                          >
                            {rel.type} ({(rel.confidence * 100).toFixed(0)}%)
                          </text>
                        </g>
                      );
                    })}

                    {/* Node Circles */}
                    {graphData.nodes.map((node) => {
                      const pos = nodePositions[node.id];
                      if (!pos) return null;

                      const isSelected = selectedNode?.id === node.id;
                      const isConcept = node.labels.includes("Concept");
                      const isTopic = node.labels.includes("Topic");
                      const isSkill = node.labels.includes("Skill");

                      const fillBg = isConcept
                        ? "#8b5cf6"
                        : isTopic
                        ? "#3b82f6"
                        : isSkill
                        ? "#10b981"
                        : "#64748b";

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setSelectedNode(node)}
                        >
                          {isSelected && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={24}
                              fill="none"
                              stroke={fillBg}
                              strokeWidth={3}
                              strokeDasharray="3,3"
                              className="animate-spin"
                            />
                          )}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={18}
                            fill={fillBg}
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            className="shadow-sm"
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 30}
                            fill="var(--foreground)"
                            fontSize="11"
                            fontWeight="600"
                            textAnchor="middle"
                            className="select-none pointer-events-none"
                          >
                            {node.properties.name.length > 18
                              ? `${node.properties.name.slice(0, 16)}…`
                              : node.properties.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </>
            )}

            {/* Cypher Tab */}
            {activeTab === "cypher" && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <span className="text-xs font-mono font-bold text-purple-600">
                    Neo4j AuraDB Ingestion Script
                  </span>
                  <button
                    onClick={handleCopyCypher}
                    className="px-3 py-1.5 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? "Copied Cypher" : "Copy Cypher"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-purple-400 overflow-y-auto max-h-[460px] whitespace-pre-wrap leading-relaxed mt-3">
                  {graphData.cypherScript}
                </pre>
              </div>
            )}

            {/* JSON Tab */}
            {activeTab === "json" && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <span className="text-xs font-mono font-bold text-blue-600">
                    Neo4j REST Entity Payload
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(graphData, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? "Copied JSON" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-blue-400 overflow-y-auto max-h-[460px] whitespace-pre-wrap leading-relaxed mt-3">
                  {JSON.stringify(graphData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Node Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedNode ? (
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Tag tone="purple">{selectedNode.labels.join(" · ")}</Tag>
                    {selectedNode.properties.status && (
                      <Tag tone="emerald">{selectedNode.properties.status}</Tag>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">
                    {selectedNode.properties.name}
                  </h3>
                </div>
              </div>

              {selectedNode.properties.description && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {selectedNode.properties.description}
                </p>
              )}

              {/* Node Properties */}
              <div className="p-3.5 rounded-xl bg-[var(--soft)] text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">UUID:</span>
                  <span className="text-[var(--foreground)] truncate max-w-[160px]">
                    {selectedNode.properties.uuid}
                  </span>
                </div>
                {selectedNode.properties.difficulty && (
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Difficulty:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {selectedNode.properties.difficulty}
                    </span>
                  </div>
                )}
                {selectedNode.properties.bloomTaxonomyLevel && (
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Bloom Level:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {selectedNode.properties.bloomTaxonomyLevel}
                    </span>
                  </div>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--line)]">
                <strong className="text-xs font-semibold text-[var(--foreground)]">
                  Relationships ({incomingRels.length + outgoingRels.length})
                </strong>

                {outgoingRels.map((rel, idx) => {
                  const target = graphData.nodes.find((n) => n.id === rel.to);
                  return (
                    <div
                      key={`out-${idx}`}
                      className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-purple-600 font-bold text-[10px] uppercase">
                          {rel.type}
                        </span>
                        <ArrowRight size={12} className="text-[var(--muted)] shrink-0" />
                        <span className="font-medium truncate">{target?.properties.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                        {(rel.confidence * 100).toFixed(0)}% conf
                      </span>
                    </div>
                  );
                })}

                {incomingRels.map((rel, idx) => {
                  const source = graphData.nodes.find((n) => n.id === rel.from);
                  return (
                    <div
                      key={`in-${idx}`}
                      className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium truncate">{source?.properties.name}</span>
                        <ArrowRight size={12} className="text-[var(--muted)] shrink-0" />
                        <span className="text-blue-600 font-bold text-[10px] uppercase">
                          {rel.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                        {(rel.confidence * 100).toFixed(0)}% conf
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center text-xs text-[var(--muted)]">
              Click any node in the graph to inspect its properties and relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
