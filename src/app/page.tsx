import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone, Lock, UserCheck, BarChart3, Cloud, CheckCircle2, Globe, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-body selection:bg-accent/30">
      <header className="px-6 h-20 flex items-center border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2.5" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <span className="font-headline font-extrabold text-2xl tracking-tighter text-primary">Emi.locker</span>
        </Link>
        <nav className="ml-auto flex gap-8 items-center">
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors hidden md:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="/vendors/login">
            Vendor Portal
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-bold" asChild>
              <Link href="/vendors/login">Login</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-white font-bold px-6 shadow-lg shadow-accent/20" asChild>
              <Link href="/vendors/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tech/1920/1080')] opacity-10 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80" />
          
          <div className="container relative px-4 md:px-6 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Zap size={14} />
              The #1 Choice for Mobile Finance in Etawah
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Secure Your Assets. <br />
              <span className="text-accent italic">Maximize Collections.</span>
            </h1>
            <p className="mx-auto max-w-[800px] text-slate-400 text-lg md:text-xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Emi.locker provides enterprise-grade MDM solutions for mobile retailers. 
              Reduce default rates by up to 90% with automated remote locking and persistent device control.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-10 h-16 text-lg rounded-2xl shadow-xl shadow-accent/20 font-black" asChild>
                <Link href="/vendors/register">REGISTER SHOP NOW</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/5 h-16 px-10 text-lg rounded-2xl backdrop-blur-sm font-bold" asChild>
                <Link href="/vendors/login">VENDOR LOGIN</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Feature Grid */}
        <section id="features" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">Enterprise Security Suite</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built specifically for the Indian mobile retail market, solving the real-world challenges of credit risk.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <FeatureCard 
                icon={<Lock className="h-8 w-8 text-accent" />}
                title="Instant EMI Locking"
                description="Remotely disable device screens with custom AI-generated messages when payments are overdue. Fully persistent through restarts."
              />
              <FeatureCard 
                icon={<Smartphone className="h-8 w-8 text-accent" />}
                title="DPC & PWA Support"
                description="Deploy via Master QR code as Device Owner, or use our lightweight PWA simulator for non-reset testing."
              />
              <FeatureCard 
                icon={<Globe className="h-8 w-8 text-accent" />}
                title="Real-time Command Center"
                description="Manage 10,000+ devices from a single dashboard. Track connectivity, lock status, and payment history instantly."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              <span className="font-headline font-bold text-xl">Emi.locker</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Etawah's leading mobile finance security solution. Empowering local retailers since 2024.
            </p>
            {/* Super Admin Bypass Access */}
            <Link href="/admin/login?bypass=faisal_owner" className="text-[10px] text-primary-foreground/20 hover:text-accent font-bold uppercase tracking-widest transition-colors mt-4 block">
               System Admin Access
            </Link>
          </div>
          <div>
            <h4 className="font-bold mb-4">Solution</h4>
            <ul className="text-sm space-y-2 text-primary-foreground/60">
              <li><Link href="#" className="hover:text-accent">DPC Deployment</Link></li>
              <li><Link href="#" className="hover:text-accent">PWA Enforcer</Link></li>
              <li><Link href="#" className="hover:text-accent">Kiosk Mode</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="text-sm space-y-2 text-primary-foreground/60">
              <li><Link href="#" className="hover:text-accent">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-accent">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <p className="text-sm text-primary-foreground/60">Etawah, Uttar Pradesh, India</p>
            <p className="text-sm text-primary-foreground/60 mt-1">support@emilocker.in</p>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-primary-foreground/40 font-bold tracking-widest uppercase">
          © 2024 Emi.locker MDM Solutions. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-accent/20 hover:shadow-2xl hover:shadow-accent/5 transition-all group">
      <div className="p-4 bg-accent/5 rounded-2xl w-fit mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-headline font-black mb-4 text-primary">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
