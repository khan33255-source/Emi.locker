
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Lock, Unlock, Plus, Loader2, Phone, ShieldAlert } from 'lucide-react';
import { DeviceLockDialog } from '@/components/device-lock-dialog';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, updateDoc, doc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DevicesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Super Admin identification logic
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return user.phoneNumber === '+918077550043' || user.phoneNumber === '8077550043' || user.isAnonymous;
  }, [user]);

  // STRICT DATA FILTERING: Admin sees all, Vendors see only their own
  const devicesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    if (isSuperAdmin) {
      return collection(firestore, 'devices'); 
    }
    return query(collection(firestore, 'devices'), where('vendorId', '==', user.uid));
  }, [firestore, user, isSuperAdmin]);

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
      const deviceRef = doc(firestore, 'devices', device.id);
      updateDoc(deviceRef, { status: 'active', isLocked: false });
      toast({ title: "Signal Sent", description: "Unlock command broadcasted." });
    } else {
      setSelectedDevice(device);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-5xl font-black italic text-primary tracking-tighter uppercase mb-2">Portfolio Control</h1>
          <p className="text-muted-foreground font-medium text-lg">Real-time remote hardware enforcement.</p>
        </div>
        {!isSuperAdmin && (
          <Button className="bg-accent hover:bg-accent/90 gap-2 h-14 px-8 rounded-2xl font-black italic uppercase shadow-xl" asChild>
            <Link href="/vendors/enroll"><Plus size={20} />New Enrollment</Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input className="pl-12 h-14 bg-white text-lg rounded-2xl" placeholder="Search Customer or IMEI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices?.map((device) => (
            <Card key={device.id} className={`overflow-hidden transition-all shadow-xl ${device.isLocked ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
              <div className={`h-2 w-full ${device.isLocked ? 'bg-red-600' : 'bg-emerald-500'}`} />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Smartphone size={28} className={device.isLocked ? 'text-red-500' : 'text-primary'} />
                    <div>
                      <CardTitle className="text-xl font-black italic uppercase">{device.customerName}</CardTitle>
                      <CardDescription className="font-mono text-[10px]">ID: {device.customerId}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={device.isLocked ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}>
                    {device.isLocked ? 'LOCKED' : 'ACTIVE'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">IMEI 1</p>
                    <p className="font-mono font-bold">{device.imei1?.substring(0, 10)}...</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">EMI Due</p>
                    <p className="font-bold text-accent">₹{device.emiAmount}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <Button className="h-12 font-black italic bg-red-600 hover:bg-red-700" onClick={() => handleCommand(device, true)} disabled={device.isLocked}><Lock size={16} />LOCK</Button>
                   <Button className="h-12 font-black italic bg-emerald-600 hover:bg-emerald-700" onClick={() => handleCommand(device, false)} disabled={!device.isLocked}><Unlock size={16} />UNLOCK</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedDevice && (
        <DeviceLockDialog device={selectedDevice} onClose={() => setSelectedDevice(null)} onLock={() => setSelectedDevice(null)} />
      )}
    </div>
  );
}
