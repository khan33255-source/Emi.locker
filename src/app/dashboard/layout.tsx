
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Users, LayoutDashboard, QrCode, LogOut, Settings, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use a slight delay or additional check to ensure Firebase Auth has settled
  useEffect(() => {
    if (isMounted && !loading && !user) {
      // Check if we are currently on the dashboard path
      if (window.location.pathname.startsWith('/dashboard')) {
        router.replace('/vendors/login');
      }
    }
  }, [user, loading, isMounted, router]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (!isMounted || (loading && !user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Synchronizing Authorization...</p>
      </div>
    );
  }

  // If we have a user, render. If not, the useEffect above will handle the redirect.
  // We don't block rendering if user exists even if loading is true (re-auth)
  if (!user && !loading) return null;

  return (
    <div className="flex min-h-screen bg-background font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col hidden md:flex border-r border-white/10">
        <div className="p-6">
          <Link className="flex items-center gap-2" href="/dashboard">
            <Shield className="h-6 w-6 text-accent" />
            <span className="font-headline font-bold text-lg text-white">Emi.locker</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/devices" icon={<Smartphone size={20} />} label="Managed Devices" />
          <NavItem href="/vendors/enroll" icon={<PlusCircle size={20} />} label="Enroll Customer" />
          <NavItem href="/admin/vendors" icon={<Users size={20} />} label="Vendors List" />
          <NavItem href="/provisioning" icon={<QrCode size={20} />} label="Provisioning" />
          <NavItem href="#" icon={<Settings size={20} />} label="Settings" />
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 hover:bg-white/10 text-primary-foreground/70 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-lg font-headline font-semibold text-primary">Control Center</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.phoneNumber || 'Faisal'}</p>
              <p className="text-xs text-muted-foreground">Authorized Superuser</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              FA
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
