import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Network,
  Play,
  SlidersHorizontal,
  Sparkles,
  Target,
  Compass,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { useRecommendations } from "@/hooks/useRecommendations";
import { ROUTES } from "@/constants/routes";
import { LearningPathRecommender } from "@/components/features/LearningPathRecommender";

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [showStudio, setShowStudio] = useState(false);
  const { recommendations, learningPath, compactRecommendations } = useRecommendations();

  const iconMap: Record<string, any> = {
    TOPIC: Target,
    VIDEO: Play,
    READING: BookOpen,
    PRACTICE: Code2,
  };

  const steps = learningPath?.steps || [
    { name: "Functions", isDone: true, isActive: false },
    { name: "Limits", isDone: false, isActive: true },
    { name: "Continuity", isDone: false, isActive: false },
    { name: "Slope", isDone: false, isActive: false },
    { name: "Derivatives", isDone: false, isActive: false },
  ];

  return (
    <>
      <PageHeader
        eyebrow="CURATED FOR YOUR GRAPH"
        title="Recommendations & Learning Paths"
        description="Graph-powered resources and personalized trajectories selected with explicit mathematical rationales."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={showStudio ? "primary" : "secondary"}
              onClick={() => setShowStudio(!showStudio)}
            >
              <Compass size={15} /> {showStudio ? "Standard View" : "AI Pathfinding Engine"}
            </Button>
          </div>
        }
      />

      {showStudio ? (
        <LearningPathRecommender onBack={() => setShowStudio(false)} />
      ) : (
        <>
          <article className="learning-path-banner">
            <div>
              <Tag tone="cyan">
                <Sparkles size={13} /> AI LEARNING PATH
              </Tag>
              <h2>{learningPath?.title || "From Functions to Derivatives"}</h2>
              <p>{learningPath?.description || "A personalized 5-step path built from your current knowledge graph."}</p>
              <div className="path-steps">
                {steps.map((x, i) => (
                  <span key={x.name} className={x.isDone ? "done" : x.isActive ? "active" : ""}>
                    {x.isDone ? <Check /> : i + 1}
                    <small>{x.name}</small>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>{learningPath?.estimatedTime || "2h 45m"}</strong>
              <span>estimated</span>
              <Button onClick={() => setShowStudio(true)}>
                Explore Rationale <ArrowRight size={15} />
              </Button>
            </div>
          </article>

          <div className="recommend-grid">
            {recommendations.map((item) => {
              const Icon = iconMap[item.type] || Target;
              return (
                <article className="recommend-card" key={item.id}>
                  <span className={`recommend-icon ${item.tone}`}>
                    <Icon />
                  </span>
                  <Tag tone={item.tone}>{item.type}</Tag>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div>
                    <span>Matched to your graph</span>
                    <button
                      onClick={() => navigate(ROUTES.QUIZ)}
                      aria-label={`Open ${item.title}`}
                    >
                      <ArrowRight />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="section-line">
            <h2>Because you mastered Functions</h2>
            <button onClick={() => navigate(ROUTES.COURSES)}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="compact-recs">
            {compactRecommendations.map((x, i) => (
              <article key={x.id}>
                <div className={`tiny-art a${i}`}>
                  <Network />
                </div>
                <div>
                  <Tag>{x.tag}</Tag>
                  <h3>{x.title}</h3>
                  <p>{x.duration} · {x.level}</p>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => navigate(ROUTES.QUIZ)}
                  aria-label={`Select ${x.title}`}
                >
                  <ArrowRight />
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default RecommendationsPage;
