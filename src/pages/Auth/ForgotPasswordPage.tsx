import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsSending(true);
    setErrorMessage(null);
    try {
      await forgotPassword({ email });
      // Always show success — backend never reveals if email exists
      setSubmitted(true);
    } catch (err: any) {
      // Network / server error only
      setErrorMessage(err.message || "Failed to process your request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--foreground)] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Logo asLink={true} />
        <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => navigate(ROUTES.LOGIN)}>
          Back to Sign In
        </Button>
      </header>

      <main className="max-w-md w-full mx-auto my-12 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
          <LockKeyhole size={28} />
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <h1 className="text-xl font-bold text-[var(--foreground)]">Check your inbox</h1>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                The link expires in <strong>15 minutes</strong>.
              </p>
            </div>
            <div className="text-xs text-[var(--muted)] bg-[var(--soft)] rounded-xl p-3 text-left space-y-1">
              <p className="font-semibold">Didn't get the email?</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Check your spam / junk folder</li>
                <li>Make sure you used the correct email</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Reset your password
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Enter your registered email and we'll send a secure reset link that expires in 15 minutes.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Account Email
                <div className="relative mt-1">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </label>
              <Button className="w-full py-2.5 text-xs font-semibold" type="submit" isLoading={isSending}>
                Send reset link <ArrowRight size={14} />
              </Button>
            </form>
          </>
        )}

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-xs text-[var(--muted)] hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} /> Back to Sign In
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--muted)]">
        &copy; {new Date().getFullYear()} LearnGraph Inc. Enterprise-Grade Security.
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;
