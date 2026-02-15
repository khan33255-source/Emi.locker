"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Smartphone, Users, LayoutDashboard, QrCode, LogOut, Settings, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Super Admin detection logic
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const isOwnerPhone = user.phoneNumber === '+918077550043' || user.phoneNumber === '8077550043';
    const isOwnerEmail = user.email === 'khan33255@gmail.com';
    return isOwnerPhone || isOwnerEmail || user.isAnonymous;
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !userLoading) {
      if (!user) {
        if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/vendors/login') && pathname !== '/') {
           router.replace('/vendors/login');
        }
        return;
      }

      // ROUTE PROTECTION: Prevent vendors from entering admin routes
      if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !isSuperAdmin) {
        router.replace('/vendor/dashboard');
      }

      // REDIRECTION LOGIC FOR DASHBOARD HOME
      if (pathname === '/dashboard') {
        if (isSuperAdmin) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/vendor/dashboard');
        }
      }
    }
  }, [user, userLoading, isMounted, pathname, router, isSuperAdmin]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (!isMounted) return null;

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Verifying Security Clearances...</p>
      </div>
    );
  }

  // Hide layout for login pages
  const isLoginPage = pathname.startsWith('/admin/login') || pathname.startsWith('/vendors/login') || pathname === '/';
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background font-body">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col hidden md:flex border-r border-white/10">
        <div className="p-6">
          <Link className="flex items-center gap-2" href={isSuperAdmin ? "/admin/dashboard" : "/vendor/dashboard"}>
            <Shield className="h-6 w-6 text-accent" />
            <span className="font-headline font-bold text-lg text-white">Emi.locker</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem href={isSuperAdmin ? "/admin/dashboard" : "/vendor/dashboard"} icon={<LayoutDashboard size={20} />} label="Command Center" />
          <NavItem href="/devices" icon={<Smartphone size={20} />} label="Portfolio" />
          {!isSuperAdmin && <NavItem href="/vendors/enroll" icon={<PlusCircle size={20} />} label="Enroll Asset" />}
          {isSuperAdmin && <NavItem href="/admin/vendors" icon={<Users size={20} />} label="Partner Registry" />}
          <NavItem href="/provisioning" icon={<QrCode size={20} />} label="Provisioning" />
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start gap-2 text-primary-foreground/70 hover:text-white" onClick={handleSignOut}>
            <LogOut size={20} />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-lg font-headline font-black italic uppercase tracking-tight text-primary">
            {isSuperAdmin ? 'Global Terminal' : 'Shop Terminal'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black uppercase text-primary leading-none mb-1">{isSuperAdmin ? 'Command' : 'Verified Partner'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isSuperAdmin ? 'Full Override' : 'Authorized Access'}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white font-black italic shadow-lg shadow-accent/20">
              {isSuperAdmin ? 'SA' : 'VN'}
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
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20 translate-x-1' : 'text-primary-foreground/60 hover:text-white hover:translate-x-1'}`}>
      {icon}
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}