
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, ArrowLeft, ShieldAlert, AlertCircle } from 'lucide-react';
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
      // NOTE TO FAISAL: Enable "Anonymous" provider in Firebase Console > Authentication > Sign-in method
      await signInAnonymously(auth);
      toast({ title: 'OWNER ACCESS GRANTED', description: 'Session authorized for System Admin.' });
      router.push('/dashboard');
    } catch (e: any) {
      console.error('Bypass error:', e);
      if (e.code === 'auth/admin-restricted-operation') {
        setAuthError('ANONYMOUS_DISABLED');
        toast({ 
          variant: 'destructive', 
          title: 'Configuration Required', 
          description: 'Please enable "Anonymous" sign-in in your Firebase Console.' 
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
          description: `Superuser ${formattedNumber} not found in registry.`,
        });
        setLoading(false);
        return;
      }

      toast({ title: 'OTP Dispatched', description: 'Use test code 123456.' });
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
        toast({ title: 'Session Verified' });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid code entered.');
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
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs w-fit">
          <ArrowLeft size={16} />
          Return to Portal
        </Link>

        {authError === 'ANONYMOUS_DISABLED' && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-white animate-in slide-in-from-top-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Action Required: Enable Anonymous Auth</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-2">
              Faisal, the bypass requires <strong>Anonymous Sign-in</strong> to be enabled. 
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Go to Firebase Console</li>
                <li>Authentication &gt; Sign-in method</li>
                <li>Add "Anonymous" provider</li>
                <li>Click Enable & Save</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full border-zinc-800 bg-zinc-900 text-white shadow-2xl overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm gap-3">
              <Loader2 className="animate-spin h-10 w-10 text-red-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Authorizing Superuser...</p>
            </div>
          )}
          
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-red-500/10 w-20 h-20 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
              <Lock size={40} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">System Admin</CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em]">Restricted Infrastructure Access</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
              {step === 'phone' ? (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Admin ID (Mobile)</Label>
                  <Input 
                    type="tel" 
                    className="bg-zinc-800 border-zinc-700 h-14 text-white text-lg placeholder:text-zinc-600 focus:ring-red-500 rounded-xl" 
                    placeholder="8077550043"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest text-center block">Enter Security Code</Label>
                  <Input 
                    type="text" 
                    maxLength={6}
                    className="bg-zinc-800 border-zinc-700 h-16 text-center text-4xl tracking-[0.4em] font-black text-white rounded-xl"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                    required
                  />
                  <p className="text-[9px] text-center text-zinc-500 uppercase tracking-widest mt-2">Test Protocol: 123456</p>
                </div>
              )}
              <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wider rounded-xl shadow-xl shadow-red-900/20" disabled={loading}>
                {step === 'phone' ? 'ACTIVATE SESSION' : 'VERIFY IDENTITY'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
            Infrastructure V4.2 <br/>
            Owner: Faisal Etawah <br/>
            Security Level: Alpha-Global
          </p>
        </div>
      </div>
    </div>
  );
}
