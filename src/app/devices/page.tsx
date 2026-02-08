
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Lock, Unlock, Plus, MoreVertical, Loader2, ExternalLink } from 'lucide-react';
import { DeviceLockDialog } from '@/components/device-lock-dialog';
import { useCollection, useFirestore } from '@/firebase';
import { collection, updateDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

type Device = {
  id: string;
  imei: string;
  model: string;
  customerName: string;
  status: 'active' | 'locked' | 'offline';
  emiAmount: number;
  dueDate: string;
  vendorId: string;
  isLocked?: boolean;
};

export default function DevicesPage() {
  const firestore = useFirestore();
  const devicesQuery = useMemo(() => firestore ? collection(firestore, 'devices') : null, [firestore]);
  const { data: devices, loading } = useCollection<Device>(devicesQuery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const filteredDevices = devices?.filter(d => 
    d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.imei?.includes(searchTerm)
  );

  const handleUnlock = async (deviceId: string) => {
    if (!firestore) return;
    const deviceRef = doc(firestore, 'devices', deviceId);
    await updateDoc(deviceRef, {
      status: 'active',
      isLocked: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Managed Devices</h1>
          <p className="text-muted-foreground">Monitor and remotely control all registered mobile devices.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 gap-2">
          <Plus size={18} />
          Register New Device
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10 h-12" 
          placeholder="Search by Customer, IMEI or Device Model..." 
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
            <Card key={device.id} className="relative overflow-hidden hover:shadow-lg transition-all group">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                device.status === 'locked' ? 'bg-destructive' : 
                device.status === 'active' ? 'bg-green-500' : 'bg-muted'
              }`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                    <Smartphone size={24} />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={device.status === 'locked' ? 'destructive' : 'secondary'} className="capitalize">
                      {device.status}
                    </Badge>
                    <Link href={`/device-view/${device.id}`} target="_blank" className="text-muted-foreground hover:text-accent">
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
                <CardTitle className="mt-4 text-lg font-headline">{device.model}</CardTitle>
                <CardDescription className="font-mono text-xs">{device.imei}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold">Customer</p>
                    <p className="font-medium">{device.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold">Due Date</p>
                    <p className="font-medium">{device.dueDate}</p>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-2">
                  {device.status !== 'locked' ? (
                    <Button 
                      variant="destructive" 
                      className="flex-1 gap-2"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <Lock size={16} />
                      Remote Lock
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => handleUnlock(device.id)}
                    >
                      <Unlock size={16} />
                      Unlock Device
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!filteredDevices?.length && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
              No devices found matching your search.
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
