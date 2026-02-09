"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const vendorsQuery = useMemo(() => firestore ? collection(firestore, 'vendors') : null, [firestore]);
  const devicesQuery = useMemo(() => firestore ? collection(firestore, 'devices') : null, [firestore]);
  
  const { data: vendors, loading: loadingVendors } = useCollection<any>(vendorsQuery);
  const { data: devices, loading: loadingDevices } = useCollection<any>(devicesQuery);

  const stats = useMemo(() => {
    if (!vendors || !devices) return null;
    
    return {
      totalDevices: devices.length,
      activeVendors: vendors.filter(v => v.status === 'active').length,
      lockedDevices: devices.filter(d => d.status === 'locked' || d.isLocked).length,
      pendingApprovals: vendors.filter(v => v.status === 'pending').length
    };
  }, [vendors, devices]);

  if (loadingVendors || loadingDevices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">System Overview</h1>
        <p className="text-muted-foreground">Monitor real-time status of managed devices and vendor accounts across Etawah.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Devices" 
          value={stats?.totalDevices.toLocaleString() || '0'} 
          icon={<Smartphone className="text-accent" />} 
          trend="Global managed assets" 
        />
        <StatCard 
          title="Active Vendors" 
          value={stats?.activeVendors.toLocaleString() || '0'} 
          icon={<Users className="text-accent" />} 
          trend="Verified mobile shops" 
        />
        <StatCard 
          title="Locked Devices" 
          value={stats?.lockedDevices.toLocaleString() || '0'} 
          icon={<Lock className="text-destructive" />} 
          trend={`${((stats?.lockedDevices || 0) / (stats?.totalDevices || 1) * 100).toFixed(1)}% of total`} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats?.pendingApprovals.toLocaleString() || '0'} 
          icon={<ShieldAlert className="text-yellow-500" />} 
          trend="KYC review required" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'Vendor: City Mobile', action: 'Locked Device #8821', time: '2 mins ago', icon: <Lock className="h-4 w-4 text-destructive" /> },
                { user: 'Super Admin', action: 'Approved Vendor: Galaxy Hub', time: '1 hour ago', icon: <Users className="h-4 w-4 text-accent" /> },
                { user: 'System', action: 'Device #4412 provisioned', time: '3 hours ago', icon: <Smartphone className="h-4 w-4 text-green-500" /> },
                { user: 'Vendor: City Mobile', action: 'Unlocked Device #1209', time: '5 hours ago', icon: <Unlock className="h-4 w-4 text-green-500" /> },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="p-2 rounded-full bg-background">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <div className="w-full h-full flex items-end justify-around gap-4 px-4 pb-4">
              <div className="w-full bg-accent/20 rounded-t-lg relative" style={{ height: '80%' }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">84% Active</span>
              </div>
              <div className="w-full bg-destructive/20 rounded-t-lg relative" style={{ height: '15%' }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-destructive">12% Locked</span>
              </div>
              <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '5%' }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">4% Offline</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 bg-accent/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
