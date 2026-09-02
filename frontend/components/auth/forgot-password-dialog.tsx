'use client';

import * as React from 'react';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignIn: (prefillEmail?: string) => void;
}

export function ForgotPasswordDialog({
  isOpen,
  onClose,
  onOpenSignIn,
}: ForgotPasswordDialogProps) {
  // Step 1: Request Reset Code | Step 2: Verify Code & Set New Password
  const [step, setStep] = React.useState<1 | 2>(1);

  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [resendCountdown, setResendCountdown] = React.useState(60);

  const [otpToken, setOtpToken] = React.useState('');

  // Reset form on open
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpToken('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Resend timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCountdown]);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send reset code');
        return;
      }

      if (data.otpToken) {
        setOtpToken(data.otpToken);
      }

      setStep(2);
      setResendCountdown(60);
      toast.success('Password reset code sent!', {
        description: `Please check your email inbox at ${email}`,
      });
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: otp.trim(),
          newPassword: newPassword.trim(),
          otpToken,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!', {
        description: 'You can now sign in with your new password.',
      });
      onClose();
      onOpenSignIn(email.trim());
    } catch {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Reset Password' : 'Set New Password'}
      description={
        step === 1
          ? 'Enter your registered email address to receive a 6-digit reset code.'
          : `Enter the code sent to ${email} and your new password.`
      }
      maxWidth="sm"
    >
      {step === 1 ? (
        /* STEP 1: Email Address */
        <form onSubmit={handleSendResetCode} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Registered Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="pl-9 h-10 text-sm text-foreground bg-muted/40"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="default"
              isLoading={isLoading}
              className="w-full h-10 text-sm font-semibold shadow-sm group cursor-pointer"
            >
              Send Reset Code
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignIn();
                }}
                className="text-[#EA580C] font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      ) : (
        /* STEP 2: Code & New Password */
        <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              6-Digit Reset Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code from email"
                className="pl-9 h-10 text-sm font-mono tracking-widest text-foreground bg-muted/40"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new password (min 6 chars)"
                className="pl-9 pr-10 h-10 text-sm text-foreground bg-muted/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="pl-9 pr-10 h-10 text-sm text-foreground bg-muted/40"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] hover:underline cursor-pointer"
            >
              ← Change Email
            </button>
            <button
              type="button"
              disabled={resendCountdown > 0}
              onClick={async () => {
                setResendCountdown(60);
                try {
                  const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success(`New reset code sent to ${email}`);
                  } else {
                    toast.error(data.error || 'Failed to resend reset code');
                  }
                } catch {
                  toast.error('Failed to resend reset code');
                }
              }}
              className={`text-[11px] flex items-center ${
                resendCountdown > 0
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-[#EA580C] hover:underline cursor-pointer'
              }`}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="default"
              isLoading={isLoading}
              className="w-full h-10 text-sm font-semibold shadow-sm group cursor-pointer"
            >
              Reset Password
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
