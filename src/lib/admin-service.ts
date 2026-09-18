import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/connect";
import Admin, { IAdmin } from "@/models/Admin";
import { sendAdminPasswordResetCodeEmail } from "@/lib/email";

/**
 * Normalizes email or admin identifier.
 */
function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Ensures at least one initial admin exists in the database.
 * Uses ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD from environment.
 * Never creates an insecure default account with a hardcoded password in production.
 */
export async function ensureAdminSeeded(): Promise<IAdmin | null> {
  await connectDB();
  let admin = await Admin.findOne().sort({ createdAt: 1 });
  const initialEmail = (
    process.env.ADMIN_INITIAL_EMAIL ||
    process.env.ADMIN_GMAIL ||
    "behruzfashionhouse@gmail.com"
  )
    ?.trim()
    .toLowerCase();

  if (admin) {
    if (initialEmail && admin.email !== initialEmail) {
      admin.email = initialEmail;
      await admin.save();
    }
    return admin;
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminSecure2026!";

  if (initialEmail && initialPassword) {
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    admin = await Admin.create({
      email: initialEmail,
      passwordHash,
      name: "Store Administrator",
    });
    console.log("Successfully seeded initial admin account from environment:", initialEmail);
    return admin;
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL: No admin account exists in MongoDB and ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD are not configured. " +
      "Refusing to seed insecure default credentials in production."
    );
    return null;
  }

  // Development-only fallback warning
  console.warn(
    "Warning (Dev Only): No admin found. Please define ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD in .env.local."
  );
  return null;
}

/**
 * Authenticates admin credentials against MongoDB.
 */
export async function authenticateAdmin(
  identifier: string,
  password: string
): Promise<{ success: boolean; email?: string; message?: string }> {
  if (!identifier || !password) {
    return { success: false, message: "Email and password are required." };
  }

  if (password.length < 8) {
    return { success: false, message: "Invalid email or password." };
  }

  try {
    await connectDB();
    await ensureAdminSeeded();

    const normalized = normalizeIdentifier(identifier);

    // Search by exact email or fallback to any existing admin if single-admin
    let admin = await Admin.findOne({ email: normalized });
    if (!admin) {
      admin = await Admin.findOne().sort({ createdAt: 1 });
    }

    if (!admin) {
      return { success: false, message: "Invalid email or password." };
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password." };
    }

    return { success: true, email: admin.email };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "Authentication service error. Please try again." };
  }
}

/**
 * Updates the admin password in MongoDB after verifying the current password.
 */
