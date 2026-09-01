import fs from 'fs';
import path from 'path';

export interface UserRecord {
  email: string;
  name?: string;
  password: string;
  createdAt: string;
}

export interface OtpRecord {
  code: string;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const OTP_FILE = path.join(DATA_DIR, 'otp.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all registered users from disk
export function getUsers(): UserRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      const defaultUsers: UserRecord[] = [
        {
          email: 'admin@gmail.com',
          name: 'System Admin',
          password: 'Root@123',
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
      return defaultUsers;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as UserRecord[];
  } catch (err) {
    console.error('Error reading users from disk:', err);
    return [];
  }
}

// Save or update a user on disk
export function saveUser(user: UserRecord): boolean {
  try {
    const users = getUsers();
    const normalizedEmail = user.email.trim().toLowerCase();
    
    // Check if user already exists
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    
    if (existingIndex >= 0) {
      // Update existing user
      users[existingIndex].password = user.password;
      if (user.name) users[existingIndex].name = user.name;
    } else {
      // Add new user
      users.push({
        email: normalizedEmail,
        name: user.name || normalizedEmail.split('@')[0],
        password: user.password,
        createdAt: new Date().toISOString(),
      });
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving user to disk:', err);
    return false;
  }
}

// Reset a user's password
export function resetPassword(email: string, newPassword: string): boolean {
  try {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existingIndex < 0) {
      return false;
    }

    users[existingIndex].password = newPassword;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error resetting password on disk:', err);
    return false;
  }
}

// Find a user by email
export function findUserByEmail(email: string): UserRecord | undefined {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail);
}

// Read active OTPs
export function getOtps(): Record<string, OtpRecord> {
  try {
    ensureDataDir();
    if (!fs.existsSync(OTP_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(OTP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save an active OTP
export function saveOtp(email: string, code: string, expiresAt: number) {
  try {
    const otps = getOtps();
    const normalizedEmail = email.trim().toLowerCase();
    otps[normalizedEmail] = { code, expiresAt };
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving OTP to disk:', err);
  }
}

// Verify and consume an OTP
export function verifyAndConsumeOtp(email: string, code: string): { valid: boolean; error?: string } {
  try {
    const otps = getOtps();
    const normalizedEmail = email.trim().toLowerCase();
    const record = otps[normalizedEmail];

    if (!record) {
      return { valid: false, error: 'No verification code was requested for this email. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      delete otps[normalizedEmail];
      fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }

    if (record.code !== code.trim()) {
      return { valid: false, error: 'Incorrect verification code. Please check your email and try again.' };
    }

    // Valid code! Delete consumed OTP
    delete otps[normalizedEmail];
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
    return { valid: true };
  } catch {
    return { valid: false, error: 'Failed to verify code' };
  }
}
