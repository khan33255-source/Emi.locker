
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, Lock, Unlock, ShieldAlert, Loader2, Zap, Activity } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Super Admin identification logic for Faisal
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const isFaisalNumber = user.phoneNumber === '8077550043' || user.phoneNumber === '+918077550043';
    // Faisal is also identified by the Anonymous session from the bypass
    return isFaisalNumber || user.isAnonymous;
  }, [user]);
  
  // Faisal sees all vendors, regular vendors see none
  const vendorsQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'vendors');
  }, [firestore, isAdmin]);
  
  // Multi-Vendor Telemetry Query
  const devicesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    
    // IF SUPER ADMIN: Fetch everything ("Sab dikhega")
    if (isAdmin) {
      return collection(firestore, 'devices');
    }
    
    // IF VENDOR: Only fetch their own enrollments
    return query(collection(firestore, 'devices'), where('vendorId', '==', user.uid));
  }, [firestore, user, isAdmin]);
  
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

  if (loadingDevices || (isAdmin && loadingVendors)) {
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
          <h1 className="text-6xl font-black italic text-primary tracking-tighter uppercase mb-2">
            {isAdmin ? 'Global Command' : 'Shop Terminal'}
          </h1>
          <p className="text-muted-foreground font-medium text-xl">
            {isAdmin 
              ? 'Faisal, you have full oversight of the Etawah mobile network.' 
              : 'Securely manage your shop\'s hardware portfolio.'}
          </p>
        </div>
        <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] flex items-center gap-5 border border-white/10 shadow-2xl">
           <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse" />
           <div className="text-xs">
              <p className="font-black uppercase tracking-[0.2em] text-[9px] text-white/40 mb-1">Session Identity</p>
              <p className="font-bold text-sm tracking-tight">{user?.phoneNumber || (isAdmin ? 'Faisal (Owner)' : 'Vendor')}</p>
           </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Global Assets" 
          value={stats?.total.toString() || '0'} 
          icon={<Smartphone size={28} className="text-white" />} 
          color="bg-primary"
          trend="Live Managed Units" 
        />
        <StatCard 
          title="Persistent Locked" 
          value={stats?.locked.toString() || '0'} 
          icon={<Lock size={28} className="text-white" />} 
          color="bg-red-600"
          trend="Default Restricted" 
        />
        <StatCard 
          title="Active Signal" 
          value={stats?.active.toString() || '0'} 
          icon={<Zap size={28} className="text-white" />} 
          color="bg-emerald-600"
          trend="Unrestricted Units" 
        />
        {isAdmin && (
          <StatCard 
            title="Verified Shops" 
            value={stats?.vendors.toString() || '0'} 
            icon={<Users size={28} className="text-white" />} 
            color="bg-accent"
            trend="Partner Registry" 
          />
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Card className="border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] bg-white overflow-hidden rounded-[3rem]">
          <CardHeader className="bg-slate-50 border-b p-10">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
               <Activity className="text-accent" />
               Network Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {devices?.slice(0, 8).map((device, i) => (
                <div key={i} className="flex items-center gap-6 p-8 hover:bg-slate-50 transition-all duration-300">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${device.isLocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {device.isLocked ? <Lock size={24} /> : <Unlock size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black uppercase tracking-tight text-primary leading-none mb-1">{device.customerName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{device.model} • IMEI: {device.imei1?.substring(0, 10)}...</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${device.isLocked ? 'border-red-500/30 text-red-600 bg-red-50' : 'border-emerald-500/30 text-emerald-600 bg-emerald-50'}`}>
                       {device.isLocked ? 'LOCKED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
              {!devices?.length && (
                <div className="p-32 text-center opacity-30">
                   <Smartphone size={64} className="mx-auto mb-4" />
                   <p className="text-primary font-black uppercase tracking-[0.3em]">No devices linked to registry.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden rounded-[3rem] relative">
           <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
              <ShieldAlert size={280} />
           </div>
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Enforcement Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            <div className="space-y-10">
               <DistributionRow label="Enforced Protocol" count={stats?.active || 0} total={stats?.total || 1} color="bg-emerald-400" />
               <DistributionRow label="Restricted Access" count={stats?.locked || 0} total={stats?.total || 1} color="bg-red-500" />
            </div>
            
            <div className="mt-auto p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4">Security Directive</h4>
               <p className="text-sm font-medium leading-relaxed italic text-white/70">
                 "Admin oversight allows for global override of all vendor-registered hardware. Remote persistence is maintained via OS-level DPC handshake until manually authorized."
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: string; icon: React.ReactNode; color: string; trend: string }) {
  return (
    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex items-center gap-8 p-8">
          <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{title}</p>
            <div className="text-5xl font-black italic tracking-tighter text-primary leading-none mb-2">{value}</div>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest">{trend}</p>
          </div>
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
       <div className="h-5 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
          <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.2)]`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}
