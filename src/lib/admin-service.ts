import bcrypt from "bcryptjs";
import connectDB from "@/lib/connect";
import Admin, { IAdmin } from "@/models/Admin";

const DEFAULT_ADMIN_EMAIL = "fahadmailk8689@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin";

/**
 * Normalizes email or admin identifier.
 */
function normalizeIdentifier(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  // Allow user to log in with "admin" or common variations
  if (clean === "admin" || clean === "fahad" || clean === "fahadmalik8689@gmail.com") {
    return DEFAULT_ADMIN_EMAIL;
  }
  return clean;
}

/**
 * Ensures at least one initial admin exists in the database.
 */
export async function ensureAdminSeeded(): Promise<IAdmin> {
  await connectDB();
  let admin = await Admin.findOne().sort({ createdAt: 1 });

  if (!admin) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    admin = await Admin.create({
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: "Fahad Malik",
    });
    console.log("Seeded default admin account:", DEFAULT_ADMIN_EMAIL);
  }

  return admin;
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

  try {
    await connectDB();
    await ensureAdminSeeded();

    const normalized = normalizeIdentifier(identifier);

    // Search by exact email or fallback to any existing admin if logging in with alias
    let admin = await Admin.findOne({ email: normalized });
    if (!admin && (normalized === DEFAULT_ADMIN_EMAIL || identifier.toLowerCase().trim() === "admin")) {
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

  if (newPassword.length < 4) {
    return { success: false, message: "New password must be at least 4 characters long." };
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
