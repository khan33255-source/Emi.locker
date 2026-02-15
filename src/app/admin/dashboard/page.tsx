"use client";

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, Lock, Unlock, ShieldAlert, Loader2, Zap, Activity, ArrowRight } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Auto-provisioning for specific Admin account
  useEffect(() => {
    if (user?.email === 'khan33255@gmail.com' && firestore) {
      const adminRef = doc(firestore, 'admins', user.uid);
      setDoc(adminRef, {
        name: user.displayName || 'Owner',
        mobile: 'N/A',
        role: 'super_admin',
        email: user.email,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  }, [user, firestore]);

  const vendorsQuery = useMemo(() => firestore ? collection(firestore, 'vendors') : null, [firestore]);
  const devicesQuery = useMemo(() => firestore ? collection(firestore, 'devices') : null, [firestore]);
  
  const { data: vendors, loading: loadingVendors } = useCollection<any>(vendorsQuery);
  const { data: devices, loading: loadingDevices } = useCollection<any>(devicesQuery);

  const stats = useMemo(() => {
    if (!devices) return null;
    return {
      total: devices.length,
      locked: devices.filter(d => d.isLocked).length,
      active: devices.filter(d => !d.isLocked).length,
      vendors: vendors?.length || 0
    };
  }, [devices, vendors]);

  if (loadingDevices || loadingVendors) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 animate-pulse">Establishing Command Link...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black italic text-primary tracking-tighter uppercase mb-2">Global Command</h1>
          <p className="text-muted-foreground font-medium text-xl">Full network oversight is active.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-accent hover:bg-accent/90 gap-2 h-14 px-8 rounded-2xl font-black italic uppercase shadow-xl shadow-accent/20" asChild>
            <Link href="/admin/vendors">
              Manage Vendors Registry
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Global Assets" value={stats?.total.toString() || '0'} icon={<Smartphone size={28} className="text-white" />} color="bg-primary" trend="Live Units" />
        <StatCard title="Total Locked" value={stats?.locked.toString() || '0'} icon={<Lock size={28} className="text-white" />} color="bg-red-600" trend="Restricted Access" />
        <StatCard title="Active Signal" value={stats?.active.toString() || '0'} icon={<Zap size={28} className="text-white" />} color="bg-emerald-600" trend="Unrestricted" />
        <StatCard title="Verified Shops" value={stats?.vendors.toString() || '0'} icon={<Users size={28} className="text-white" />} color="bg-accent" trend="Partner Registry" />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
          <CardHeader className="bg-slate-50 border-b p-10">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
               <Activity className="text-accent" />
               Live Network Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {devices?.slice(0, 8).map((device, i) => (
                <div key={i} className="flex items-center gap-6 p-8 hover:bg-slate-50">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${device.isLocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {device.isLocked ? <Lock size={24} /> : <Unlock size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black uppercase tracking-tight text-primary leading-none mb-1">{device.customerName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{device.model} • Shop: {device.vendorMobile || 'Direct'}</p>
                  </div>
                  <Badge className={device.isLocked ? 'bg-red-500' : 'bg-emerald-500'}>{device.isLocked ? 'LOCKED' : 'ACTIVE'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden rounded-[3rem] p-10">
          <CardHeader>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Security Protocol Enforcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-12">
            <div className="space-y-6">
              <DistributionRow label="System Active" count={stats?.active || 0} total={stats?.total || 1} color="bg-emerald-400" />
              <DistributionRow label="Enforced Restrictions" count={stats?.locked || 0} total={stats?.total || 1} color="bg-red-500" />
            </div>
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
               <p className="text-sm font-medium leading-relaxed italic text-white/70">
                 "Global oversight allows for master override of all hardware. Remote persistence is maintained via OS-level handshake."
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] font-black px-4 py-1.5 rounded-full text-white ${className}`}>{children}</span>;
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: string; icon: React.ReactNode; color: string; trend: string }) {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
      <CardContent className="flex items-center gap-8 p-8">
        <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl ${color}`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{title}</p>
          <div className="text-5xl font-black italic tracking-tighter text-primary leading-none mb-2">{value}</div>
          <p className="text-[9px] font-bold text-accent uppercase tracking-widest">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-end">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{label}</span>
          <span className="text-4xl font-black italic tracking-tighter">{percentage}%</span>
       </div>
       <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}