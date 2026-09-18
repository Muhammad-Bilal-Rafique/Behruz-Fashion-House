"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Sparkles,
  KeyRound,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  requestPasswordResetAction,
  resetPasswordWithCodeAction,
} from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  // Multi-step state: "request" | "verify" | "success"
  const [step, setStep] = useState<"request" | "verify" | "success">("request");

  // Form states
  const [email, setEmail] = useState("behruzfashionhouse@gmail.com");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & transition
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Resend cooldown timer (60s)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle Step 1: Request Code
  const handleRequestCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your administrator email.");
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordResetAction(trimmedEmail);

      if (res.success) {
        toast.success("Security code sent!", {
          description: res.message,
        });
        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
        setStep("verify");
        setCooldown(60);
      } else {
        setErrorMessage(res.message);
        toast.error("Request Failed", {
          description: res.message,
        });
      }
    });
  };

  // Handle Step 2: Verify Code and Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMessage("Please enter the 6-digit code received on your email.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The confirmation password does not match.");
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordWithCodeAction(
        cleanCode,
        newPassword,
        email.trim()
      );

      if (res.success) {
        toast.success("Password reset successfully!", {
          description: "You can now sign in with your new password.",
        });
        setStep("success");
      } else {
        setErrorMessage(res.message);
        toast.error("Reset Failed", {
          description: res.message,
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle luxury background glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Bar / Back to Login Link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-xs shadow-xl p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2 shadow-2xs">
              {step === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : step === "verify" ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-sm font-serif tracking-[0.3em] uppercase font-bold text-foreground">
                BEHRUZ FASHION HOUSE
              </h1>
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">
                {step === "request"
                  ? "Admin Password Recovery"
                  : step === "verify"
                  ? "Verify Code & Set Password"
                  : "Password Reset Complete"}
              </p>
            </div>
          </div>

          <div className="h-px bg-border/80 w-full" />

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xs bg-destructive/10 border border-destructive/25 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {/* STEP 1: Request Code */}
          {step === "request" && (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your administrator email address. We will dispatch a 6-digit one-time verification code to verify your identity.
              </p>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reset-email"
                  className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
                >
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    placeholder="behruzfashionhouse@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wider uppercase text-xs rounded-xs shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Code...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember password? Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Verify Code & Reset */}
          {step === "verify" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Notice Banner */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xs text-xs text-foreground/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Verification Code Sent</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Check <strong className="text-foreground">{maskedEmail || email}</strong> for your 6-digit code. Valid for 15 minutes.
                </p>
              </div>

              {/* Code Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reset-code"
                  className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
                >
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(val);
                    }}
                    disabled={isPending}
                    placeholder="123456"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-base sm:text-lg font-mono tracking-[0.35em] text-foreground placeholder:text-muted-foreground/40 transition-colors duration-150 outline-none text-center"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
                >
                  New Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPending}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 outline-none"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 outline-none"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Reset Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wider uppercase text-xs rounded-xs shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update & Reset Password</span>
                  </>
                )}
              </Button>

              {/* Resend Code Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  disabled={cooldown > 0 || isPending}
                  onClick={() => handleRequestCode()}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors disabled:text-muted-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Security Code"}
                  </span>
                </button>

                <Link
                  href="/admin/login"
                  className="hover:text-foreground transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === "success" && (
            <div className="space-y-6 text-center animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <h2 className="text-base font-medium text-foreground">
                  Password Updated!
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your administrator credentials have been securely updated. You can now use your new password to access the store management portal.
                </p>
              </div>

              <div className="p-3 bg-muted/40 border border-border/80 rounded-xs text-xs text-muted-foreground">
                <p>
                  For security reasons, your verification code has been expired and invalidated.
                </p>
              </div>

              <Button
                onClick={() => router.push("/admin/login")}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wider uppercase text-xs rounded-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Sign In</span>
              </Button>
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-[11px] text-muted-foreground">
              Protected Administrative Area &bull; Behruz Fashion House
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