export async function changeAdminPassword(
  email: string | undefined,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  if (!currentPassword || !newPassword) {
    return { success: false, message: "Current password and new password are required." };
  }

  if (newPassword.length < 8) {
    return { success: false, message: "New password must be at least 8 characters long." };
  }

  try {
    await connectDB();
    await ensureAdminSeeded();

    let admin: IAdmin | null = null;
    if (email) {
      admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    }
    if (!admin) {
      admin = await Admin.findOne().sort({ createdAt: 1 });
    }

    if (!admin) {
      return { success: false, message: "Admin account not found." };
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      return { success: false, message: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = newHash;
    await admin.save();

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, message: "Failed to update password. Please try again." };
  }
}

/**
 * Mask an email for user-facing security messages (e.g. b***e@gmail.com)
 */
function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Requests a 6-digit password reset code, saves its SHA-256 hash in MongoDB,
 * and sends an email via Resend to the admin email (behruzfashionhouse@gmail.com).
 */
export async function requestPasswordResetCode(
  targetEmail?: string
): Promise<{ success: boolean; message: string; email?: string; maskedEmail?: string }> {
  try {
    await connectDB();
    await ensureAdminSeeded();

    let admin: IAdmin | null = null;
    if (targetEmail && targetEmail.trim()) {
      const normalized = normalizeIdentifier(targetEmail);
      admin = await Admin.findOne({ email: normalized });
    }

    // If specific email not found or not provided, get the main admin
    if (!admin) {
      admin = await Admin.findOne().sort({ createdAt: 1 });
    }

    if (!admin) {
      return {
        success: false,
        message: "No administrator account was found.",
      };
    }

    const recipientEmail = (
      admin.email ||
      process.env.ADMIN_GMAIL ||
      process.env.ADMIN_INITIAL_EMAIL ||
      "behruzfashionhouse@gmail.com"
    ).trim().toLowerCase();

    // Generate cryptographically secure 6-digit code
    const rawCode = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");
    const expiryMinutes = 15;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    admin.resetPasswordCode = codeHash;
    admin.resetPasswordExpires = expiresAt;
    admin.resetPasswordAttempts = 0;
    await admin.save();

    // Send code to admin's email
    const emailRes = await sendAdminPasswordResetCodeEmail({
      toEmail: recipientEmail,
      resetCode: rawCode,
      expiryMinutes,
    });

    if (!emailRes.success) {
      return {
        success: false,
        message: emailRes.error || "Failed to dispatch verification code email. Please check server logs.",
      };
    }

    const masked = maskEmail(recipientEmail);
    return {
      success: true,
      message: `A 6-digit reset code has been sent to ${masked}. Please check your inbox.`,
      email: recipientEmail,
      maskedEmail: masked,
    };
  } catch (error: any) {
    console.error("requestPasswordResetCode error:", error);
    return {
      success: false,
      message: "An error occurred while generating your reset code. Please try again.",
    };
  }
}

/**
 * Verifies the 6-digit code and resets the admin password.
 */
export async function resetAdminPasswordWithCode(
  code: string,
  newPassword: string,
  targetEmail?: string
): Promise<{ success: boolean; message: string }> {
  const trimmedCode = code?.trim();

  if (!trimmedCode || trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
    return { success: false, message: "Please enter a valid 6-digit verification code." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: "New password must be at least 8 characters long." };
  }

  try {
    await connectDB();
    await ensureAdminSeeded();

    let admin: IAdmin | null = null;
    if (targetEmail && targetEmail.trim()) {
      const normalized = normalizeIdentifier(targetEmail);
      admin = await Admin.findOne({ email: normalized });
    }

    if (!admin) {
      admin = await Admin.findOne().sort({ createdAt: 1 });
    }

    if (!admin) {
      return { success: false, message: "Admin account not found." };
    }

    if (!admin.resetPasswordCode || !admin.resetPasswordExpires) {
      return {
        success: false,
        message: "No active password reset request found. Please request a new code.",
      };
    }

    // Check expiration
    if (new Date() > new Date(admin.resetPasswordExpires)) {
      admin.resetPasswordCode = undefined;
      admin.resetPasswordExpires = undefined;
      admin.resetPasswordAttempts = 0;
      await admin.save();
      return {
        success: false,
        message: "The reset code has expired. Please request a new one.",
      };
    }

    // Check attempts limit (max 5)
    if ((admin.resetPasswordAttempts || 0) >= 5) {
      admin.resetPasswordCode = undefined;
      admin.resetPasswordExpires = undefined;
      admin.resetPasswordAttempts = 0;
      await admin.save();
      return {
        success: false,
        message: "Too many failed attempts. For your security, this code has been revoked. Please request a new code.",
      };
    }

    // Verify hash
    const inputHash = crypto.createHash("sha256").update(trimmedCode).digest("hex");
    if (admin.resetPasswordCode !== inputHash) {
      admin.resetPasswordAttempts = (admin.resetPasswordAttempts || 0) + 1;
      await admin.save();

      const remaining = 5 - admin.resetPasswordAttempts;
      return {
        success: false,
        message:
          remaining > 0
            ? `Invalid code. ${remaining} attempt(s) remaining.`
            : "Invalid code. Maximum attempts reached. Please request a new code.",
      };
    }

    // Code is valid! Hash new password and save
    const newHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = newHash;
    admin.resetPasswordCode = undefined;
    admin.resetPasswordExpires = undefined;
    admin.resetPasswordAttempts = 0;
    await admin.save();

    return {
      success: true,
      message: "Your admin password has been successfully reset! You can now log in.",
    };
  } catch (error: any) {
    console.error("resetAdminPasswordWithCode error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while resetting the password. Please try again.",
    };
  }
}

