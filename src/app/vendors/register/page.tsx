
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, CheckCircle2, ArrowLeft, Loader2, X, RefreshCw, Trash2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Image compression utility
const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
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
      resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality is plenty for KYC
    };
  });
};

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

  const [aadharFront, setAadharFront] = useState<string | null>(null);
  const [aadharBack, setAadharBack] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<{ active: boolean; target: 'front' | 'back' | null }>({ active: false, target: null });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera Permission Effect
  useEffect(() => {
    if (cameraActive.active) {
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
      // Stop stream when camera closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [cameraActive.active, toast]);

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
    
    // We save Base64 directly to Firestore as a backup to Storage
    const data = {
      ...formData,
      status: 'pending',
      devicesCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      aadharFront: aadharFront || '', // Saved as Base64 string
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
          description: 'Your shop details were saved, but there was an error with high-res images. Please try again or contact support.',
        });
      });
  };

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
              Your vendor application for Emi.locker has been received. Our team will review your shop details and Aadhar verification within 24-48 hours.
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
                <Label className="text-base font-semibold">KYC Verification (Aadhar Card)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front Side Card */}
                  <Card className="relative overflow-hidden border-2 border-dashed group">
                    {aadharFront ? (
                      <div className="aspect-[4/3] relative">
                        <img src={aadharFront} alt="Front" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button size="icon" variant="destructive" onClick={() => setAadharFront(null)}>
                              <Trash2 size={16} />
                           </Button>
                           <Button size="icon" variant="secondary" onClick={() => setCameraActive({ active: true, target: 'front' })}>
                              <RefreshCw size={16} />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                        <div className="text-sm font-medium">Front Side</div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCameraActive({ active: true, target: 'front' })}
                          >
                            Take Photo
                          </Button>
                          <Label className="cursor-pointer">
                            <Button type="button" variant="secondary" size="sm" asChild>
                              <span>Upload</span>
                            </Button>
                            <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
                          </Label>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Back Side Card */}
                  <Card className="relative overflow-hidden border-2 border-dashed group">
                    {aadharBack ? (
                      <div className="aspect-[4/3] relative">
                        <img src={aadharBack} alt="Back" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button size="icon" variant="destructive" onClick={() => setAadharBack(null)}>
                              <Trash2 size={16} />
                           </Button>
                           <Button size="icon" variant="secondary" onClick={() => setCameraActive({ active: true, target: 'back' })}>
                              <RefreshCw size={16} />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                        <div className="text-sm font-medium">Back Side</div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCameraActive({ active: true, target: 'back' })}
                          >
                            Take Photo
                          </Button>
                          <Label className="cursor-pointer">
                            <Button type="button" variant="secondary" size="sm" asChild>
                              <span>Upload</span>
                            </Button>
                            <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
                          </Label>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By registering, you agree to comply with MDM ethical usage guidelines. Your shop will be able to lock devices for genuine EMI defaults only. Photos are encrypted and compressed for security.
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

      {/* Camera Dialog */}
      <Dialog open={cameraActive.active} onOpenChange={(open) => !open && setCameraActive({ active: false, target: null })}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 bg-white">
            <DialogTitle>Capture Aadhar {cameraActive.target === 'front' ? 'Front' : 'Back'}</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video bg-zinc-900">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              muted 
              playsInline 
            />
            
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <Alert variant="destructive" className="bg-white">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to take photos.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-white flex flex-row justify-between items-center sm:justify-between">
            <Button variant="outline" onClick={() => setCameraActive({ active: false, target: null })}>
              Cancel
            </Button>
            <Button 
              className="rounded-full h-14 w-14 p-0 bg-accent hover:bg-accent/90 shadow-lg" 
              onClick={capturePhoto}
              disabled={!hasCameraPermission}
            >
              <div className="h-10 w-10 rounded-full border-4 border-white" />
            </Button>
            <div className="w-20" /> {/* Spacer */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
