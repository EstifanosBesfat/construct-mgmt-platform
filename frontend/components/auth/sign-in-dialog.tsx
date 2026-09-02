'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenForgotPassword?: () => void;
  prefillEmail?: string;
}

export function SignInDialog({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenForgotPassword,
  prefillEmail,
}: SignInDialogProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset or pre-fill fields when opening dialog
  React.useEffect(() => {
    if (isOpen) {
      setEmail(prefillEmail || '');
      setPassword('');
      setIsLoading(false);
    }
  }, [isOpen, prefillEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid email or password');
        return;
      }

      localStorage.setItem('cms_logged_in', 'true');
      localStorage.setItem('cms_user_email', email.trim());
      if (data.user?.name) {
        localStorage.setItem('cms_user_name', data.user.name);
      }

      toast.success('Signed in successfully!', {
        description: `Welcome back to ConstructCMS`,
      });
      onClose();
      router.push('/dashboard');
    } catch {
      toast.error('Network error during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In"
      description="Enter your registered email and password to access your workspace."
      maxWidth="sm"
    >
      <form onSubmit={handleLogin} className="space-y-4 pt-1">
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
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Password
            </label>
            {onOpenForgotPassword && (
              <button
                type="button"
                className="text-[11px] text-[#EA580C] hover:underline cursor-pointer font-medium"
                onClick={() => {
                  onClose();
                  onOpenForgotPassword();
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="default"
            isLoading={isLoading}
            className="w-full h-10 text-sm font-semibold shadow-sm group cursor-pointer"
          >
            Sign In
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {onOpenRegister && (
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="text-[#EA580C] font-semibold hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>
        )}
      </form>
    </Dialog>
  );
}
