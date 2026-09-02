'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignIn?: () => void;
}

export function RegisterDialog({
  isOpen,
  onClose,
  onOpenSignIn,
}: RegisterDialogProps) {
  const router = useRouter();

  // Step 1 = Enter Name & Email, Step 2 = Enter Code & Password
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form Fields
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [resendCountdown, setResendCountdown] = React.useState(60);

  const [otpToken, setOtpToken] = React.useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFullName('');
      setEmail('');
      setOtp('');
      setPassword('');
      setOtpToken('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Countdown timer for resending code
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send verification code');
        return;
      }

      if (data.otpToken) {
        setOtpToken(data.otpToken);
      }

      setStep(2);
      setResendCountdown(60);
      toast.success('Verification code sent!', {
        description: `Please check your email inbox at ${email}`,
      });
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          code: otp.trim(),
          password,
          otpToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid verification code');
        return;
      }

      // Save user session
      localStorage.setItem('cms_logged_in', 'true');
      localStorage.setItem('cms_user_email', email.trim());
      localStorage.setItem('cms_user_name', fullName.trim());

      toast.success('Account created successfully!', {
        description: `Welcome to ConstructCMS, ${fullName.trim()}!`,
      });
      onClose();
      router.push('/dashboard');
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Create Account' : 'Verify Code'}
      description={
        step === 1
          ? 'Enter your full name and email address to get started.'
          : `We sent a 6-digit code to ${email}. Please check your inbox.`
      }
      maxWidth="sm"
    >
      {step === 1 ? (
        /* STEP 1: Full Name & Email Address */
        <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Yonas Kebede"
                className="pl-9 h-10 text-sm text-foreground bg-muted/40"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="pl-9 h-10 text-sm text-foreground bg-muted/40"
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
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {onOpenSignIn && (
            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
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
          )}
        </form>
      ) : (
        /* STEP 2: Real Verification Code & Password */
        <form onSubmit={handleVerifyAndRegister} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Verification Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="pl-9 h-10 text-sm font-mono tracking-widest text-foreground bg-muted/40"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
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
                  const res = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success(`New code sent to ${email}`);
                  } else {
                    toast.error(data.error || 'Failed to resend code');
                  }
                } catch {
                  toast.error('Failed to resend code');
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
              Register
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
