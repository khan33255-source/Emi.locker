
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone, Lock, UserCheck, BarChart3, Cloud, CheckCircle2, Globe, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-body selection:bg-accent/30 bg-slate-50">
      <header className="px-8 h-24 flex items-center border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-3" href="/">
          <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-3xl tracking-tighter text-primary leading-none italic uppercase">Emi.locker</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent mt-1">MDM SOLUTIONS</span>
          </div>
        </Link>
        <nav className="ml-auto flex gap-10 items-center">
          <Link className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors hidden md:block" href="#features">
            Protocols
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-black text-xs uppercase tracking-widest text-primary hover:bg-slate-100 px-6 rounded-xl" asChild>
              <Link href="/vendors/login">Login</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl shadow-2xl shadow-primary/30" asChild>
              <Link href="/vendors/register">Register Shop</Link>
            </Button>
          </div>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-32 md:py-48 overflow-hidden bg-primary">
          {/* Background Design Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
          
          <div className="container relative px-8 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <ShieldCheck size={16} />
              Multi-Vendor EMI Enforcement Terminal
            </div>
            <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter text-white mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 uppercase italic">
              ZERO CREDIT <br />
              <span className="text-accent underline underline-offset-8 decoration-white/10">DEFAULTS.</span>
            </h1>
            <p className="mx-auto max-w-[800px] text-slate-400 text-lg md:text-2xl mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 leading-relaxed font-medium">
              Enterprise-grade MDM for Etawah's mobile retail ecosystem. 
              <br className="hidden md:block"/>
              Automated IMEI tracking, remote persistence, and intelligent lock protocols.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-12 h-20 text-xl rounded-2xl shadow-2xl shadow-accent/40 font-black italic tracking-tighter" asChild>
                <Link href="/vendors/register">GET STARTED <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 h-20 px-12 text-xl rounded-2xl backdrop-blur-xl font-black italic tracking-tighter" asChild>
                <Link href="/vendors/login">VENDOR PORTAL</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Statistics Bar */}
        <section className="bg-white border-b border-slate-200">
          <div className="container px-8 mx-auto grid grid-cols-2 md:grid-cols-4 py-12 gap-8">
             <StatItem value="150+" label="Active Vendors" />
             <StatItem value="12,000+" label="Managed Devices" />
             <StatItem value="92%" label="Recovery Rate" />
             <StatItem value="0.5s" label="Lock Latency" />
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full py-32 bg-white">
          <div className="container px-8 mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-6xl font-headline font-black text-primary tracking-tighter uppercase italic">Security Infrastructure</h2>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
                Engineered for high-risk finance markets with persistent OS-level control.
              </p>
            </div>
            
            <div className="grid gap-10 lg:grid-cols-3">
              <FeatureCard 
                icon={<Lock size={32} className="text-accent" />}
                title="LUHN VALIDATION"
                description="Strict 15-digit IMEI algorithm check prevents registration of invalid or spoofed hardware IDs in your database."
              />
              <FeatureCard 
                icon={<Zap size={32} className="text-accent" />}
                title="INSTANT COMMANDS"
                description="Real-time LOCK/UNLOCK signals broadcasted via high-speed Firebase messaging for sub-second response times."
              />
              <FeatureCard 
                icon={<Smartphone size={32} className="text-accent" />}
                title="BARCODE SCANNING"
                description="Integrated camera-based IMEI scanner for vendors, reducing manual entry errors during customer enrollment."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 text-white py-20 px-8 border-t border-white/5">
        <div className="container mx-auto grid md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <span className="font-headline font-black text-2xl italic uppercase tracking-tighter">Emi.locker</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
              Etawah's leading mobile finance security solution. Empowering local retailers with persistent device control since 2024.
            </p>
            {/* Faisal Owner Bypass Link */}
            <Link href="/admin/login?bypass=faisal_owner" className="inline-flex items-center gap-2 text-[9px] text-zinc-700 hover:text-accent font-black uppercase tracking-[0.3em] transition-all group">
               SYSTEM ADMIN TERMINAL (FAISAL)
               <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-white/40">Core Protocols</h4>
            <ul className="text-sm space-y-4 text-zinc-500 font-bold">
              <li><Link href="#" className="hover:text-white transition-colors">DPC HANDSHAKE</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">IMEI VERIFICATION</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">KIOSK ENFORCEMENT</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-white/40">Resource Center</h4>
            <ul className="text-sm space-y-4 text-zinc-500 font-bold">
              <li><Link href="#" className="hover:text-white transition-colors">VENDOR AGREEMENT</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">PRIVACY POLICY</Link></li>
              <li><Link href="/provisioning" className="hover:text-white transition-colors">PROVISIONING TOOLS</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-white/40">Network Status</h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Global Cluster Active</span>
               </div>
               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                  Etawah Regional Hub V4.2 <br/>
                  Uptime: 99.99%
               </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-20 pt-10 border-t border-white/5 text-center text-[9px] text-zinc-800 font-black tracking-[0.5em] uppercase">
          © 2024 Emi.locker Security Systems. Developed for Faisal Etawah.
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-3xl font-black italic tracking-tighter text-primary mb-1 uppercase">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-accent/30 hover:shadow-3xl hover:shadow-accent/5 transition-all group">
      <div className="p-5 bg-white rounded-3xl w-fit mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black italic mb-4 text-primary uppercase tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
    </div>
  );
}
