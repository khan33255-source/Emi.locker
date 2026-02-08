
"use client";

import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Smartphone, Lock, ShieldAlert, Phone, CreditCard, Loader2, AlertCircle, RefreshCw, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

export default function DeviceSimulatedPage() {
  const { deviceId } = useParams();
  const firestore = useFirestore();
  const deviceRef = firestore ? doc(firestore, 'devices', deviceId as string) : null;
  const { data: device, loading } = useDoc<any>(deviceRef);
  const [booting, setBooting] = useState(true);

  // Simulate Boot Process
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || booting) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Smartphone size={64} className="text-zinc-800 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
             <RefreshCw className="h-6 w-6 text-white animate-spin opacity-50" />
          </div>
        </div>
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Emi.locker OS Loading...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <Smartphone size={64} className="mb-4 text-zinc-800" />
        <h1 className="text-xl font-bold">Hardware Error</h1>
        <p className="text-zinc-500">Device ID not registered in central registry.</p>
      </div>
    );
  }

  const isLocked = device.status === 'locked' || device.isLocked;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${isLocked ? 'bg-black' : 'bg-zinc-900'}`}>
      
      {/* Background overlay for "System Alert" feel */}
      {isLocked && <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-0" />}

      {/* Phone Frame */}
      <div className="relative w-full max-w-[400px] aspect-[9/19.5] bg-black rounded-[3.5rem] border-[12px] border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col z-10 scale-95 md:scale-100">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50 flex items-center justify-center gap-1.5 px-4">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="w-8 h-1 bg-zinc-800 rounded-full" />
        </div>
        
        {/* Screen Content */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-8 pt-16">
          {isLocked ? (
            <div className="w-full flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-20 duration-1000">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative h-28 w-28 bg-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <Lock size={56} className="text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-extrabold text-white uppercase tracking-tighter italic">LOCKED</h1>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner">
                   <p className="text-red-100 text-sm leading-relaxed font-medium">
                     {device.lockMessage || "Your device has been restricted. Unauthorized usage detected or EMI payment overdue."}
                   </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-transform active:scale-95 shadow-xl">
                  <CreditCard size={24} />
                  PAY AT SHOP
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" className="h-14 rounded-2xl gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/5">
                    <Phone size={18} className="text-green-500" />
                    Dialer
                  </Button>
                  <Button variant="ghost" className="h-14 rounded-2xl gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/5">
                    <ShieldAlert size={18} className="text-yellow-500" />
                    Emergency
                  </Button>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] pt-8">
                Device Owner: Emi.locker MDM v4.2
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center h-full space-y-10 text-zinc-600 animate-in fade-in duration-1000">
              <div className="relative">
                <Smartphone size={100} className="opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <Power size={40} className="text-emerald-500/50" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white">System Active</h2>
                <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 font-mono">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  PERSISTENT AGENT RUNNING
                </div>
              </div>

              <div className="w-full p-6 bg-zinc-800/30 rounded-3xl border border-white/5 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Security Profile</span>
                   <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500">ENFORCED</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subject:</span>
                    <span className="text-white font-medium">{device.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">IMEI Status:</span>
                    <span className="text-white font-medium">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">EMI Due:</span>
                    <span className="text-emerald-400 font-bold">{device.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Home Bar */}
        <div className="w-32 h-1.5 bg-zinc-800 mx-auto mb-3 rounded-full" />
      </div>
      
      {/* Side Label - Desktop Only */}
      <div className="hidden lg:flex flex-col fixed left-12 top-1/2 -translate-y-1/2 max-w-sm space-y-6">
        <div className="space-y-2">
          <h3 className="text-white text-3xl font-headline font-black flex items-center gap-3">
            <Smartphone className="text-accent" />
            Hardware Emulator
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            This simulator demonstrates the **Device Owner** behavior. Once the state is `Locked`, navigation is disabled and uninstallation (closing this tab) would be blocked on a real device.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Power size={16} />
            <AlertTitle className="text-xs font-bold uppercase">Persistence Test</AlertTitle>
            <AlertDescription className="text-[11px] opacity-80">
              Refresh the page (simulate restart). The lock screen will persist immediately if active in Firestore.
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-accent/10 border-accent/20 text-accent">
            <AlertCircle size={16} />
            <AlertTitle className="text-xs font-bold uppercase">Real-time Push</AlertTitle>
            <AlertDescription className="text-[11px] opacity-80">
              Trigger "Lock" from your main dashboard to see the instant lockdown transition.
            </AlertDescription>
          </Alert>
        </div>

        <div className="pt-4 border-t border-white/10">
           <p className="text-[10px] text-zinc-600 font-bold uppercase">Target: Etawah Deployment</p>
        </div>
      </div>
    </div>
  );
}
