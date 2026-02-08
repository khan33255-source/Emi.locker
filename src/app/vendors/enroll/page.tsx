"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, UserPlus, CheckCircle2, Copy, Download, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function CustomerEnrollmentPage() {
  const [loading, setLoading] = useState(false);
  const [enrolledId, setEnrolledId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setLoading(true);
    const devicesRef = collection(firestore, 'devices');
    
    const customerId = `EMI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const data = {
      ...formData,
      customerId,
      status: 'active',
      isLocked: false,
      lockMessage: '',
      vendorId: 'vendor-123', // Static for prototype
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };

    addDoc(devicesRef, data)
      .then((docRef) => {
        setEnrolledId(docRef.id);
        setLoading(false);
        toast({
          title: "Enrollment Successful",
          description: `Customer ${data.customerName} has been registered.`,
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
        <Card className="text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline mb-2">Device Enrolled!</CardTitle>
          <CardDescription className="mb-6">
            The device has been successfully linked to Emi.locker.
          </CardDescription>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Customer ID</p>
              <p className="font-mono font-bold text-primary">EMI-4429-XXXX</p> 
            </div>

            <div className="space-y-2">
              <Label>Client App Installation Link</Label>
              <div className="flex gap-2">
                <Input readOnly value={clientUrl} className="bg-muted" />
                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(clientUrl)}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <Button className="w-full gap-2 bg-accent hover:bg-accent/90" asChild>
               <Link href={clientUrl} target="_blank">
                  <Download size={18} />
                  Simulate Client App
               </Link>
            </Button>
            
            <Button variant="ghost" className="w-full" onClick={() => setEnrolledId(null)}>
              Enroll Another Customer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">New Enrollment</h1>
        <p className="text-muted-foreground">Register a new device and set up the EMI payment schedule.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserPlus className="text-accent" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cname">Customer Name</Label>
                <Input 
                  id="cname" 
                  required 
                  placeholder="Full Name" 
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input 
                  id="mobile" 
                  required 
                  placeholder="+91" 
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Device Model</Label>
                <Input 
                  id="model" 
                  required 
                  placeholder="e.g. Samsung Galaxy S23" 
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI Number</Label>
                <Input 
                  id="imei" 
                  required 
                  placeholder="15-digit IMEI" 
                  value={formData.imei}
                  onChange={(e) => setFormData({...formData, imei: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-accent" />
                EMI Terms
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="months">Total Months</Label>
                  <Input 
                    id="months" 
                    type="number" 
                    value={formData.emiMonths}
                    onChange={(e) => setFormData({...formData, emiMonths: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monthly EMI (₹)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="2500" 
                    value={formData.emiAmount}
                    onChange={(e) => setFormData({...formData, emiAmount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 h-12 text-lg">
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Finalize Enrollment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
