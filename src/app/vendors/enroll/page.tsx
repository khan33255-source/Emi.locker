
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, UserPlus, CheckCircle2, Loader2, ShieldAlert, SmartphoneNfc, QrCode, Copy, Download, RefreshCw } from 'lucide-react';
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
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    imei1: '',
    imei2: '',
    model: '',
    emiAmount: 0
  });

  const [errors, setErrors] = useState<{imei1?: string, imei2?: string}>({});

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
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please enter valid 15-digit IMEIs.' });
      return;
    }

    setLoading(true);

    // SORT IMEIs: Smallest first to prevent slot swapping errors
    const imeiArray = [formData.imei1, formData.imei2].filter(Boolean).sort((a, b) => a.localeCompare(b));
    const normalizedImei1 = imeiArray[0] || '';
    const normalizedImei2 = imeiArray[1] || '';

    const devicesRef = collection(firestore, 'devices');
    const customerId = `EMI-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const data = {
      ...formData,
      imei1: normalizedImei1,
      imei2: normalizedImei2,
      customerId,
      status: 'active',
      isLocked: false,
      lockMessage: '',
      vendorId: user.uid,
      vendorMobile: user.phoneNumber || 'Registered Vendor',
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };

    addDoc(devicesRef, data)
      .then((docRef) => {
        setEnrolledId(docRef.id);
        setLoading(false);
        toast({ title: "Enrollment Success", description: `Device ${normalizedImei1} registered.` });
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

  // QR PROVISIONING JSON
  const provisioningJson = enrolledId ? {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.afwsamples.testdpc/com.afwsamples.testdpc.DeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://github.com/googlesamples/android-testdpc/releases/download/v9.0.5/testdpc-9.0.5.apk",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "I5YvS0NGBicHn-N-V7Svi_88n5vU6t2y4I6E_6Y6U_w",
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "com.emilocker.mdm.DEVICE_ID": enrolledId,
      "com.emilocker.mdm.VENDOR_ID": user?.uid || 'unknown'
    }
  } : null;

  const copyPayload = () => {
    if (provisioningJson) {
      navigator.clipboard.writeText(JSON.stringify(provisioningJson, null, 2));
      toast({ title: "Payload Copied", description: "JSON copied to clipboard." });
    }
  };

  if (enrolledId && provisioningJson) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(provisioningJson))}`;

    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in zoom-in duration-500 font-body">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full items-center justify-center mb-4 border-2 border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase text-primary tracking-tighter">Enrollment Finalized</h1>
          <p className="text-muted-foreground font-medium">Device is now ready for remote MDM handshake.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <Card className="border-none shadow-2xl bg-primary text-white overflow-hidden rounded-[3rem]">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl font-black italic uppercase tracking-tighter">
                <QrCode className="text-accent" />
                Provisioning QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 px-10 pb-12">
              <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl w-full aspect-square flex items-center justify-center border-8 border-white/10">
                <img src={qrUrl} alt="Provisioning QR" className="w-full h-full" />
              </div>
              <p className="text-center text-[10px] opacity-60 font-black uppercase tracking-[0.2em]">
                Scan this code on the customer's factory-reset device (6-taps on welcome screen).
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
            <CardHeader className="bg-slate-50 border-b p-10">
              <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                <SmartphoneNfc className="text-accent" />
                Device Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                 <div className="flex justify-between border-b pb-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">IMEI 1 (Active)</span>
                    <span className="font-mono font-bold text-primary">{formData.imei1}</span>
                 </div>
                 <div className="flex justify-between border-b pb-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">IMEI 2 (Active)</span>
                    <span className="font-mono font-bold text-primary">{formData.imei2 || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between border-b pb-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Registry ID</span>
                    <span className="font-mono font-bold text-accent">{enrolledId}</span>
                 </div>
              </div>

              <div className="grid gap-3">
                 <Button variant="outline" className="h-14 font-black italic uppercase border-2 rounded-2xl gap-2" onClick={copyPayload}>
                    <Copy size={18} />
                    Copy JSON Payload
                 </Button>
                 <Button className="h-14 font-black italic uppercase bg-accent hover:bg-accent/90 rounded-2xl gap-2" onClick={() => setEnrolledId(null)}>
                    <RefreshCw size={18} />
                    Enroll New Device
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 font-body">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-zinc-900 border border-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-xl">
           <UserPlus size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tighter uppercase italic">Smart Enrollment</h1>
          <p className="text-muted-foreground font-medium">Link hardware assets with 15-digit Luhn validation.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden border-l-8 border-l-accent rounded-[2.5rem]">
        <CardHeader className="bg-slate-50 border-b p-10">
          <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-accent" />
            Hardware Binding Terminal
          </CardTitle>
          <CardDescription className="font-bold">Enter customer details and valid hardware IMEIs.</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Name</Label>
                <Input required placeholder="E.g. Rajesh Kumar" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="h-14 rounded-xl text-lg font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                <Input required placeholder="+91" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="h-14 rounded-xl text-lg font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Device Model</Label>
                <Input required placeholder="e.g. Realme C55" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="h-14 rounded-xl text-lg font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">EMI Amount (₹)</Label>
                <Input type="number" required placeholder="0.00" value={formData.emiAmount} onChange={(e) => setFormData({...formData, emiAmount: Number(e.target.value)})} className="h-14 rounded-xl text-lg font-bold" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">IMEI 1 (Required)</Label>
                  <ImeiScanner onScan={(imei) => setFormData({...formData, imei1: imei})} label="Scan Barcode" />
                </div>
                <Input 
                  required 
                  placeholder="15-digit IMEI" 
                  value={formData.imei1}
                  onChange={(e) => setFormData({...formData, imei1: e.target.value.replace(/\D/g, '').substring(0, 15)})}
                  className={`h-14 rounded-xl font-mono text-lg font-bold ${errors.imei1 ? 'border-destructive ring-destructive' : ''}`}
                />
                {errors.imei1 && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.imei1}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">IMEI 2 (Secondary)</Label>
                  <ImeiScanner onScan={(imei) => setFormData({...formData, imei2: imei})} label="Scan Barcode" />
                </div>
                <Input 
                  placeholder="15-digit IMEI" 
                  value={formData.imei2}
                  onChange={(e) => setFormData({...formData, imei2: e.target.value.replace(/\D/g, '').substring(0, 15)})}
                  className={`h-14 rounded-xl font-mono text-lg font-bold ${errors.imei2 ? 'border-destructive ring-destructive' : ''}`}
                />
                {errors.imei2 && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.imei2}</p>}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 h-20 text-2xl font-black italic uppercase tracking-tighter rounded-[2rem] shadow-2xl shadow-primary/20">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
              GENERATE PROVISIONING SIGNAL
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
