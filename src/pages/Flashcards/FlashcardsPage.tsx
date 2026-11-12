import { useNavigate } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { AdvancedFlashcardLab } from "@/components/features/AdvancedFlashcardLab";
import { ROUTES } from "@/constants/routes";

export function FlashcardsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SPACED REPETITION & MNEMONIC LAB"
        title="Adaptive Flashcards"
        description="Master complex algorithms, equations, medical terms, and historical dates with Leitner spaced repetition and AI mnemonics."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <AdvancedFlashcardLab onBack={() => navigate(ROUTES.AI_TUTOR)} />
      </div>
    </div>
  );
}

export default FlashcardsPage;
