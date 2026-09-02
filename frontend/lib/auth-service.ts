import crypto from 'crypto';
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

const SECRET_KEY = process.env.OTP_SECRET || 'construct-cms-otp-secret-key-2026-production';

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

export const DEFAULT_SEED_USERS: UserRecord[] = [
  {
    email: 'admin@gmail.com',
    name: 'System Admin',
    password: 'Root@123',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

// In-memory fallback for serverless process lifetime
const inMemoryUsers = new Map<string, UserRecord>([
  ['admin@gmail.com', DEFAULT_SEED_USERS[0]],
]);
const inMemoryOtps = new Map<string, OtpRecord>();

export function generateSignedOtp(email: string, code: string, expiresAt: number): string {
  const normalized = email.trim().toLowerCase();
  const payload = `${normalized}:${code.trim()}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${expiresAt}.${hmac}`;
}

export function verifySignedOtp(
  email: string,
  code: string,
  signedToken?: string
): { valid: boolean; error?: string } {
  const normalized = email.trim().toLowerCase();
  const cleanCode = code ? code.trim() : '';

  if (!cleanCode || cleanCode.length !== 6) {
    return { valid: false, error: 'Please provide a valid 6-digit verification code' };
  }

  // 1. Try cryptographic token verification (stateless, works across all Vercel serverless instances)
  if (signedToken && signedToken.includes('.')) {
    const [expiresAtStr, hash] = signedToken.split('.');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }

    const payload = `${normalized}:${cleanCode}:${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    try {
      if (crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'))) {
        return { valid: true };
      }
    } catch {}
  }

  // 2. Fallback to memory store
  const memRecord = inMemoryOtps.get(normalized);
  if (memRecord) {
    if (Date.now() > memRecord.expiresAt) {
      inMemoryOtps.delete(normalized);
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }
    if (memRecord.code === cleanCode) {
      inMemoryOtps.delete(normalized);
      return { valid: true };
    }
  }

  // 3. Fallback to disk store
  try {
    const otps = getOtps();
    const diskRecord = otps[normalized];
    if (diskRecord) {
      if (Date.now() > diskRecord.expiresAt) {
        delete otps[normalized];
        try { fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8'); } catch {}
        return { valid: false, error: 'Verification code has expired. Please request a new one.' };
      }
      if (diskRecord.code === cleanCode) {
        delete otps[normalized];
        try { fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8'); } catch {}
        return { valid: true };
      }
    }
  } catch {}

  return { valid: false, error: 'Invalid verification code. Please check and try again.' };
}

export function getUsers(): UserRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_SEED_USERS, null, 2), 'utf-8');
      } catch {}
      return Array.from(inMemoryUsers.values());
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(raw) as UserRecord[];
    return users.length > 0 ? users : DEFAULT_SEED_USERS;
  } catch {
    return Array.from(inMemoryUsers.values());
  }
}

export function saveUser(user: UserRecord): boolean {
  const normalizedEmail = user.email.trim().toLowerCase();
  const record = { ...user, email: normalizedEmail };

  inMemoryUsers.set(normalizedEmail, record);

  try {
    const users = getUsers();
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existingIndex >= 0) {
      users[existingIndex] = record;
    } else {
      users.push(record);
    }
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {}

  return true;
}

export function findUserByEmail(email: string): UserRecord | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (inMemoryUsers.has(normalizedEmail)) {
    return inMemoryUsers.get(normalizedEmail) || null;
  }
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

export function resetPassword(email: string, newPass: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);
  if (!user) return false;

  user.password = newPass;
  inMemoryUsers.set(normalizedEmail, user);

  try {
    const users = getUsers();
    const diskUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (diskUser) {
      diskUser.password = newPass;
      ensureDataDir();
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    }
  } catch {}

  return true;
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
  const normalized = email.trim().toLowerCase();
  inMemoryOtps.set(normalized, { code, expiresAt });
  try {
    const otps = getOtps();
    otps[normalized] = { code, expiresAt };
    ensureDataDir();
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), 'utf-8');
  } catch {}
}

export function verifyAndConsumeOtp(
  email: string,
  code: string,
  signedToken?: string
): { valid: boolean; error?: string } {
  return verifySignedOtp(email, code, signedToken);
}
