import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, XCircle } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500", "bg-emerald-600"];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-slate-200 dark:bg-slate-700"}`} />
        ))}
      </div>
      <span className="text-[11px] text-slate-500">{labels[score]}</span>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If no token in URL, show error immediately
  useEffect(() => {
    if (!token) {
      setErrorMessage("No reset token found. Please use the link from your email or request a new reset link.");
    }
  }, [token]);

  const validate = () => {
    if (newPassword.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(newPassword)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(newPassword)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(newPassword)) return "Password must contain at least one special character.";
    if (newPassword !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setErrorMessage(validationError); return; }
    if (!token) { setErrorMessage("Invalid reset link. Please request a new password reset."); return; }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await resetPassword({ email: "", tokenOrCode: token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN, { state: { successMessage: "Password updated! Please sign in." } }), 2000);
    } catch (err: any) {
      if (err.status === 400 || err.status === 410) {
        setErrorMessage("This reset link has expired or already been used. Please request a new one.");
      } else {
        setErrorMessage(err.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--foreground)] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Logo asLink={true} />
        <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => navigate(ROUTES.LOGIN)}>
          Sign In
        </Button>
      </header>

      <main className="max-w-md w-full mx-auto my-12 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
          <KeyRound size={28} />
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <h1 className="text-xl font-bold text-[var(--foreground)]">Password updated!</h1>
            <p className="text-xs text-[var(--muted)]">Your password has been reset. Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Create a new password
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Choose a strong password. It must be at least 8 characters with an uppercase letter, number, and special character.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span>{errorMessage}</span>
                  {(errorMessage.includes("expired") || errorMessage.includes("No reset token")) && (
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                      className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Request a new reset link →
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* New Password */}
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                New Password
                <div className="relative mt-1">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(null); }}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </label>

              {/* Confirm Password */}
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Confirm Password
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(null); }}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className={`w-full pr-10 pl-3 py-2.5 rounded-xl bg-[var(--soft)] border text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-red-400"
                        : confirmPassword && newPassword === confirmPassword
                        ? "border-emerald-400"
                        : "border-[var(--line)]"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <XCircle size={11} /> Passwords do not match
                  </span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="text-emerald-500 text-[11px] flex items-center gap-1 mt-1">
                    <CheckCircle2 size={11} /> Passwords match
                  </span>
                )}
              </label>

              <Button
                className="w-full py-2.5 text-xs font-semibold"
                type="submit"
                isLoading={isSubmitting}
                disabled={!token}
              >
                Update Password &amp; Sign In <ArrowRight size={14} />
              </Button>
            </form>
          </>
        )}
      </main>

      <footer className="text-center text-xs text-[var(--muted)]">
        &copy; {new Date().getFullYear()} LearnGraph Inc. Enterprise-Grade Security.
      </footer>
    </div>
  );
}

export default ResetPasswordPage;
