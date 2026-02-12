
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Lock, Unlock, Plus, Loader2, Zap, LayoutDashboard } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VendorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // VENDOR DATA ONLY
  const devicesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'devices'), where('vendorId', '==', user.uid));
  }, [firestore, user]);
  
  const { data: devices, loading } = useCollection<any>(devicesQuery);

  const stats = useMemo(() => {
    if (!devices) return null;
    return {
      total: devices.length,
      locked: devices.filter(d => d.isLocked).length,
      active: devices.filter(d => !d.isLocked).length,
    };
  }, [devices]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 animate-pulse">Syncing Shop Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black italic text-primary tracking-tighter uppercase mb-2">Shop Terminal</h1>
          <p className="text-muted-foreground font-medium text-xl">Securely manage your shop's hardware portfolio.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 gap-2 h-16 px-10 rounded-[2rem] font-black italic uppercase shadow-xl shadow-accent/20 text-lg" asChild>
          <Link href="/vendors/enroll">
            <Plus size={24} />
            Enroll Customer
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <StatCard title="Total Portfolio" value={stats?.total.toString() || '0'} icon={<Smartphone size={28} className="text-white" />} color="bg-primary" />
        <StatCard title="Restricted Units" value={stats?.locked.toString() || '0'} icon={<Lock size={28} className="text-white" />} color="bg-red-600" />
        <StatCard title="Active Signals" value={stats?.active.toString() || '0'} icon={<Zap size={28} className="text-white" />} color="bg-emerald-600" />
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
        <CardHeader className="bg-slate-50 border-b p-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
               <LayoutDashboard className="text-accent" />
               Managed Portfolio
            </CardTitle>
            <Button variant="outline" className="rounded-full font-bold uppercase text-[10px] tracking-widest h-10 px-6" asChild>
              <Link href="/devices">View All Inventory</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {devices?.slice(0, 5).map((device, i) => (
              <div key={i} className="flex items-center gap-6 p-8 hover:bg-slate-50">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${device.isLocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {device.isLocked ? <Lock size={24} /> : <Unlock size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black uppercase tracking-tight text-primary leading-none mb-1">{device.customerName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{device.model} • IMEI: {device.imei1?.substring(0, 10)}...</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest h-10 px-4 rounded-xl" asChild>
                      <Link href="/devices">Manage</Link>
                   </Button>
                   <span className={`text-[10px] font-black px-4 py-1.5 rounded-full text-white ${device.isLocked ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      {device.isLocked ? 'LOCKED' : 'ACTIVE'}
                   </span>
                </div>
              </div>
            ))}
            {!devices?.length && (
              <div className="p-32 text-center opacity-30">
                 <Smartphone size={64} className="mx-auto mb-4" />
                 <p className="text-primary font-black uppercase tracking-[0.3em]">No hardware assets registered.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
      <CardContent className="flex items-center gap-8 p-8">
        <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl ${color}`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{title}</p>
          <div className="text-5xl font-black italic tracking-tighter text-primary leading-none">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
