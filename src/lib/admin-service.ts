import bcrypt from "bcryptjs";
import connectDB from "@/lib/connect";
import Admin, { IAdmin } from "@/models/Admin";

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

  if (admin) {
    return admin;
  }

  const initialEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

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
