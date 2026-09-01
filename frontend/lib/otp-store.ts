// In-memory server-side store for active OTP codes
export type OtpRecord = {
  code: string;
  expiresAt: number;
};

// Use globalThis so Next.js API routes share the same map instance across requests
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}
