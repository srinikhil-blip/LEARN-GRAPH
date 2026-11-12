import { useNavigate } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CodingAssistantStudio } from "@/components/features/CodingAssistantStudio";
import { ROUTES } from "@/constants/routes";

export function CodingAssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MULTI-LANGUAGE CODE GENERATION & DEBUGGING"
        title="Coding Assistant Studio"
        description="Write, optimize, explain, and debug algorithms across Python, Java, C++, TypeScript, and SQL with complexity proofs and test cases."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <CodingAssistantStudio onBack={() => navigate(ROUTES.AI_TUTOR)} />
      </div>
    </div>
  );
}

export default CodingAssistantPage;
