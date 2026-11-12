import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { emailPendingVerification, verifyEmail, resendVerification, user, isAuthenticated } = useAuth();

  // Token from URL (email link click) or email for resend
  const urlToken = searchParams.get("token");
  const emailParam = searchParams.get("email") || emailPendingVerification || user?.email || "";
  const [email] = useState<string>(emailParam);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already verified, go to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.emailVerified) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, user?.emailVerified, navigate]);

  // Auto-verify if token is in URL (email link click flow)
  useEffect(() => {
    if (urlToken) {
      setIsVerifying(true);
      verifyEmail({ email, tokenOrCode: urlToken })
        .then(() => {
          setSuccessMessage("Email verified! Redirecting to your dashboard…");
          setTimeout(() => navigate(ROUTES.DASHBOARD, { replace: true }), 1500);
        })
        .catch((err: any) => {
          setErrorMessage(
            err.message || "This verification link has expired or is invalid. Please request a new one."
          );
          setIsVerifying(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlToken]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await resendVerification({ email });
      setSuccessMessage(`Verification link resent to ${email}. Check your inbox.`);
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--foreground)] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Logo asLink={true} />
        <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => navigate(ROUTES.LOGIN)}>
          Sign in with another account
        </Button>
      </header>

      <main className="max-w-md w-full mx-auto my-12 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
          <Mail size={28} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {urlToken ? "Verifying your email…" : "Verify your email address"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            {urlToken
              ? "Please wait while we verify your email address."
              : "We sent a verification link to your email. Click the link to activate your account."}
          </p>
          {email && (
            <div className="font-semibold text-xs text-indigo-600 bg-indigo-500/10 py-1 px-3 rounded-full inline-block">
              {email}
            </div>
          )}
        </div>

        {/* Loading state for auto-verify */}
        {isVerifying && (
          <div className="flex flex-col items-center gap-3 py-4">
            <RefreshCw size={28} className="animate-spin text-indigo-500" />
            <p className="text-xs text-[var(--muted)]">Verifying your email…</p>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2 text-left">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Resend section (shown when no auto-verify token) */}
        {!urlToken && !isVerifying && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-[var(--muted)]">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 flex items-center justify-center gap-1.5 mx-auto"
            >
              <RefreshCw size={14} className={isResending ? "animate-spin" : ""} />
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : isResending
                ? "Sending…"
                : "Resend verification link"}
            </button>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-xs text-[var(--muted)] hover:text-indigo-600 transition-colors"
          >
            ← Back to Sign In
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--muted)]">
        &copy; {new Date().getFullYear()} LearnGraph Inc. Enterprise-Grade Adaptive Education.
      </footer>
    </div>
  );
}

export default VerifyEmailPage;
