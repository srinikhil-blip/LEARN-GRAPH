import { useNavigate } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DeepPdfAnalyzer } from "@/components/features/DeepPdfAnalyzer";
import { ROUTES } from "@/constants/routes";

export function PdfAssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MULTIMODAL DOCUMENT REASONING"
        title="PDF & Research Assistant"
        description="Extract mind maps, mathematical formula sheets, prerequisite graphs, and chapter summaries from research papers and textbooks."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <DeepPdfAnalyzer onBack={() => navigate(ROUTES.AI_TUTOR)} />
      </div>
    </div>
  );
}

export default PdfAssistantPage;
