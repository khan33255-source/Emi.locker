"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, Lock, Unlock, ShieldAlert, Loader2, Zap, Activity } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Faisal (Super Admin) identification logic
  // He can be identified by number or by anonymous status if using the Faisal bypass
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const isFaisalNumber = user.phoneNumber === '8077550043' || user.phoneNumber === '+918077550043';
    // In this prototype, an anonymous user is Faisal using the bypass
    return isFaisalNumber || user.isAnonymous;
  }, [user]);
  
  // Faisal sees all vendors, vendors see nothing in the vendor collection
  const vendorsQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'vendors');
  }, [firestore, isAdmin]);
  
  // The core Multi-Vendor Query Logic
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
        <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 animate-pulse">Syncing Control Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-5xl font-black italic text-primary tracking-tighter uppercase mb-2">
            {isAdmin ? 'Global Command' : 'Shop Terminal'}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            {isAdmin ? 'Real-time infrastructure monitoring for Etawah District.' : 'Hardware portfolio management for your shop.'}
          </p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex items-center gap-4 border border-white/5">
           <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
           <div className="text-xs">
              <p className="font-black uppercase tracking-widest text-[9px] opacity-50">Authorized Session</p>
              <p className="font-bold">{user?.phoneNumber || (isAdmin ? 'Faisal (Owner)' : 'Verified Vendor')}</p>
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Managed" 
          value={stats?.total.toString() || '0'} 
          icon={<Smartphone size={24} className="text-white" />} 
          color="bg-primary"
          trend="Hardware Assets" 
        />
        <StatCard 
          title="Remote Locked" 
          value={stats?.locked.toString() || '0'} 
          icon={<Lock size={24} className="text-white" />} 
          color="bg-destructive"
          trend="Persistent Restricted" 
        />
        <StatCard 
          title="Active Signal" 
          value={stats?.active.toString() || '0'} 
          icon={<Zap size={24} className="text-white" />} 
          color="bg-emerald-600"
          trend="Authorized Devices" 
        />
        {isAdmin && (
          <StatCard 
            title="Verified Shops" 
            value={stats?.vendors.toString() || '0'} 
            icon={<Users size={24} className="text-white" />} 
            color="bg-accent"
            trend="Partner Network" 
          />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-slate-50 border-b p-8">
            <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
               <Activity className="text-accent" />
               Recent Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {devices?.slice(0, 10).map((device, i) => (
                <div key={i} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${device.isLocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {device.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-tight text-primary">{device.customerName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{device.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${device.isLocked ? 'border-red-500/30 text-red-600 bg-red-50' : 'border-emerald-500/30 text-emerald-600 bg-emerald-50'}`}>
                       {device.isLocked ? 'LOCKED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
              {!devices?.length && (
                <div className="p-20 text-center">
                   <p className="text-slate-300 font-bold uppercase tracking-widest">No telemetry data available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden rounded-[2.5rem] relative">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldAlert size={200} />
           </div>
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black italic uppercase tracking-tight">Security Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
               <DistributionRow label="Enforced (Active)" count={stats?.active || 0} total={stats?.total || 1} color="bg-emerald-500" />
               <DistributionRow label="Restricted (Locked)" count={stats?.locked || 0} total={stats?.total || 1} color="bg-red-500" />
            </div>
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Protocol Note</p>
               <p className="text-xs font-medium leading-relaxed italic">"All restricted devices remain in Persistent Kiosk Mode with MDM handshake active until manually authorized."</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: string; icon: React.ReactNode; color: string; trend: string }) {
  return (
    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex items-center gap-6 p-6">
          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</p>
            <div className="text-4xl font-black italic tracking-tighter text-primary">{value}</div>
            <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-1">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-3">
       <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
          <span className="text-2xl font-black italic tracking-tighter">{percentage}%</span>
       </div>
       <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  );
}