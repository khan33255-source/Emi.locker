"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, Phone } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function VendorLoginPage() {
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setLoading(true);
    const vendorsRef = collection(firestore, 'vendors');
    const q = query(vendorsRef, where('mobile', '==', mobile));

    try {
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Mobile number not registered. Please register your shop first.',
        });
        setLoading(false);
        return;
      }

      const vendorDoc = querySnapshot.docs[0];
      const vendorData = vendorDoc.data();

      if (vendorData.status === 'pending') {
        toast({
          title: 'Application Pending',
          description: 'Your shop is still under review. Please wait for admin approval.',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${vendorData.shopName}!`,
      });
      
      // Simulate session/cookie storage
      localStorage.setItem('vendor_id', vendorDoc.id);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'System Error',
        description: 'Unable to connect to login services.',
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

        <Card className="shadow-2xl border-t-4 border-t-accent bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline font-black text-primary">Vendor Portal</CardTitle>
            <CardDescription className="text-base">
              Enter your registered mobile number to access your control panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-bold text-primary uppercase tracking-wider">
                    Registered Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      id="mobile" 
                      type="tel" 
                      placeholder="98XXXXXXXX" 
                      required 
                      className="pl-10 h-12 text-lg border-primary/20 focus:border-accent"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 h-12 text-lg font-bold shadow-lg shadow-accent/20 transition-all active:scale-95">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Access Dashboard"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    New shop? {" "}
                    <Link href="/vendors/register" className="text-accent font-bold hover:underline">
                      Register Now
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
          Secure Hardware Access Enforced
        </p>
      </div>
    </div>
  );
}
