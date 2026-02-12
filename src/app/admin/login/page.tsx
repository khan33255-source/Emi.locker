"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Whitelisted superuser numbers
const ADMIN_NUMBERS = ['8077550043', '+918077550043']; 

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // FAISAL AUTO-LOGIN BYPASS
    const bypass = searchParams.get('bypass');
    if (bypass === 'faisal_owner' && auth) {
      handleBypassLogin();
    }
  }, [searchParams, auth]);

  const handleBypassLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      // Faisal, please enable "Anonymous" provider in Firebase Console > Authentication
      await signInAnonymously(auth);
      toast({ title: 'OWNER ACCESS GRANTED', description: 'Welcome Faisal. System authorized.' });
      router.push('/dashboard');
    } catch (e: any) {
      console.error('Bypass error:', e);
      if (e.code === 'auth/admin-restricted-operation') {
        toast({ 
          variant: 'destructive', 
          title: 'Action Required', 
          description: 'Please Enable "Anonymous" sign-in in Firebase Console Authentication settings to use the bypass.' 
        });
      } else {
        toast({ variant: 'destructive', title: 'Bypass Failed', description: e.message });
      }
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setLoading(true);
    
    const cleanNumber = mobile.trim();
    if (ADMIN_NUMBERS.includes(cleanNumber) || ADMIN_NUMBERS.includes(`+91${cleanNumber}`)) {
      await handleBypassLogin();
      return;
    }

    try {
      const formattedNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;
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

      toast({ title: 'Testing Mode', description: 'Enter code 123456.' });
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
        toast({ title: 'Admin Authorized' });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid Code');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-body text-white">
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
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Superuser Mobile</Label>
                  <Input 
                    type="tel" 
                    className="bg-zinc-800 border-zinc-700 h-12 text-white placeholder:text-zinc-600 focus:ring-red-500" 
                    placeholder="e.g. 8077550043"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest text-center block">Enter Code (Test: 123456)</Label>
                  <Input 
                    type="text" 
                    maxLength={6}
                    className="bg-zinc-800 border-zinc-700 h-14 text-center text-3xl tracking-widest font-black text-white"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              )}
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold" disabled={loading}>
                {step === 'phone' ? 'ACCESS TERMINAL' : 'AUTHORIZE SESSION'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
          <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
            Note: If you encounter an "admin-restricted-operation" error, please enable **Anonymous Authentication** in your Firebase Console settings.
          </p>
        </div>
      </div>
    </div>
  );
}