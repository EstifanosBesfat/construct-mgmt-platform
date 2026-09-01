'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutDialog({ isOpen, onClose }: LogoutDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirmLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Clear localStorage auth state
      localStorage.removeItem('cms_logged_in');
      localStorage.removeItem('cms_user_email');
      localStorage.removeItem('cms_user_name');

      // Clear authentication cookie
      document.cookie = 'cms_auth_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      setIsLoading(false);
      onClose();
      toast.success('You have been logged out safely.', {
        description: 'Please sign in again to access projects & inventory.',
      });
      router.push('/');
    }, 300);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Sign Out"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40">
          <AlertTriangle className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
          <div className="text-xs text-foreground leading-relaxed">
            <p className="font-semibold text-[#EA580C] mb-0.5">Are you sure you want to log out?</p>
            <p className="text-muted-foreground">
              You will need to sign in again to access projects, inventory, and BOQ milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isLoading}
            onClick={handleConfirmLogout}
            className="h-9 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Yes, Log Out
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
