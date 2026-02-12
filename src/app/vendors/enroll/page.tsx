"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, UserPlus, CheckCircle2, Copy, Download, Loader2, ShieldAlert, Mail } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { validateIMEI } from '@/lib/imei-utils';
import Link from 'next/link';

export default function CustomerEnrollmentPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [enrolledId, setEnrolledId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [imeiError, setImeiError] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    imei: '',
    model: '',
    emiMonths: 12,
    emiAmount: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleImeiChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 15);
    setFormData({ ...formData, imei: cleaned });
    
    if (cleaned.length === 15) {
      if (!validateIMEI(cleaned)) {
        setImeiError("Invalid IMEI (Luhn check failed)");
      } else {
        setImeiError(null);
      }
    } else {
      setImeiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    if (!validateIMEI(formData.imei)) {
      setImeiError("Please provide a valid 15-digit IMEI");
      return;
    }

    setLoading(true);
    const devicesRef = collection(firestore, 'devices');
    
    const customerId = `EMI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const data = {
      ...formData,
      customerId,
      status: 'active',
      isLocked: false,
      lockMessage: '',
      vendorId: user.uid, // Dynamically link to the current vendor
      vendorMobile: user.phoneNumber || 'Unknown',
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };

    addDoc(devicesRef, data)
      .then((docRef) => {
        setEnrolledId(docRef.id);
        setLoading(false);
        toast({
          title: "Enrollment Finalized",
          description: `Device for ${data.customerName} registered successfully.`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'devices',
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
  };

  if (enrolledId) {
    const clientUrl = `${baseUrl}/device-view/${enrolledId}`;
    
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 animate-in zoom-in duration-300">
        <Card className="text-center p-8 border-accent shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-accent/10 text-accent rounded-full flex items-center justify-center border-4 border-accent/20">
              <CheckCircle2 size={56} />
            </div>
          </div>
          <CardTitle className="text-3xl font-black italic text-primary uppercase tracking-tighter">SUCCESS</CardTitle>
          <CardDescription className="mb-6 font-medium">
            Enrollment Token Generated. Device is now under MDM management.
          </CardDescription>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 shadow-inner">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">PROVISIONING TOKEN</p>
              <p className="font-mono font-bold text-accent tracking-widest">{enrolledId.substring(0, 12).toUpperCase()}</p> 
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Installation URL</Label>
              <div className="flex gap-2">
                <Input readOnly value={clientUrl} className="bg-muted font-mono text-xs" />
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => navigator.clipboard.writeText(clientUrl)}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <Button className="w-full h-14 gap-2 bg-primary text-white hover:bg-primary/90 font-black italic rounded-2xl" asChild>
               <Link href={clientUrl} target="_blank">
                  <Download size={18} />
                  SIMULATE ENFORCEMENT
               </Link>
            </Button>
            
            <Button variant="ghost" className="w-full font-bold text-xs uppercase tracking-widest" onClick={() => setEnrolledId(null)}>
              Start New Enrollment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
           <UserPlus size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tighter uppercase italic">Enrollment Terminal</h1>
          <p className="text-muted-foreground font-medium">Register hardware and link to your vendor profile.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-accent" />
            Core Identity Attributes
          </CardTitle>
          <CardDescription>All fields are required for secure device binding.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Legal Name</Label>
                <Input id="cname" required placeholder="Full Name" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</Label>
                <Input id="mobile" required placeholder="+91" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="customer@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12 pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hardware Model</Label>
                <Input id="model" required placeholder="e.g. Samsung A54" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="imei" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Device IMEI (15 Digits)</Label>
                  {imeiError && <span className="text-[10px] font-bold text-destructive animate-pulse">{imeiError}</span>}
                </div>
                <Input 
                  id="imei" 
                  required 
                  placeholder="Enter 15-digit IMEI" 
                  value={formData.imei}
                  onChange={(e) => handleImeiChange(e.target.value)}
                  className={`h-12 font-mono tracking-widest text-lg ${imeiError ? 'border-destructive' : ''}`}
                />
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                   <Smartphone size={18} />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest text-primary">Financial Schedule</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border">
                <div className="space-y-2">
                  <Label htmlFor="months" className="text-[10px] font-bold text-muted-foreground uppercase">Tenure (Months)</Label>
                  <Input id="months" type="number" value={formData.emiMonths} onChange={(e) => setFormData({...formData, emiMonths: parseInt(e.target.value)})} className="h-12 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Installment (₹)</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={formData.emiAmount} onChange={(e) => setFormData({...formData, emiAmount: parseFloat(e.target.value)})} className="h-12 bg-white" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading || !!imeiError} className="w-full bg-primary text-white hover:bg-primary/90 h-16 text-xl font-black italic tracking-tighter uppercase shadow-xl shadow-primary/20 rounded-2xl">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
              Secure Device Binding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
