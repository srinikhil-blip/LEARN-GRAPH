import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye, EyeOff, LockKeyhole, Mail, ArrowRight,
  AlertCircle, CheckCircle2, Sparkles, ChevronLeft, MailOpen,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validation";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, resendVerification, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    setEmailNotVerified(null);
    try {
      await login(data);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED" || err.status === 403) {
        setEmailNotVerified(data.email);
      } else if (err.status === 423) {
        setFormError("Your account is temporarily locked due to too many failed login attempts. Please try again after 30 minutes or reset your password.");
      } else {
        setFormError(err.message || "Invalid email or password. Please check your credentials and try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!emailNotVerified) return;
    setResendState("sending");
    try {
      await resendVerification({ email: emailNotVerified });
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => navigate(ROUTES.HOME)}>
        <ChevronLeft size={17} /> Back home
      </button>

      {/* Left art panel */}
      <div className="auth-art">
        <Logo asLink={false} />
        <div className="auth-quote">
          <Sparkles size={26} />
          <h2>Build the knowledge<br />that builds your future.</h2>
          <p>"LearnGraph showed me exactly why I was stuck — and what to learn next."</p>
          <div>
            <span>MS</span>
            <strong>Maya, Computer Science &amp; AI</strong>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back</h1>
            <p className="text-sm text-[var(--muted)]">Sign in to your personal learning dashboard.</p>
          </div>

          {/* Email not verified banner */}
          {emailNotVerified && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <MailOpen size={15} /> Email not verified
              </div>
              <p>Your account exists but email verification is pending. Check your inbox for the verification link.</p>
              {resendState === "sent" ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 size={13} /> Verification link resent!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendState === "sending"}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50"
                >
                  {resendState === "sending" ? "Sending…" : "Resend verification email →"}
                </button>
              )}
            </div>
          )}

          {/* General error */}
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Email */}
          <label>
            Email address
            <div className="input-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
              <Mail size={15} />
            </div>
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </label>

          {/* Password */}
          <label>
            Password
            <div className="input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </label>

          {/* Options row */}
          <div className="form-options">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("rememberMe")} />
              <span>Remember me (30 days)</span>
            </label>
            <button
              type="button"
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold"
            >
              Forgot password?
            </button>
          </div>

          <Button className="wide" type="submit" isLoading={isLoading}>
            Sign in <ArrowRight size={16} />
          </Button>

          <p className="auth-switch">
            New to LearnGraph?{" "}
            <button type="button" onClick={() => navigate(ROUTES.REGISTER)}>
              Create a free account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
