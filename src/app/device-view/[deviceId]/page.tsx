
"use client";

import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Smartphone, Lock, ShieldAlert, Phone, CreditCard, Loader2, RefreshCw, Power, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useRef } from 'react';

export default function DeviceSimulatedPage() {
  const { deviceId } = useParams();
  const firestore = useFirestore();
  const deviceRef = firestore && deviceId ? doc(firestore, 'devices', deviceId as string) : null;
  const { data: device, loading } = useDoc<any>(deviceRef);
  const [booting, setBooting] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const bootTimer = setTimeout(() => setBooting(false), 1500);
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => {
      clearTimeout(bootTimer);
      clearInterval(interval);
    };
  }, []);

  const toggleFullScreen = () => {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (!mounted || loading || booting) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Smartphone size={64} className="text-zinc-800 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
             <RefreshCw className="h-6 w-6 text-white animate-spin opacity-50" />
          </div>
        </div>
        <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">Emi.locker OS Loading...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <ShieldAlert size={64} className="mb-4 text-destructive" />
        <h1 className="text-xl font-bold">Registry Error</h1>
        <p className="text-zinc-500 text-center max-w-xs">This hardware ID is not registered in the central Emi.locker database.</p>
        <Button variant="outline" className="mt-8 border-zinc-800 text-zinc-400" onClick={() => window.location.reload()}>
          Retry Sync
        </Button>
      </div>
    );
  }

  const isLocked = device.status === 'locked' || device.isLocked;

  return (
    <div ref={containerRef} className={`min-h-screen flex flex-col items-center justify-center p-0 transition-all duration-1000 ${isLocked ? 'bg-black' : 'bg-zinc-950'} overflow-hidden select-none`}>
      
      {isLocked && <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-0 pointer-events-none" />}

      <div className="relative w-full h-full max-w-md flex-1 flex flex-col z-10">
        
        <div className="h-8 flex items-center justify-between px-6 text-[10px] font-bold text-zinc-500 tracking-wider">
          <span>{currentTime || '--:--'}</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500/50">LTE</span>
            <div className="h-3 w-5 border border-zinc-700 rounded-sm relative p-[1px]">
               <div className="h-full bg-zinc-500 w-3/4 rounded-sm" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-between p-8 pt-12">
          {isLocked ? (
            <div className="w-full flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-10 duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative h-24 w-24 bg-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10">
                  <Lock size={48} className="text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">LOCKED</h1>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-inner">
                   <p className="text-red-100 text-sm leading-relaxed font-medium">
                     {device.lockMessage || "Device Restricted: EMI Payment Overdue. Contact your dealer immediately."}
                   </p>
                </div>
              </div>

              <div className="w-full space-y-4 pt-4">
                <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-transform active:scale-95 shadow-xl">
                  <CreditCard size={24} />
                  PAY NOW
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" className="h-14 rounded-2xl gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/5">
                    <Phone size={18} className="text-green-500" />
                    Support
                  </Button>
                  <Button variant="ghost" className="h-14 rounded-2xl gap-2 bg-white/5 text-white hover:bg-white/10 border border-white/5">
                    <ShieldAlert size={18} className="text-yellow-500" />
                    Emergency
                  </Button>
                </div>
              </div>

              <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em] pt-8">
                MDM PERSISTENCE ACTIVE
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center h-full space-y-10 text-zinc-600 animate-in fade-in duration-1000">
              <div className="relative">
                <Smartphone size={100} className="opacity-5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <Power size={40} className="text-emerald-500/40" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white">System Active</h2>
                <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 font-mono">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  PERSISTENT AGENT ENFORCED
                </div>
              </div>

              <div className="w-full p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Device Policy</span>
                   <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 bg-emerald-500/5">VERIFIED</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer:</span>
                    <span className="text-white font-medium">{device.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">IMEI:</span>
                    <span className="text-white font-medium">{device.imei?.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">EMI Next:</span>
                    <span className="text-emerald-400 font-bold">{device.dueDate}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFullScreen}
                className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 gap-2 hover:bg-white/5 mt-4"
              >
                <Maximize2 size={12} />
                Enter Immersive Mode
              </Button>
            </div>
          )}
        </div>

        <div className="w-24 h-1.5 bg-zinc-800 mx-auto mb-3 rounded-full opacity-50" />
      </div>

      {mounted && typeof document !== 'undefined' && !document.fullscreenElement && (
        <div className="fixed bottom-10 left-0 right-0 px-8 text-center pointer-events-none hidden md:block">
           <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">
             Hardware Emulator v4.2 | Etawah Test Unit
           </p>
        </div>
      )}
    </div>
  );
}
