export interface AdminKPI {
  label: string;
  value: string;
  delta: string;
  iconName: string;
}

export interface SystemHealthService {
  name: string;
  uptime: string;
  status: "operational" | "degraded" | "down";
}

export interface UserGrowthCategory {
  category: string;
  count: number;
  percentage: number;
  tone: string;
}

export interface AIModelConfiguration {
  modelName: string;
  tokenBudgetUsedM: number;
  tokenBudgetTotalM: number;
  status: "LIVE" | "TESTING" | "OFFLINE";
}
