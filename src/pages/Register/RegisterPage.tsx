import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye, EyeOff, GraduationCap, Users, ShieldCheck,
  ChevronLeft, ChevronRight, ArrowRight, AlertCircle, Sparkles, CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/utils/validation";
import type { UserRole, UserEducationTier, CompetitiveExamTarget } from "@/types/auth";

const EDUCATION_LEVELS: UserEducationTier[] = [
  "Class 8","Class 9","Class 10","Class 11","Class 12",
  "Diploma","B.Tech","BCA","B.Sc","MCA","M.Tech","MBA","Lifelong Learner",
];

const EXAM_TARGETS: CompetitiveExamTarget[] = [
  "JEE Main","JEE Advanced","NEET","GATE CS/AI","UPSC CSE",
  "SSC CGL","Banking / IBPS","CAT","GRE","GMAT","IELTS / TOEFL","FAANG Placement","None",
];

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { level: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { level: 3, label: "Good", color: "bg-blue-500" };
  if (score === 4) return { level: 4, label: "Strong", color: "bg-emerald-500" };
  return { level: 5, label: "Very Strong", color: "bg-emerald-600" };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();

  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "student" },
  });

  const passwordValue = watch("password") || "";
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreed) {
      setFormError("Please accept the Terms of Service to continue.");
      return;
    }
    setFormError(null);
    try {
      await registerUser({ ...data, role: selectedRole });
      navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setFormError(err.message || "Registration failed. This email may already be registered.");
    }
  };

  if (step === "role") {
    return (
      <div className="auth-page">
        <button className="auth-back" onClick={() => navigate(ROUTES.HOME)}>
          <ChevronLeft size={17} /> Back home
        </button>
        <div className="auth-art">
          <Logo asLink={false} />
          <div className="auth-quote">
            <Sparkles size={26} />
            <h2>Your personalized<br />learning starts here.</h2>
            <p>"Every student's path is unique. LearnGraph maps yours."</p>
            <div><span>RK</span><strong>Rahul, GATE AIR 42</strong></div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-form">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">How will you use LearnGraph?</h1>
              <p className="text-sm text-[var(--muted)] mt-1">We'll personalize your workspace, study paths, and AI recommendations.</p>
            </div>
            <div className="role-grid">
              {([
                { icon: GraduationCap, label: "student" as UserRole, title: "Student / Aspirant", text: "Class 8–12, Undergrad, JEE, NEET, GATE, Placements" },
                { icon: Users, label: "teacher" as UserRole, title: "Teacher / Professor", text: "Create courses, quizzes & track student progress" },
                { icon: ShieldCheck, label: "admin" as UserRole, title: "Institution Admin", text: "Manage institution, roles & platform security" },
              ]).map(({ icon: Icon, label, title, text }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setSelectedRole(label); setStep("form"); }}
                >
                  <Icon />
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>Sign in</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => setStep("role")}>
        <ChevronLeft size={17} /> Change role
      </button>
      <div className="auth-art">
        <Logo asLink={false} />
        <div className="auth-quote">
          <Sparkles size={26} />
          <h2>Your personalized<br />learning starts here.</h2>
          <p>"Every student's path is unique. LearnGraph maps yours."</p>
          <div><span>RK</span><strong>Rahul, GATE AIR 42</strong></div>
        </div>
      </div>
      <div className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Create your account</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Signing up as <span className="font-semibold text-indigo-600 capitalize">{selectedRole}</span>. Your data is 100% private.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Full Name */}
          <label>
            Full Name
            <input type="text" placeholder="Your full name" autoComplete="name" {...register("name")} />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </label>

          {/* Email */}
          <label>
            Email address
            <input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </label>

          {/* Password */}
          <label>
            Password
            <div className="input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Strength meter */}
            {passwordValue && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : "bg-slate-200 dark:bg-slate-700"}`} />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500">{strength.label}</span>
              </div>
            )}
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </label>

          {/* Confirm Password */}
          <label>
            Confirm Password
            <div className="input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>}
          </label>

          {/* Education Level */}
          <label>
            Education Level
            <select
              {...register("educationLevel")}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-600"
            >
              <option value="">Select your level</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          {/* Target Exam */}
          <label>
            Target Exam / Goal
            <select
              {...register("targetExam")}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-600"
            >
              <option value="">Select your goal</option>
              {EXAM_TARGETS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span>
              I agree to LearnGraph's{" "}
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </span>
          </label>

          <Button className="wide" type="submit" isLoading={isLoading}>
            Create account &amp; verify email <ArrowRight size={16} />
          </Button>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>Sign in</button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
