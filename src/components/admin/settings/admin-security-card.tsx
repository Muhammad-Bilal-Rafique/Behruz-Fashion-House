"use client";

import React, { useState, useTransition } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeAdminPasswordAction } from "@/app/admin/settings/actions";

export function AdminSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      const err = "Please enter your current password.";
      setMessage({ type: "error", text: err });
      toast.error(err);
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      const err = "New password must be at least 4 characters long.";
      setMessage({ type: "error", text: err });
      toast.error(err);
      return;
    }

    if (newPassword !== confirmPassword) {
      const err = "New passwords do not match.";
      setMessage({ type: "error", text: err });
      toast.error(err);
      return;
    }

    startTransition(async () => {
      const res = await changeAdminPasswordAction(currentPassword, newPassword);

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        toast.success("Admin password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: res.message });
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xs p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <KeyRound className="w-5 h-5" />
            <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Admin Security & Password
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage your credentials for the Behruz Fashion House administrative portal.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protected Session</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xs border text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/25 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed font-medium">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Current Admin Email (Read-only reference) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Admin Email Address
          </Label>
          <Input
            value="fahadmailk8689@gmail.com"
            disabled
            className="text-xs rounded-xs bg-muted/50 cursor-not-allowed opacity-80"
          />
          <p className="text-[11px] text-muted-foreground">
            Primary email address associated with administrative access.
          </p>
        </div>

        {/* Current Password */}
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-xs font-semibold text-foreground">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPending}
              placeholder="Enter current password"
              className="text-xs rounded-xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPending}
                placeholder="Minimum 4 characters"
                className="text-xs rounded-xs pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
              placeholder="Re-enter new password"
              className="text-xs rounded-xs"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xs shadow-xs gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
