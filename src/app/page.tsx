import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone, Lock, UserCheck, BarChart3, Cloud } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Shield className="h-6 w-6 text-accent" />
          <span className="font-headline font-bold text-xl text-primary">Finance Shield MDM</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="/vendors/register">
            Vendor Registration
          </Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="/dashboard">
            Login
          </Link>
          <Button size="sm" className="bg-accent hover:bg-accent/90">
            Get Started
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Secure Your Mobile Finance Assets
                </h1>
                <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                  Enterprise-grade EMI Locker & MDM Solution. Protect your hardware investments with remote screen locking, kiosk mode, and full device ownership control.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-accent text-white hover:bg-accent/90 px-8 py-6 text-lg rounded-full" asChild>
                  <Link href="/dashboard">Access Dashboard</Link>
                </Button>
                <Button variant="outline" className="text-primary hover:bg-secondary px-8 py-6 text-lg rounded-full border-white/20" asChild>
                  <Link href="/vendors/register">Register as Vendor</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/10 rounded-2xl">
                  <Lock className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">Hardened EMI Locking</h3>
                <p className="text-muted-foreground">
                  Prevent uninstallation and enforce screen locks remotely when EMI payments are overdue. Fully managed via Android Device Owner APIs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/10 rounded-2xl">
                  <UserCheck className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">Vendor Ecosystem</h3>
                <p className="text-muted-foreground">
                  Multi-tenant architecture allowing vendors to manage their own customer portfolios while Super Admins maintain global oversight.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-accent/10 rounded-2xl">
                  <Cloud className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-headline font-bold">Cloud Sync & Control</h3>
                <p className="text-muted-foreground">
                  Real-time status updates and command delivery. Instant Kiosk Mode activation via Firebase Realtime Database.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 Finance Shield MDM Solutions. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}