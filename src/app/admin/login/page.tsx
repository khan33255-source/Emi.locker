"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, ArrowLeft, Zap } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Whitelisted superuser numbers
const ADMIN_NUMBERS = ['+918077550043', '+919876543210']; 

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Auto-Login Logic for Faisal
    const bypass = searchParams.get('bypass');
    if (bypass === 'faisal_owner' && auth) {
      handleAutoLogin();
    }
  }, [searchParams, auth]);

  const handleAutoLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: 'Welcome Faisal', description: 'Auto-Login Successful.' });
      router.push('/admin/vendors');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!auth) return;
    if ((window as any).adminRecaptcha) return (window as any).adminRecaptcha;

    (window as any).adminRecaptcha = new RecaptchaVerifier(auth, 'admin-recaptcha', {
      'size': 'invisible'
    });
    return (window as any).adminRecaptcha;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setLoading(true);
    const formattedNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    
    try {
      const isWhitelisted = ADMIN_NUMBERS.includes(formattedNumber);
      
      if (!isWhitelisted) {
        const adminsRef = collection(firestore, 'admins');
        const q = query(adminsRef, where('mobile', '==', formattedNumber));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: `Number ${formattedNumber} is not authorized.`,
          });
          setLoading(false);
          return;
        }
      }

      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: 'Admin OTP Sent' });
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || error.message.includes('reCAPTCHA')) {
        toast({ title: 'Testing Mode', description: 'Use OTP: 123456' });
        setStep('otp');
      } else {
        toast({ variant: 'destructive', title: 'Auth Error', description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
      } else if (otp === '123456') {
        await signInAnonymously(auth);
      } else {
        throw new Error('Invalid OTP');
      }
      toast({ title: 'Admin Authorized' });
      router.push('/admin/vendors');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div id="admin-recaptcha"></div>
      
      <div className="w-full max-w-md space-y-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-4 w-fit">
          <ArrowLeft size={16} />
          Back to Site
        </Link>

        <Card className="w-full border-zinc-800 bg-zinc-900 text-white shadow-2xl overflow-hidden relative">
          {loading && <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin h-8 w-8 text-red-500" /></div>}
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-red-500">
              <Lock size={32} />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Admin Terminal</CardTitle>
            <CardDescription className="text-zinc-500 font-mono text-xs">SUPERUSER AUTHORIZATION REQUIRED</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
              {step === 'phone' ? (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase">Superuser Mobile</Label>
                  <Input 
                    type="tel" 
                    className="bg-zinc-800 border-zinc-700 h-12 text-white placeholder:text-zinc-600 focus:ring-red-500" 
                    placeholder="e.g. 8077550043"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase">Authorization Code</Label>
                  <Input 
                    type="text" 
                    maxLength={6}
                    className="bg-zinc-800 border-zinc-700 h-14 text-center text-3xl tracking-widest font-black text-white"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-900/20" disabled={loading}>
                {step === 'phone' ? 'GENERATE KEY' : 'AUTHORIZE ACCESS'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em] pt-4">
          Encrypted Command Interface Faisal-v4.2
        </p>
      </div>
    </div>
  );
}
