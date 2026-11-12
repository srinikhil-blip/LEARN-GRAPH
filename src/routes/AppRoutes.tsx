import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { PageLoader } from "@/components/ui/Loader";
import { ROUTES } from "@/constants/routes";

// Lazy-loaded pages for optimal performance and code splitting
const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Register/RegisterPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const KnowledgeGraphPage = lazy(() => import("@/pages/KnowledgeGraph/KnowledgeGraphPage"));
const CoursesPage = lazy(() => import("@/pages/Courses/CoursesPage"));
const CourseDetailsPage = lazy(() => import("@/pages/CourseDetails/CourseDetailsPage"));
const CompetitiveExamsPage = lazy(() => import("@/pages/CompetitiveExams/CompetitiveExamsPage"));
const AITutorPage = lazy(() => import("@/pages/AITutor/AITutorPage"));
const HistoryPage = lazy(() => import("@/pages/AITutor/HistoryPage"));
const BookmarksPage = lazy(() => import("@/pages/AITutor/BookmarksPage"));
const UploadsPage = lazy(() => import("@/pages/AITutor/UploadsPage"));
const FlashcardsPage = lazy(() => import("@/pages/Flashcards/FlashcardsPage"));
const StudyPlannerPage = lazy(() => import("@/pages/StudyPlanner/StudyPlannerPage"));
const PdfAssistantPage = lazy(() => import("@/pages/PdfAssistant/PdfAssistantPage"));
const CodingAssistantPage = lazy(() => import("@/pages/CodingAssistant/CodingAssistantPage"));
const MathSolverPage = lazy(() => import("@/pages/MathSolver/MathSolverPage"));
const QuizPage = lazy(() => import("@/pages/Quiz/QuizPage"));
const AnalyticsPage = lazy(() => import("@/pages/Analytics/AnalyticsPage"));
const RecommendationsPage = lazy(() => import("@/pages/Recommendations/RecommendationsPage"));
const TeacherPage = lazy(() => import("@/pages/Teacher/TeacherPage"));
const AdminPage = lazy(() => import("@/pages/Admin/AdminPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/Settings/SettingsPage"));
const ActiveSessionsPage = lazy(() => import("@/pages/Settings/ActiveSessionsPage"));
const NotificationsPage = lazy(() => import("@/pages/Notifications/NotificationsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFound/NotFoundPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>

        {/* Private Routes with AppShell & Strict Authentication Guard */}
        <Route element={<PrivateLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.KNOWLEDGE_GRAPH} element={<KnowledgeGraphPage />} />
          <Route path={ROUTES.COURSES} element={<CoursesPage />} />
          <Route path={ROUTES.COURSE_DETAILS} element={<CourseDetailsPage />} />
          <Route path={ROUTES.COMPETITIVE_EXAMS} element={<CompetitiveExamsPage />} />
          <Route path={ROUTES.AI_TUTOR} element={<AITutorPage />} />
          <Route path={ROUTES.AI_HISTORY} element={<HistoryPage />} />
          <Route path={ROUTES.AI_BOOKMARKS} element={<BookmarksPage />} />
          <Route path={ROUTES.AI_UPLOADS} element={<UploadsPage />} />
          <Route path={ROUTES.FLASHCARDS} element={<FlashcardsPage />} />
          <Route path={ROUTES.STUDY_PLANNER} element={<StudyPlannerPage />} />
          <Route path={ROUTES.PDF_ASSISTANT} element={<PdfAssistantPage />} />
          <Route path={ROUTES.CODING_ASSISTANT} element={<CodingAssistantPage />} />
          <Route path={ROUTES.MATH_SOLVER} element={<MathSolverPage />} />
          <Route path={ROUTES.QUIZ} element={<QuizPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.RECOMMENDATIONS} element={<RecommendationsPage />} />
          <Route path={ROUTES.TEACHER} element={<TeacherPage />} />
          <Route path={ROUTES.ADMIN} element={<AdminPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.ACTIVE_SESSIONS} element={<ActiveSessionsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
}
