import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes";
import type {
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "@/types/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    emailPendingVerification,
    role,
    login: storeLogin,
    setPendingVerificationEmail,
    logout: storeLogout,
    updateUser,
    setRole,
  } = useAuthStore();

  /* ── Current user query (re-fetches profile from backend) ── */
  const userQuery = useQuery({
    queryKey: ["auth", "currentUser", user?.id],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  /* ── Login ── */
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      storeLogin(data.user, data.access_token, data.refresh_token);
      queryClient.setQueryData(["auth", "currentUser", data.user.id], data.user);
    },
  });

  /* ── Register ── */
  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      setPendingVerificationEmail(data.email);
    },
  });

  /* ── Verify Email ── */
  const verifyEmailMutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
    onSuccess: (data) => {
      storeLogin(data.user, data.access_token, data.refresh_token);
      setPendingVerificationEmail(null);
      queryClient.setQueryData(["auth", "currentUser", data.user.id], data.user);
    },
  });

  /* ── Resend Verification ── */
  const resendVerificationMutation = useMutation({
    mutationFn: (payload: ResendVerificationPayload) => authApi.resendVerification(payload),
  });

  /* ── Forgot Password ── */
  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });

  /* ── Reset Password ── */
  const resetPasswordMutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
  });

  /* ── Update Profile ── */
  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (updated) => {
      updateUser(updated);
      queryClient.setQueryData(["auth", "currentUser", updated.id], updated);
    },
  });

  /* ── Logout (current device) ── */
  const logout = async () => {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // even if backend fails, clear local state
    } finally {
      storeLogout();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  /* ── Logout all devices ── */
  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // clear anyway
    } finally {
      storeLogout();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return {
    user: userQuery.data || user,
    token,
    refreshToken,
    isAuthenticated,
    emailPendingVerification,
    role,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      verifyEmailMutation.isPending ||
      resendVerificationMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordMutation.isPending,
    isError:
      loginMutation.isError ||
      registerMutation.isError ||
      verifyEmailMutation.isError,
    error:
      loginMutation.error ||
      registerMutation.error ||
      verifyEmailMutation.error ||
      userQuery.error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendVerification: resendVerificationMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    logout,
    logoutAll,
    setRole,
    setPendingVerificationEmail,
    refetchUser: userQuery.refetch,
  };
}
