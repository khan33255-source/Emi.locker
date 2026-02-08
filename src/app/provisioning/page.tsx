
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, QrCode, Copy, Info, Download, Smartphone, Terminal, HardDrive, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProvisioningPage() {
  const { toast } = useToast();
  
  const provisioningJson = {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emilocker.mdm/.receiver.DeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://storage.googleapis.com/emilocker-assets/latest-agent.apk",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": "WkVYQkdIVFpLTU5PUE9SU1RVT1ZXWFlaQUJDREVGR0hJSktMTU5PUFFSU1RVVlc=",
    "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "firebase_project_id": "emilocker-a9f98",
      "server_url": window.location.origin,
      "auto_enroll": true,
      "policy": "strict_emi"
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(provisioningJson, null, 2));
    toast({
      title: "Configuration Copied",
      description: "Provisioning JSON is ready for your QR Generator.",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Provisioning Terminal</h1>
          <p className="text-muted-foreground text-lg">Deploy the Emi.locker Device Owner agent to new hardware in Etawah.</p>
        </div>
        <Badge variant="secondary" className="w-fit h-7 px-3 bg-accent/20 text-accent border-accent/20">
          Android Enterprise Ready
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1: Factory Reset */}
        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader>
            <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 mb-2">
              <RefreshCw size={20} />
            </div>
            <CardTitle className="text-lg">1. Factory Reset</CardTitle>
            <CardDescription>Device must be at the "Welcome" screen.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Clear any existing accounts (FRP). Tap the screen 7 times in the same spot to activate the hidden QR scanner.
          </CardContent>
        </Card>

        {/* Step 2: Scan QR */}
        <Card className="border-t-4 border-t-accent">
          <CardHeader>
            <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-2">
              <QrCode size={20} />
            </div>
            <CardTitle className="text-lg">2. Scan Configuration</CardTitle>
            <CardDescription>Link hardware to your cloud dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Connect to WiFi. Scan the generated QR code. The device will automatically download and set the MDM agent as **Device Owner**.
          </CardContent>
        </Card>

        {/* Step 3: Lockdown */}
        <Card className="border-t-4 border-t-destructive">
          <CardHeader>
            <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
              <Shield size={20} />
            </div>
            <CardTitle className="text-lg">3. Total Control</CardTitle>
            <CardDescription>Uninstallation is now impossible.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The agent now has high-level permissions to enforce Kiosk mode, block USB debugging, and prevent factory resets.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="text-accent" />
              Enrollment QR
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-6 bg-white rounded-3xl border shadow-inner flex items-center justify-center aspect-square w-full max-w-[280px]">
              <div className="relative group cursor-pointer">
                 <QrCode size={200} className="text-primary opacity-10 blur-[2px]" />
                 <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <Button variant="default" className="bg-accent hover:bg-accent/90 shadow-lg gap-2">
                       <Terminal size={16} />
                       Generate Master QR
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center px-4">Encryption: AES-256 Enabled</p>
                 </div>
              </div>
            </div>
            <div className="w-full space-y-3">
               <Alert className="bg-secondary/30 border-none">
                  <Info size={16} className="text-accent" />
                  <AlertDescription className="text-xs">
                    This QR embeds the DPC package location and Admin Extras for Firebase Auth.
                  </AlertDescription>
               </Alert>
               <Button variant="outline" className="w-full gap-2 border-accent text-accent hover:bg-accent/5">
                  <Download size={16} />
                  Print Deployment Label
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>DPC Configuration (JSON)</CardTitle>
              <CardDescription>Advanced manifest for Android Device Policy Controller.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="hover:bg-accent/10 hover:text-accent">
              <Copy size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="outline" className="text-[10px] uppercase opacity-50">v2.4</Badge>
                <Badge variant="outline" className="text-[10px] uppercase opacity-50">Production</Badge>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-6 rounded-xl text-xs font-mono overflow-x-auto h-[400px] border border-white/10 shadow-2xl leading-relaxed">
                {JSON.stringify(provisioningJson, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-none text-white overflow-hidden shadow-2xl">
        <div className="md:flex items-stretch">
          <div className="p-10 md:w-2/3 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3">
                <Cpu className="text-accent" />
                APK Integration Guide
              </h3>
              <p className="text-slate-400 text-sm">Follow these steps to generate your physical testing APK for Etawah deployment:</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">1</div>
                <div>
                  <p className="font-semibold text-sm">Download DPC Source</p>
                  <p className="text-xs text-slate-500">Get the Device Policy Controller boilerplate from GitHub (Android Enterprise samples).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">2</div>
                <div>
                  <p className="font-semibold text-sm">Set Firebase Endpoints</p>
                  <p className="text-xs text-slate-500">Point the APK to your project: <code className="text-accent">emilocker-a9f98.firebaseio.com</code></p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">3</div>
                <div>
                  <p className="font-semibold text-sm">Build Release APK</p>
                  <p className="text-xs text-slate-500">Run <code className="bg-slate-800 px-1 rounded text-pink-400">./gradlew assembleRelease</code> in Android Studio. Upload to your Storage bucket.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex w-1/3 bg-white/5 items-center justify-center p-8">
            <Smartphone size={160} className="text-white/10 rotate-12" />
          </div>
        </div>
      </Card>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { AlertDescription } from '@/components/ui/alert';
