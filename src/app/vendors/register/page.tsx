
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, CheckCircle2, ArrowLeft, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// SSR-safe image compression utility
const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export default function VendorRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    mobile: ''
  });

  const [aadharFront, setAadharFront] = useState<string | null>(null);
  const [aadharBack, setAadharBack] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<{ active: boolean; target: 'front' | 'back' | null }>({ active: false, target: null });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && cameraActive.active) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to capture Aadhar photos.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [cameraActive.active, mounted, toast]);

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      const rawBase64 = canvas.toDataURL('image/jpeg');
      const compressed = await compressImage(rawBase64);
      
      if (cameraActive.target === 'front') setAadharFront(compressed);
      if (cameraActive.target === 'back') setAadharBack(compressed);
      
      setCameraActive({ active: false, target: null });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const raw = event.target?.result as string;
        const compressed = await compressImage(raw);
        if (target === 'front') setAadharFront(compressed);
        if (target === 'back') setAadharBack(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setLoading(true);
    const vendorsRef = collection(firestore, 'vendors');
    
    const data = {
      ...formData,
      status: 'pending',
      devicesCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      aadharFront: aadharFront || '',
      aadharBack: aadharBack || '',
    };

    addDoc(vendorsRef, data)
      .then(() => {
        setSubmitted(true);
        setLoading(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'vendors',
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Submission Error',
          description: 'Failed to save shop details. Please try again.',
        });
      });
  };

  if (!mounted) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 animate-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-headline">Registration Submitted!</CardTitle>
            <CardDescription>
              Your vendor application for Emi.locker has been received. Our team will review your shop details within 24-48 hours.
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
            <CardDescription>Register your shop to start managing financed devices.</CardDescription>
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
                <Label className="text-base font-semibold">KYC Verification (Aadhar Card)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="relative overflow-hidden border-2 border-dashed group aspect-[4/3] flex flex-col items-center justify-center p-4">
                    {aadharFront ? (
                      <div className="w-full h-full relative">
                        <img src={aadharFront} alt="Front" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button size="icon" variant="destructive" onClick={() => setAadharFront(null)}>
                              <Trash2 size={16} />
                           </Button>
                           <Button size="icon" variant="secondary" onClick={() => setCameraActive({ active: true, target: 'front' })}>
                              <RefreshCw size={16} />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-xs font-medium mb-3">Front Side</div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setCameraActive({ active: true, target: 'front' })}>Photo</Button>
                          <Label className="cursor-pointer">
                            <Button type="button" variant="secondary" size="sm" asChild><span>Upload</span></Button>
                            <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
                          </Label>
                        </div>
                      </>
                    )}
                  </Card>

                  <Card className="relative overflow-hidden border-2 border-dashed group aspect-[4/3] flex flex-col items-center justify-center p-4">
                    {aadharBack ? (
                      <div className="w-full h-full relative">
                        <img src={aadharBack} alt="Back" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button size="icon" variant="destructive" onClick={() => setAadharBack(null)}>
                              <Trash2 size={16} />
                           </Button>
                           <Button size="icon" variant="secondary" onClick={() => setCameraActive({ active: true, target: 'back' })}>
                              <RefreshCw size={16} />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-xs font-medium mb-3">Back Side</div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setCameraActive({ active: true, target: 'back' })}>Photo</Button>
                          <Label className="cursor-pointer">
                            <Button type="button" variant="secondary" size="sm" asChild><span>Upload</span></Button>
                            <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
                          </Label>
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 h-12 text-lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cameraActive.active} onOpenChange={(open) => !open && setCameraActive({ active: false, target: null })}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Capture Aadhar Photo</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-zinc-900">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <Alert variant="destructive" className="bg-white"><AlertTitle>Camera Required</AlertTitle></Alert>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-white flex flex-row justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setCameraActive({ active: false, target: null })}>Cancel</Button>
            <Button className="rounded-full h-12 w-12 p-0 bg-accent hover:bg-accent/90" onClick={capturePhoto} disabled={!hasCameraPermission}>
              <div className="h-8 w-8 rounded-full border-4 border-white" />
            </Button>
            <div className="w-16" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
