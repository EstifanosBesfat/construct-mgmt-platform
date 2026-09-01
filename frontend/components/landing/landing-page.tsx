'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInDialog } from '@/components/auth/sign-in-dialog';
import { RegisterDialog } from '@/components/auth/register-dialog';
import { ForgotPasswordDialog } from '@/components/auth/forgot-password-dialog';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { MaterialStockSummaryItem } from '@/types';

export function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authAction = searchParams.get('auth');

  // Fetch real-time live counts from PostgreSQL backend
  const { data: dashboardData } = useDashboardSummary();

  const totalProjects = dashboardData?.projects?.total ?? 0;
  const totalMaterialsCount = dashboardData?.inventory?.totalMaterials ?? 0;
  const totalStockUnits =
    dashboardData?.materialStockSummary?.reduce(
      (sum: number, item: MaterialStockSummaryItem) => sum + Number(item.currentStock || 0),
      0
    ) ?? 0;

  const [signInOpen, setSignInOpen] = React.useState(false);
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [prefillEmail, setPrefillEmail] = React.useState('');

  React.useEffect(() => {
    if (authAction === 'signin') {
      setSignInOpen(true);
    }
  }, [authAction]);

  const handleOpenSignIn = (emailToPrefill?: string) => {
    if (emailToPrefill) {
      setPrefillEmail(emailToPrefill);
    }
    setSignInOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#EA580C]/30 font-sans">
      {/* Subtle architectural background grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Warm amber/orange atmospheric lighting flare */}
      <div className="absolute -top-32 -right-20 w-[700px] h-[700px] bg-gradient-to-bl from-orange-500/25 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Clean Top Header: Logo on left, Sign In pill on right */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 sm:h-9 w-32 sm:w-36">
            <Image
              src="/logo-dark.png"
              alt="ConstructCMS Logo"
              fill
              sizes="144px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </header>

      {/* 2. Main Hero Section (Large, Expanded Height) */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 py-6 sm:py-12 lg:py-16 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
          {/* Left Column: Big Bold Typography & CTA */}
          <div className="lg:col-span-5 space-y-7 text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold uppercase tracking-tight text-white leading-[1.06]">
                WE TURN <br />
                DREAMS TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400">
                  IDEAL REALITY
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Transforming ideas into stunning structures. Manage projects, warehouse inventory, and BOQ milestones with ease.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                size="default"
                onClick={() => setRegisterOpen(true)}
                className="bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-7 h-11 rounded-lg shadow-xl shadow-orange-600/30 transition-all group cursor-pointer"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleOpenSignIn()}
                className="border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 hover:text-white text-xs sm:text-sm px-6 h-11 rounded-lg backdrop-blur-md cursor-pointer"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Right Column: Expanded 3D Helmet Image with Floating Badges */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            {/* Enlarged 3D Helmet Container */}
            <div className="relative w-full max-w-[680px] aspect-[16/11] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950/40 backdrop-blur-sm group">
              <Image
                src="/hero-helmet.jpg"
                alt="Construction Safety Hard Hat"
                fill
                sizes="(max-width: 1024px) 100vw, 680px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Seamless atmospheric blending overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E131F] via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E131F]/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Pointer Badge 1: Successful Projects (Top Right) */}
              <div className="absolute top-[20%] right-[7%] z-20 flex items-center space-x-2 animate-in fade-in-0 duration-700">
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-white ring-4 ring-orange-500/40 animate-pulse" />
                  <div className="w-8 h-[1px] bg-gradient-to-r from-white to-transparent" />
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md text-left shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-orange-400 font-mono">
                      {totalProjects > 0 ? `${totalProjects}+` : `${totalProjects}`}
                    </span>
                    <span className="text-[10px] text-slate-300">successful projects</span>
                  </div>
                </div>
              </div>

              {/* Floating Pointer Badge 2: Materials Tracked (Middle Right) */}
              <div className="absolute top-[48%] right-[5%] z-20 flex items-center space-x-2 animate-in fade-in-0 duration-1000">
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-white ring-4 ring-orange-500/40 animate-pulse" />
                  <div className="w-8 h-[1px] bg-gradient-to-r from-white to-transparent" />
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md text-left shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white font-mono">
                      {totalMaterialsCount > 0 ? `${totalMaterialsCount}+` : `${totalMaterialsCount}`}
                    </span>
                    <span className="text-[10px] text-slate-300">materials tracked</span>
                  </div>
                </div>
              </div>

              {/* Floating Pointer Badge 3: BOQ Precision (Bottom Right) */}
              <div className="absolute bottom-[18%] right-[8%] z-20 flex items-center space-x-2 animate-in fade-in-0 duration-1000">
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-white ring-4 ring-orange-500/40 animate-pulse" />
                  <div className="w-8 h-[1px] bg-gradient-to-r from-white to-transparent" />
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md text-left shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-emerald-400 font-mono">100%</span>
                    <span className="text-[10px] text-slate-300">BOQ precision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Sleek Bottom Minimal Bar */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 font-medium">ConstructCMS</span>
            <span>•</span>
            <span>Enterprise Construction Management Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">All Systems Operational</span>
            </div>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Dialog Modals */}
      <SignInDialog
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onOpenRegister={() => setRegisterOpen(true)}
        onOpenForgotPassword={() => setForgotPasswordOpen(true)}
        prefillEmail={prefillEmail}
      />

      <RegisterDialog
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onOpenSignIn={handleOpenSignIn}
      />

      <ForgotPasswordDialog
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onOpenSignIn={handleOpenSignIn}
      />
    </div>
  );
}
