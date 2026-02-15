"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, Lock, Unlock, Plus, Loader2, Zap, LayoutDashboard, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VendorDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // STRICT DATA ISOLATION: Vendor only sees their own customers
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
          <p className="text-muted-foreground font-medium text-xl">Managing your verified hardware portfolio.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 gap-2 h-16 px-10 rounded-[2rem] font-black italic uppercase shadow-xl shadow-accent/20 text-lg" asChild>
          <Link href="/vendors/enroll">
            <Plus size={24} />
            Enroll Asset
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <StatCard title="Total Assets" value={stats?.total.toString() || '0'} icon={<Smartphone size={28} className="text-white" />} color="bg-primary" />
        <StatCard title="Restricted" value={stats?.locked.toString() || '0'} icon={<Lock size={28} className="text-white" />} color="bg-red-600" />
        <StatCard title="Active Signals" value={stats?.active.toString() || '0'} icon={<Zap size={28} className="text-white" />} color="bg-emerald-600" />
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
        <CardHeader className="bg-slate-50 border-b p-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-primary">
                 <LayoutDashboard className="text-accent" />
                 Customer Registry
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed view of your enrolled customers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-none">
                <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14 pl-10">Customer Name</TableHead>
                <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Mobile Number</TableHead>
                <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Email Address</TableHead>
                <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Device Status</TableHead>
                <TableHead className="text-right font-black text-primary uppercase text-[10px] tracking-widest h-14 pr-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices?.map((device, i) => (
                <TableRow key={i} className="hover:bg-accent/5 border-slate-100 transition-colors h-20">
                  <TableCell className="pl-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                        <User size={18} />
                      </div>
                      <span className="font-black uppercase tracking-tight text-primary">{device.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-accent" />
                      {device.mobile}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-accent" />
                      {device.email || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`font-black italic text-[9px] px-3 py-1 rounded-full border-none ${device.isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {device.isLocked ? 'LOCKED' : 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-accent hover:text-white" asChild>
                      <Link href="/devices">Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!devices?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="p-32 text-center opacity-30">
                    <Smartphone size={64} className="mx-auto mb-4" />
                    <p className="text-primary font-black uppercase tracking-[0.3em]">No customer assets enrolled in this terminal.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
      <CardContent className="flex items-center gap-8 p-8">
        <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500 ${color}`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{title}</p>
          <div className="text-5xl font-black italic tracking-tighter text-primary leading-none">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}