
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Faisal's Whitelisted numbers
const ADMIN_NUMBERS = ['8077550043', '+918077550043']; 

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // FAISAL AUTO-LOGIN BYPASS DETECTION
    const bypass = searchParams.get('bypass');
    if (bypass === 'faisal_owner' && auth) {
      handleBypassLogin();
    }
  }, [searchParams, auth]);

  const handleBypassLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setAuthError(null);
    try {
      await signInAnonymously(auth);
      toast({ title: 'OWNER ACCESS GRANTED', description: 'Redirecting to Global Command...' });
      router.push('/admin/dashboard');
    } catch (e: any) {
      console.error('Bypass error:', e);
      if (e.code === 'auth/admin-restricted-operation') {
        setAuthError('ANONYMOUS_DISABLED');
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
        toast({ variant: 'destructive', title: 'Access Denied', description: 'Admin ID not found in registry.' });
        setLoading(false);
        return;
      }

      setStep('otp');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Connection Error', description: error.message });
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
        router.push('/admin/dashboard');
      } else {
        throw new Error('Invalid code.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {authError === 'ANONYMOUS_DISABLED' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required: Enable Anonymous Auth</AlertTitle>
            <AlertDescription>Enable "Anonymous" sign-in in Firebase Console to use this bypass.</AlertDescription>
          </Alert>
        )}
        <Card className="w-full border-zinc-800 bg-zinc-900 text-white shadow-2xl overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm gap-3">
              <Loader2 className="animate-spin h-10 w-10 text-red-500" />
            </div>
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">System Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
              {step === 'phone' ? (
                <Input type="tel" className="bg-zinc-800 h-14 text-white" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              ) : (
                <Input type="text" maxLength={6} className="bg-zinc-800 h-14 text-white text-center text-2xl" placeholder="Test: 123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              )}
              <Button className="w-full h-14 bg-red-600 hover:bg-red-700 font-black uppercase italic" disabled={loading}>
                {step === 'phone' ? 'ACTIVATE SESSION' : 'VERIFY'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
