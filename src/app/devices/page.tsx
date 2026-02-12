
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Smartphone, Lock, Unlock, Plus, MoreVertical, Loader2, ExternalLink, Phone, Copy, ShieldAlert } from 'lucide-react';
import { DeviceLockDialog } from '@/components/device-lock-dialog';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, updateDoc, doc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DevicesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Multi-vendor logic: only show devices for the logged-in vendor
  const devicesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'devices'), where('vendorId', '==', user.uid));
  }, [firestore, user]);

  const { data: devices, loading } = useCollection<any>(devicesQuery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  const filteredDevices = devices?.filter(d => 
    d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.imei1?.includes(searchTerm)
  );

  const handleCommand = async (device: any, targetLock: boolean) => {
    if (!firestore) return;
    
    if (!targetLock) {
      // Direct Unlock
      const deviceRef = doc(firestore, 'devices', device.id);
      updateDoc(deviceRef, { status: 'active', isLocked: false });
      toast({ title: "Command Sent", description: "Unlock signal broadcasted." });
    } else {
      // Open Lock Dialog
      setSelectedDevice(device);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-5xl font-black italic text-primary tracking-tighter uppercase mb-2">Portfolio Control</h1>
          <p className="text-muted-foreground font-medium text-lg">Real-time remote hardware persistence management.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 gap-2 h-14 px-8 rounded-2xl font-black italic uppercase shadow-xl shadow-accent/20" asChild>
          <Link href="/vendors/enroll">
            <Plus size={20} />
            New Enrollment
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input 
          className="pl-12 h-14 bg-white border-slate-200 text-lg rounded-2xl shadow-sm focus:ring-accent" 
          placeholder="Search Customer or IMEI..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Portfolio...</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices?.map((device) => (
            <Card key={device.id} className={`group relative overflow-hidden transition-all duration-500 border-none shadow-2xl ${
              device.isLocked ? 'bg-zinc-950 text-white' : 'bg-white'
            }`}>
              {/* Status Indicator Bar */}
              <div className={`h-2 w-full ${device.isLocked ? 'bg-destructive' : 'bg-emerald-500'}`} />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${device.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 text-primary'}`}>
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black italic uppercase tracking-tighter">{device.customerName}</CardTitle>
                      <CardDescription className={`font-mono text-[10px] ${device.isLocked ? 'text-zinc-500' : 'text-slate-400'}`}>ID: {device.customerId}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-widest rounded-lg px-2 py-1 ${
                    device.isLocked ? 'border-red-500/50 text-red-500 bg-red-500/5' : 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5'
                  }`}>
                    {device.isLocked ? 'RESTRICTED' : 'ENFORCED'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className={`p-4 rounded-2xl border ${device.isLocked ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'} grid grid-cols-2 gap-4 text-xs`}>
                  <div>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] mb-1">IMEI 1</p>
                    <p className="font-mono font-bold tracking-tighter">{device.imei1?.substring(0, 10)}...</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] mb-1">EMI Due</p>
                    <p className="font-bold text-accent">₹{device.emiAmount}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <Button 
                    className={`h-14 font-black italic rounded-2xl gap-2 transition-all active:scale-95 ${
                      device.isLocked ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                    }`}
                    onClick={() => handleCommand(device, true)}
                    disabled={device.isLocked}
                   >
                      <Lock size={18} />
                      LOCK
                   </Button>
                   <Button 
                    className={`h-14 font-black italic rounded-2xl gap-2 transition-all active:scale-95 ${
                      !device.isLocked ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
                    }`}
                    onClick={() => handleCommand(device, false)}
                    disabled={!device.isLocked}
                   >
                      <Unlock size={18} />
                      UNLOCK
                   </Button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" className="flex-1 font-bold text-[10px] uppercase tracking-widest gap-2" asChild>
                      <Link href={`/provisioning?id=${device.id}`} target="_blank">
                        <ShieldAlert size={14} />
                        QR Payload
                      </Link>
                   </Button>
                   <Button variant="ghost" size="sm" className="flex-1 font-bold text-[10px] uppercase tracking-widest gap-2">
                      <Phone size={14} />
                      Contact
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!filteredDevices?.length && (
            <div className="col-span-full text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
              <ShieldAlert size={64} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No hardware assets registered.</p>
            </div>
          )}
        </div>
      )}

      {selectedDevice && (
        <DeviceLockDialog 
          device={selectedDevice} 
          onClose={() => setSelectedDevice(null)} 
          onLock={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
