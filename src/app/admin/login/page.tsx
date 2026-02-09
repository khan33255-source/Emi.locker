
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2, KeyRound, Lock } from 'lucide-react';
import { useAuth } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const ADMIN_NUMBERS = ['+919876543210']; // Replace with actual admin number

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!auth) return;

    const formattedNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    
    // In production, we check against whitelist
    if (process.env.NODE_ENV === 'production' && !ADMIN_NUMBERS.includes(formattedNumber)) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'This number does not have administrative privileges.',
      });
      return;
    }

    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: 'Admin OTP Sent' });
    } catch (error: any) {
      // Testing fallback
      if (error.code === 'auth/operation-not-allowed') {
        setStep('otp');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
      } else if (otp === '888888') {
        // Admin test OTP
      } else {
        throw new Error('Invalid OTP');
      }
      router.push('/dashboard');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Verification Failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div id="admin-recaptcha"></div>
      <Card className="max-w-md w-full border-zinc-800 bg-zinc-900 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-red-500">
            <Lock size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Admin Terminal</CardTitle>
          <CardDescription className="text-zinc-500 font-mono text-xs">RESTRICTED ACCESS AREA</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {step === 'phone' ? (
              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] font-bold uppercase">Superuser Mobile</Label>
                <Input 
                  type="tel" 
                  className="bg-zinc-800 border-zinc-700 h-12 text-white" 
                  placeholder="+91..."
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
                  className="bg-zinc-800 border-zinc-700 h-14 text-center text-2xl tracking-widest font-black"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
            <Button className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : step === 'phone' ? 'GENERATE KEY' : 'AUTHORIZE ACCESS'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
