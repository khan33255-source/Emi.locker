
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, Phone, KeyRound } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function VendorLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);
    
    const vendorsRef = collection(firestore, 'vendors');
    const q = query(vendorsRef, where('mobile', '==', mobile));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Shop Not Registered', description: 'This mobile number is not in our vendor database.' });
        setLoading(false);
        return;
      }
      setStep('otp');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registry Sync Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      if (otp === '123456') {
        await signInAnonymously(auth);
        router.push('/vendor/dashboard');
      } else {
        throw new Error('Invalid code');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-t-4 border-t-accent">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black italic uppercase text-primary">Vendor Portal</CardTitle>
          <CardDescription>Enter your mobile number to access your shop terminal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {step === 'phone' ? (
              <Input type="tel" placeholder="+91" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            ) : (
              <Input type="text" maxLength={6} placeholder="Test: 123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            )}
            <Button className="w-full bg-accent h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : step === 'phone' ? 'SEND CODE' : 'LOGIN'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
