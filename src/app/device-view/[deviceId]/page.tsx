
"use client";

import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Smartphone, Lock, ShieldAlert, Phone, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DeviceSimulatedPage() {
  const { deviceId } = useParams();
  const firestore = useFirestore();
  const deviceRef = firestore ? doc(firestore, 'devices', deviceId as string) : null;
  const { data: device, loading } = useDoc<any>(deviceRef);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <Smartphone size={64} className="mb-4 text-zinc-800" />
        <h1 className="text-xl font-bold">Device Not Found</h1>
        <p className="text-zinc-500">The requested device ID is invalid.</p>
      </div>
    );
  }

  const isLocked = device.status === 'locked' || device.isLocked;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isLocked ? 'bg-red-950' : 'bg-zinc-900'}`}>
      {/* Phone Frame */}
      <div className="relative w-full max-w-[380px] aspect-[9/19] bg-black rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
        
        {/* Screen Content */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-8 pt-16">
          {isLocked ? (
            <div className="w-full flex flex-col items-center space-y-8 animate-in zoom-in duration-500">
              <div className="h-24 w-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <Lock size={48} className="text-white" />
              </div>
              
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Device Locked</h1>
                <div className="p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                   <p className="text-red-200 text-sm leading-relaxed">
                     {device.lockMessage || "Your device access has been restricted due to pending EMI payment. Please contact your vendor immediately."}
                   </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center gap-3 text-lg font-bold">
                  <CreditCard size={24} />
                  PAY EMI NOW
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="h-12 rounded-xl gap-2 bg-white/10 text-white hover:bg-white/20 border-white/10">
                    <Phone size={18} />
                    Support
                  </Button>
                  <Button variant="secondary" className="h-12 rounded-xl gap-2 bg-white/10 text-white hover:bg-white/20 border-white/10">
                    <ShieldAlert size={18} />
                    Emergency
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center h-full space-y-6 text-zinc-400">
              <Smartphone size={80} className="opacity-20" />
              <div className="text-center">
                <h2 className="text-lg font-medium text-white">Device Active</h2>
                <p className="text-xs">MDM Policy: Financial Shield Active</p>
              </div>
              <div className="w-full p-4 bg-zinc-800/50 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="text-white">{device.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="text-white">{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Due:</span>
                  <span className="text-white">{device.dueDate}</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-tighter opacity-30 mt-auto">System state: Unlocked</p>
            </div>
          )}
        </div>

        {/* Home Bar */}
        <div className="w-24 h-1 bg-zinc-700 mx-auto mb-4 rounded-full" />
      </div>
      
      {/* Side Label */}
      <div className="hidden lg:block absolute left-12 max-w-xs space-y-4">
        <h3 className="text-white text-2xl font-bold flex items-center gap-2">
          <Smartphone className="text-accent" />
          Device Emulator
        </h3>
        <p className="text-zinc-500 text-sm">
          This simulates a user's mobile device. When you trigger a lock command from the dashboard, this screen will update instantly in real-time.
        </p>
        <Alert className="bg-accent/10 border-accent/20 text-accent">
          <AlertTitle>Real-time Sync</AlertTitle>
          <AlertDescription>
            Firestore listeners are active. Try locking this device from the "Managed Devices" page.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
