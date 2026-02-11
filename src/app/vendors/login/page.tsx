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
    
    // Verify if vendor exists first
    const vendorsRef = collection(firestore, 'vendors');
    const q = query(vendorsRef, where('mobile', '==', mobile));

    try {
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Shop Not Registered',
          description: 'This mobile number is not in our vendor database.',
        });
        setLoading(false);
        return;
      }

      // Prototype Mode Bypass SMS to avoid Recaptcha/Carrier issues
      toast({
        title: 'Testing Mode Active',
        description: 'Verification code for prototype: 123456',
      });
      setStep('otp');
    } catch (error: any) {
      console.error('Login Error:', error);
      toast({
        variant: 'destructive',
        title: 'Registry Sync Error',
        description: error.message || 'Failed to sync with central database.',
      });
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
        // Secure Prototype Session
        await signInAnonymously(auth);
        toast({
          title: 'Login Successful',
          description: 'Accessing Control Center...',
        });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid Authorization Code');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'The code entered is incorrect.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-body">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft size={20} />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-accent" />
            <span className="font-headline font-bold text-2xl text-primary">Emi.locker</span>
          </div>
        </div>

        <Card className="shadow-2xl border-t-4 border-t-accent bg-card/50 backdrop-blur overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-accent">
              {step === 'phone' ? <Phone size={32} /> : <KeyRound size={32} />}
            </div>
            <CardTitle className="text-3xl font-headline font-black text-primary">
              {step === 'phone' ? 'Vendor Portal' : 'Identity Verification'}
            </CardTitle>
            <CardDescription className="text-base px-4">
              {step === 'phone' 
                ? 'Enter your registered shop mobile number to proceed.' 
                : 'Enter the 6-digit authorization code.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
              {step === 'phone' ? (
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-xs font-bold text-primary uppercase tracking-wider">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">+91</span>
                    <Input 
                      id="mobile" 
                      type="tel" 
                      placeholder="98XXXXXXXX" 
                      required 
                      className="pl-12 h-12 text-lg border-primary/20 focus:border-accent"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <Label htmlFor="otp" className="text-xs font-bold text-primary uppercase tracking-wider">
                    Enter Code (Test: 123456)
                  </Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    maxLength={6}
                    placeholder="000000" 
                    required 
                    className="h-14 text-center text-3xl font-black tracking-[0.5em] border-primary/20 focus:border-accent"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
              
              <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 h-12 text-lg font-bold shadow-lg shadow-accent/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : step === 'phone' ? 'SEND CODE' : 'AUTHORIZE ACCESS'}
              </Button>
              
              {step === 'otp' && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-xs" 
                  onClick={() => setStep('phone')}
                  disabled={loading}
                >
                  Change Mobile Number
                </Button>
              )}
            </form>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                New shop owner? {" "}
                <Link href="/vendors/register" className="text-accent font-bold hover:underline">
                  Register Shop
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
          Prototype Mode | Zero-Touch Authentication
        </p>
      </div>
    </div>
  );
}
