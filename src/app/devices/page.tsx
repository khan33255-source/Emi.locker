
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Smartphone, Lock, Unlock, Plus, MoreVertical, Loader2, ExternalLink, Phone, Copy } from 'lucide-react';
import { DeviceLockDialog } from '@/components/device-lock-dialog';
import { useCollection, useFirestore } from '@/firebase';
import { collection, updateDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Device = {
  id: string;
  imei: string;
  model: string;
  customerName: string;
  customerId: string;
  status: 'active' | 'locked' | 'offline';
  emiAmount: number;
  dueDate: string;
  vendorId: string;
  isLocked?: boolean;
};

export default function DevicesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const devicesQuery = useMemo(() => firestore ? collection(firestore, 'devices') : null, [firestore]);
  const { data: devices, loading } = useCollection<Device>(devicesQuery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const filteredDevices = devices?.filter(d => 
    d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.imei?.includes(searchTerm) ||
    d.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLock = async (device: Device) => {
    if (!firestore) return;
    
    if (device.isLocked) {
      const deviceRef = doc(firestore, 'devices', device.id);
      updateDoc(deviceRef, {
        status: 'active',
        isLocked: false
      });
    } else {
      setSelectedDevice(device);
    }
  };

  const copySimLink = (id: string) => {
    const link = `${window.location.origin}/device-view/${id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Simulator Link Copied",
      description: "You can now paste this on the customer's phone.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Customer Portfolio</h1>
          <p className="text-muted-foreground">Monitor and manage remote status for your enrolled customers.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 gap-2" asChild>
          <Link href="/vendors/enroll">
            <Plus size={18} />
            New Enrollment
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10 h-12" 
          placeholder="Search by Customer, ID or IMEI..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices?.map((device) => (
            <Card key={device.id} className={`relative overflow-hidden hover:shadow-lg transition-all border-l-4 ${
              device.isLocked ? 'border-l-destructive' : 'border-l-green-500'
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-headline">{device.customerName}</CardTitle>
                      <CardDescription className="text-xs font-mono">{device.customerId || 'No ID'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link 
                      href={`/device-view/${device.id}`} 
                      target="_blank" 
                      className="text-accent hover:text-accent/80 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter"
                    >
                      <ExternalLink size={14} />
                      Simulate
                    </Link>
                    <button 
                      onClick={() => copySimLink(device.id)}
                      className="text-muted-foreground hover:text-primary flex items-center gap-1 text-[9px] font-bold uppercase"
                    >
                      <Copy size={10} />
                      Copy Link
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-3 rounded-lg grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold">Model</p>
                    <p className="font-medium truncate">{device.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold">EMI Due</p>
                    <p className="font-medium">₹{device.emiAmount}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-xl bg-white">
                  <div className="flex items-center gap-2">
                    {device.isLocked ? <Lock className="h-4 w-4 text-destructive" /> : <Unlock className="h-4 w-4 text-green-600" />}
                    <span className="text-sm font-semibold">{device.isLocked ? 'Device Locked' : 'Device Active'}</span>
                  </div>
                  <Switch 
                    checked={device.isLocked} 
                    onCheckedChange={() => toggleLock(device)}
                    className="data-[state=checked]:bg-destructive"
                  />
                </div>

                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Phone size={14} />
                      Call
                   </Button>
                   <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical size={16} />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!filteredDevices?.length && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
              No customers found. Start by enrolling a new device.
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
