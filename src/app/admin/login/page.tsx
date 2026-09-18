"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { loginAdminAction } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your admin email or identifier.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your admin password.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("callbackUrl", callbackUrl);

      const result = await loginAdminAction(null, formData);

      if (result.success && result.redirectUrl) {
        toast.success("Welcome back! Signing in to admin portal...");
        router.push(result.redirectUrl);
        router.refresh();
      } else {
        const msg = result.message || "Invalid email or password.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3.5 rounded-xs bg-destructive/10 border border-destructive/25 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Email / Username Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
        >
          Admin Email / Identifier
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="admin@example.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 outline-none"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-semibold tracking-wider uppercase text-foreground/80 block"
          >
            Password
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-background/60 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wider uppercase text-xs rounded-xs shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In to Admin</span>
          </>
        )}
      </Button>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-muted-foreground">
          Protected Administrative Area &bull; Behruz Fashion House
        </p>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle luxury background glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Bar / Back to Store Link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-xs shadow-xl p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h1 className="text-sm font-serif tracking-[0.3em] uppercase font-bold text-foreground">
                BEHRUZ FASHION HOUSE
              </h1>
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">
                Admin Management Portal
              </p>
            </div>
          </div>

          <div className="h-px bg-border/80 w-full" />

          {/* Form wrapped in Suspense for useSearchParams */}
          <Suspense
            fallback={
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs tracking-wider uppercase">Loading Portal...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
