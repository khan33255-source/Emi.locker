"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, UserPlus, CheckCircle2, Loader2, ShieldAlert, Mail, SmartphoneNfc } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { validateIMEI } from '@/lib/imei-utils';
import { ImeiScanner } from '@/components/imei-scanner';
import Link from 'next/link';

export default function CustomerEnrollmentPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [enrolledId, setEnrolledId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    imei1: '',
    imei2: '',
    model: '',
    emiMonths: 12,
    emiAmount: 0
  });

  const [errors, setErrors] = useState<{imei1?: string, imei2?: string}>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const validate = () => {
    const newErrors: {imei1?: string, imei2?: string} = {};
    if (!validateIMEI(formData.imei1)) newErrors.imei1 = "Invalid IMEI 1 (Luhn failed)";
    if (formData.imei2 && !validateIMEI(formData.imei2)) newErrors.imei2 = "Invalid IMEI 2 (Luhn failed)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    if (!validate()) {
      toast({ variant: 'destructive', title: 'Hardware Validation Failed', description: 'Please check your IMEI entries.' });
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
      vendorId: user.uid,
      vendorMobile: user.phoneNumber || 'Unknown',
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };

    addDoc(devicesRef, data)
      .then((docRef) => {
        setEnrolledId(docRef.id);
        setLoading(false);
        toast({ title: "Enrollment Finalized", description: `Device registered successfully.` });
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
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 animate-in zoom-in duration-300">
        <Card className="text-center p-8 border-accent shadow-2xl bg-zinc-950 text-white">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-accent/10 text-accent rounded-full flex items-center justify-center border-4 border-accent/20">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-2">PROVISIONING READY</CardTitle>
          <CardDescription className="mb-6 text-zinc-500">
            Handshake link generated. Scan via factory-reset device.
          </CardDescription>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">CUSTOMER</p>
              <p className="font-mono font-bold text-accent">{formData.customerName}</p> 
            </div>

            <Button className="w-full h-14 gap-2 bg-accent text-white hover:bg-accent/90 font-black italic rounded-2xl" asChild>
               <Link href={`/provisioning?id=${enrolledId}`}>
                  <SmartphoneNfc size={18} />
                  GENERATE QR MASTER
               </Link>
            </Button>
            
            <Button variant="ghost" className="w-full font-bold text-xs uppercase tracking-widest text-zinc-500" onClick={() => setEnrolledId(null)}>
              Register Another Device
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-zinc-900 border border-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-xl">
           <UserPlus size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tighter uppercase italic">Smart Enrollment</h1>
          <p className="text-muted-foreground font-medium">Link hardware assets with 15-digit Luhn validation.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden border-l-4 border-l-accent">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-accent" />
            Enrollment Manifest
          </CardTitle>
          <CardDescription>Multi-slot IMEI verification protocol.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Name</Label>
                <Input required placeholder="E.g. Rajesh Kumar" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                <Input required placeholder="+91" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Device Model</Label>
                <Input required placeholder="e.g. Realme Narzo 60" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input type="email" placeholder="customer@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">IMEI 1 (Required)</Label>
                  <ImeiScanner onScan={(imei) => setFormData({...formData, imei1: imei})} label="Scan Slot 1" />
                </div>
                <Input 
                  required 
                  placeholder="15-digit IMEI" 
                  value={formData.imei1}
                  onChange={(e) => setFormData({...formData, imei1: e.target.value.replace(/\D/g, '').substring(0, 15)})}
                  className={`h-12 font-mono ${errors.imei1 ? 'border-destructive' : ''}`}
                />
                {errors.imei1 && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.imei1}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">IMEI 2 (Optional)</Label>
                  <ImeiScanner onScan={(imei) => setFormData({...formData, imei2: imei})} label="Scan Slot 2" />
                </div>
                <Input 
                  placeholder="15-digit IMEI" 
                  value={formData.imei2}
                  onChange={(e) => setFormData({...formData, imei2: e.target.value.replace(/\D/g, '').substring(0, 15)})}
                  className={`h-12 font-mono ${errors.imei2 ? 'border-destructive' : ''}`}
                />
                {errors.imei2 && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.imei2}</p>}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 h-16 text-xl font-black italic uppercase tracking-tighter rounded-2xl">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
              SECURE DEVICE BINDING
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}