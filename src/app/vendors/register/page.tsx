
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function VendorRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    mobile: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'vendors'), {
        ...formData,
        status: 'pending',
        devicesCount: 0,
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Something went wrong while submitting your application.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-headline">Registration Submitted!</CardTitle>
            <CardDescription>
              Your vendor application for Emi.locker has been received. Our Super Admin team will review your details and Aadhar verification within 24-48 hours.
            </CardDescription>
          </div>
          <Button asChild className="w-full bg-accent hover:bg-accent/90">
            <Link href="/">Return to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-accent" />
            <span className="font-headline font-bold text-2xl text-primary">Emi.locker</span>
          </div>
        </div>

        <Card className="shadow-xl border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="text-2xl">Vendor Enrollment</CardTitle>
            <CardDescription>Register your shop to start managing financed devices. All applications require Super Admin approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input 
                    id="shop-name" 
                    placeholder="E.g. Galaxy Mobile Center" 
                    required 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner Name</Label>
                  <Input 
                    id="owner-name" 
                    placeholder="As per Aadhar" 
                    required 
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input 
                    id="mobile" 
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX" 
                    required 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">KYC Verification (Aadhar Card)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-accent" />
                    <div className="text-sm font-medium">Front Side</div>
                    <div className="text-xs text-muted-foreground">Upload or take photo</div>
                  </div>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-accent" />
                    <div className="text-sm font-medium">Back Side</div>
                    <div className="text-xs text-muted-foreground">Upload or take photo</div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By registering, you agree to comply with MDM ethical usage guidelines. Your shop will be able to lock devices for genuine EMI defaults only. Misuse may result in account termination.
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 h-12 text-lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
