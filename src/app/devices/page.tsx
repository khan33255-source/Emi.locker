"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Smartphone, Lock, Unlock, AlertCircle, Plus, MoreVertical } from 'lucide-react';
import { DeviceLockDialog } from '@/components/device-lock-dialog';

type Device = {
  id: string;
  imei: string;
  model: string;
  customer: string;
  status: 'active' | 'locked' | 'offline';
  emiAmount: number;
  dueDate: string;
  vendor: string;
};

const MOCK_DEVICES: Device[] = [
  { id: 'DEV-001', imei: '35422891002231', model: 'Samsung Galaxy A54', customer: 'Rahul Sharma', status: 'active', emiAmount: 2400, dueDate: '2024-06-15', vendor: 'City Mobile' },
  { id: 'DEV-002', imei: '86221004455219', model: 'Redmi Note 13 Pro', customer: 'Anita Singh', status: 'locked', emiAmount: 1850, dueDate: '2024-05-30', vendor: 'City Mobile' },
  { id: 'DEV-003', imei: '35991200114422', model: 'Vivo V29', customer: 'Vikram Adwani', status: 'active', emiAmount: 3200, dueDate: '2024-06-12', vendor: 'Galaxy Hub' },
  { id: 'DEV-004', imei: '86440022113355', model: 'Oppo Reno 10', customer: 'Sonia Gupta', status: 'offline', emiAmount: 2100, dueDate: '2024-06-10', vendor: 'City Mobile' },
];

export default function DevicesPage() {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const filteredDevices = devices.filter(d => 
    d.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.imei.includes(searchTerm)
  );

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map((device) => (
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
                <Badge variant={device.status === 'locked' ? 'destructive' : 'secondary'} className="capitalize">
                  {device.status}
                </Badge>
              </div>
              <CardTitle className="mt-4 text-lg font-headline">{device.model}</CardTitle>
              <CardDescription className="font-mono text-xs">{device.imei}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-semibold">Customer</p>
                  <p className="font-medium">{device.customer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-semibold">Due Date</p>
                  <p className="font-medium">{device.dueDate}</p>
                </div>
              </div>
              
              <div className="pt-4 flex gap-2">
                {device.status === 'active' ? (
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
                    disabled={device.status === 'offline'}
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
      </div>

      {selectedDevice && (
        <DeviceLockDialog 
          device={selectedDevice} 
          onClose={() => setSelectedDevice(null)} 
          onLock={(id) => {
             setDevices(prev => prev.map(d => d.id === id ? {...d, status: 'locked'} : d));
             setSelectedDevice(null);
          }}
        />
      )}
    </div>
  );
}