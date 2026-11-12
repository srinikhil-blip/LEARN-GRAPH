import {
  Grid2X2,
  Network,
  Bot,
  Library,
  FileText,
  BarChart3,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Award,
  Layers,
  Calendar,
  Terminal,
  Calculator,
  History,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const MAIN_NAVIGATION: NavItem[] = [
  { label: "Overview", path: ROUTES.DASHBOARD, icon: Grid2X2 },
  { label: "Knowledge Graph", path: ROUTES.KNOWLEDGE_GRAPH, icon: Network },
  { label: "AI Tutor", path: ROUTES.AI_TUTOR, icon: Bot, badge: "AI" },
  { label: "Course Library", path: ROUTES.COURSES, icon: Library },
  { label: "Competitive Exams", path: ROUTES.COMPETITIVE_EXAMS, icon: Award, badge: "Target" },
  { label: "Quiz Lab", path: ROUTES.QUIZ, icon: FileText },
  { label: "Analytics", path: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: "Recommendations", path: ROUTES.RECOMMENDATIONS, icon: Sparkles },
];

export const AI_TOOLS_NAVIGATION: NavItem[] = [
  { label: "Flashcards Lab", path: ROUTES.FLASHCARDS, icon: Layers },
  { label: "Study Planner", path: ROUTES.STUDY_PLANNER, icon: Calendar },
  { label: "PDF Assistant", path: ROUTES.PDF_ASSISTANT, icon: FileText },
  { label: "Coding Assistant", path: ROUTES.CODING_ASSISTANT, icon: Terminal },
  { label: "Math Solver", path: ROUTES.MATH_SOLVER, icon: Calculator },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  { label: "Teacher Studio", path: ROUTES.TEACHER, icon: GraduationCap },
  { label: "Admin Console", path: ROUTES.ADMIN, icon: ShieldCheck },
];
