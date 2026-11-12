export type UserRole = "student" | "teacher" | "admin";

export type UserEducationTier =
  | "Class 8"
  | "Class 9"
  | "Class 10"
  | "Class 11"
  | "Class 12"
  | "Diploma"
  | "B.Tech"
  | "BCA"
  | "B.Sc"
  | "MCA"
  | "M.Tech"
  | "MBA"
  | "Lifelong Learner";

export type CompetitiveExamTarget =
  | "JEE Main"
  | "JEE Advanced"
  | "NEET"
  | "GATE CS/AI"
  | "UPSC CSE"
  | "SSC CGL"
  | "Banking / IBPS"
  | "CAT"
  | "GRE"
  | "GMAT"
  | "IELTS / TOEFL"
  | "FAANG Placement"
  | "None";

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  preferredLanguage: string;
  preferredExplanationStyle: "Intuitive & Analogies" | "Socratic Questioning" | "Academic & Rigorous";
  dailyStudyGoalMinutes: number;
  emailNotifications: boolean;
  examReminders: boolean;
  aiTutorTone: "Friendly" | "Strict" | "Encouraging";
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  level?: number;
  avatar?: string;
  initials?: string;
  institution?: string;
  educationLevel?: UserEducationTier;
  branch?: string;
  currentClass?: string;
  targetExam?: CompetitiveExamTarget;
  learningInterests?: string[];
  timezone?: string;
  country?: string;
  createdAt?: string;
  preferences?: UserPreferences;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  educationLevel?: UserEducationTier | string;
  targetExam?: CompetitiveExamTarget | string;
}

export interface VerifyEmailPayload {
  email: string;
  tokenOrCode: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  tokenOrCode: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  institution?: string;
  educationLevel?: UserEducationTier;
  branch?: string;
  targetExam?: CompetitiveExamTarget;
  learningInterests?: string[];
  preferredLanguage?: string;
  timezone?: string;
  country?: string;
  preferences?: Partial<UserPreferences>;
}
