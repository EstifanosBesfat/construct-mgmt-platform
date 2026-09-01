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

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

// ONLY default seed user
const DEFAULT_SEED_USERS: UserRecord[] = [
  {
    email: 'admin@gmail.com',
    name: 'System Admin',
    password: 'Root@123',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export function getUsers(): UserRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_SEED_USERS, null, 2), 'utf-8');
      } catch {}
      return DEFAULT_SEED_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(raw) as UserRecord[];
    return users.length > 0 ? users : DEFAULT_SEED_USERS;
  } catch {
    return DEFAULT_SEED_USERS;
  }
}

export function saveUser(user: UserRecord): boolean {
  try {
    const users = getUsers();
    const normalizedEmail = user.email.trim().toLowerCase();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user, email: normalizedEmail };
    } else {
      users.push({ ...user, email: normalizedEmail });
    }
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export function findUserByEmail(email: string): UserRecord | null {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

export function resetPassword(email: string, newPass: string): boolean {
  try {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) return false;
    user.password = newPass;
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

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

export function saveOtp(email: string, code: string, expiresAt: number): void {
  try {
    const otps = getOtps();
    otps[email.trim().toLowerCase()] = { code, expiresAt };
    ensureDataDir();
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
  } catch {}
}

export function verifyAndConsumeOtp(email: string, code: string): { valid: boolean; error?: string } {
  try {
    const otps = getOtps();
    const normalized = email.trim().toLowerCase();
    const record = otps[normalized];
    if (!record) {
      return { valid: false, error: 'No verification code was requested for this email' };
    }
    if (Date.now() > record.expiresAt) {
      delete otps[normalized];
      try {
        fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
      } catch {}
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }
    if (record.code !== code.trim()) {
      return { valid: false, error: 'Invalid verification code. Please check and try again.' };
    }
    delete otps[normalized];
    try {
      fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
    } catch {}
    return { valid: true };
  } catch {
    return { valid: false, error: 'Verification failed' };
  }
}
