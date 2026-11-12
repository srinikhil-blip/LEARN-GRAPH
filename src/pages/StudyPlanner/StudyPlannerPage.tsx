import { useNavigate } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StudySchedulePlannerView } from "@/components/features/StudySchedulePlannerView";
import { ROUTES } from "@/constants/routes";

export function StudyPlannerPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI CURRICULUM PACING & MILESTONES"
        title="Personalized Study Planner"
        description="Generate daily study plans, spaced revision intervals, mock checkpoints, and cognitive break schedules tuned to your exam date."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <StudySchedulePlannerView onBack={() => navigate(ROUTES.AI_TUTOR)} />
      </div>
    </div>
  );
}

export default StudyPlannerPage;
