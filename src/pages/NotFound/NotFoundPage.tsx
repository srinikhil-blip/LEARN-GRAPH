import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)] flex items-center justify-center mb-6">
        <BrainCircuit size={36} />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
        404 ERROR
      </span>
      <h1 className="text-3xl font-extrabold text-[var(--ink)] mb-3">
        Concept Not Found
      </h1>
      <p className="text-base text-[var(--muted)] max-w-md mb-8">
        This path is not yet connected to your knowledge graph. Return to your dashboard to resume your learning journey.
      </p>
      <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
        Return to Dashboard <ArrowRight size={16} />
      </Button>
    </div>
  );
}

export default NotFoundPage;
