import type {
  AdminKPI,
  SystemHealthService,
  UserGrowthCategory,
  AIModelConfiguration,
} from "@/types/admin";

export const MOCK_ADMIN_KPIS: AdminKPI[] = [
  { label: "Active users", value: "2,841", delta: "+12.4%", iconName: "Users" },
  { label: "Courses", value: "186", delta: "+8", iconName: "BookOpen" },
  { label: "AI requests", value: "84.2k", delta: "+18.7%", iconName: "Database" },
  { label: "Monthly usage", value: "72%", delta: "Within plan", iconName: "CreditCard" },
];

export const MOCK_SYSTEM_HEALTH: SystemHealthService[] = [
  { name: "AI Tutor API", uptime: "99.98%", status: "operational" },
  { name: "Graph Engine", uptime: "99.99%", status: "operational" },
  { name: "LMS Sync", uptime: "99.94%", status: "operational" },
  { name: "File Processing", uptime: "99.97%", status: "operational" },
];

export const MOCK_USER_GROWTH: UserGrowthCategory[] = [
  { category: "Students", count: 2290, percentage: 81, tone: "indigo" },
  { category: "Teachers", count: 418, percentage: 15, tone: "cyan" },
  { category: "Administrators", count: 133, percentage: 4, tone: "emerald" },
];

export const MOCK_MODEL_CONFIG: AIModelConfiguration = {
  modelName: "LearnGraph Reasoning v3",
  tokenBudgetUsedM: 68.4,
  tokenBudgetTotalM: 100,
  status: "LIVE",
};
