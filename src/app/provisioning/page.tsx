
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, QrCode, Copy, Info, Download, Smartphone, Terminal, Cpu, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProvisioningPage() {
  const { toast } = useToast();
  
  const provisioningJson = {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emilocker.mdm/.receiver.DeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://storage.googleapis.com/emilocker-assets/latest-agent.apk",
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "firebase_project_id": "emilocker-a9f98",
      "server_url": typeof window !== 'undefined' ? window.location.origin : '',
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
          <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Deployment Terminal</h1>
          <p className="text-muted-foreground text-lg">Manage device enrollment and "Web App" simulation for local testing.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="h-7 px-3 bg-accent/20 text-accent border-accent/20">
            Web-Simulator v4.2
          </Badge>
          <Badge variant="outline" className="h-7 px-3 border-emerald-500/20 text-emerald-500">
            PWA Enabled
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Web App Deployment - FASTEST FOR ETAWAH */}
         <Card className="border-accent shadow-lg bg-accent/5">
            <CardHeader>
               <div className="h-12 w-12 bg-accent rounded-xl flex items-center justify-center text-white mb-2 shadow-lg">
                  <Maximize2 size={24} />
               </div>
               <CardTitle className="text-xl">Fast-Track: Web Enrollment</CardTitle>
               <CardDescription>Test the lock logic immediately on any phone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Open the Device URL on the customer's phone Chrome browser.</li>
                  <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Select <strong>"Install App"</strong> or "Add to Home Screen".</li>
                  <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Toggle <strong>"Full Screen"</strong> for a total lockdown simulation.</li>
               </ul>
               <Button className="w-full bg-accent hover:bg-accent/90 gap-2" asChild>
                  <a href="/devices">
                     <ExternalLink size={18} />
                     Go to Device List
                  </a>
               </Button>
            </CardContent>
         </Card>

         {/* Native APK Deployment */}
         <Card>
            <CardHeader>
               <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white mb-2">
                  <Cpu size={24} />
               </div>
               <CardTitle className="text-xl">Production: Native APK</CardTitle>
               <CardDescription>For full OS-level control and factory-reset security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-xs text-muted-foreground leading-relaxed">
                  Requires a custom Android Studio project using the <strong>DevicePolicyManager</strong> API. 
                  This provides "Device Administrator" or "Device Owner" permissions to block uninstallation.
               </p>
               <Alert className="bg-secondary/50 border-none">
                  <Info size={16} />
                  <AlertDescription className="text-[11px]">
                     Use the JSON below in your native Android app's <code>AdminExtras</code> to connect to this dashboard.
                  </AlertDescription>
               </Alert>
               <Button variant="outline" className="w-full gap-2" onClick={copyToClipboard}>
                  <Copy size={16} />
                  Copy DPC Config JSON
               </Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="text-accent" />
              Master QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-6 bg-white rounded-3xl border shadow-inner flex items-center justify-center aspect-square w-full max-w-[280px]">
              <div className="relative group cursor-pointer">
                 <QrCode size={200} className="text-primary opacity-20 blur-[1px]" />
                 <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <Button variant="default" className="bg-primary hover:bg-primary/90 shadow-lg gap-2">
                       <Terminal size={16} />
                       Generate Master QR
                    </Button>
                    <p className="text-[9px] text-muted-foreground text-center px-4 uppercase font-bold tracking-widest">Encrypted Payload</p>
                 </div>
              </div>
            </div>
            <div className="w-full space-y-3">
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
              <CardTitle>DPC Manifest (JSON)</CardTitle>
              <CardDescription>Advanced config for Android Device Policy Controller.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="hover:bg-accent/10 hover:text-accent">
              <Copy size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-slate-950 text-emerald-400 p-6 rounded-xl text-xs font-mono overflow-x-auto h-[350px] border border-white/10 shadow-2xl leading-relaxed">
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
                <RefreshCw className="text-accent" />
                No-Reset Testing Workflow
              </h3>
              <p className="text-slate-400 text-sm">Follow these steps for immediate testing in Etawah without factory resetting your phone:</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">1</div>
                <div>
                  <p className="font-semibold text-sm">Enroll Customer</p>
                  <p className="text-xs text-slate-500">Use the "New Enrollment" form to register your own phone's IMEI.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">2</div>
                <div>
                  <p className="font-semibold text-sm">Install PWA App</p>
                  <p className="text-xs text-slate-500">Open the generated link on your phone. Tap "Add to Home Screen" to install Emi.locker.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">3</div>
                <div>
                  <p className="font-semibold text-sm">Enable Immersive Mode</p>
                  <p className="text-xs text-slate-500">Launch the app, tap "Maximize", and test the lock command from your laptop.</p>
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
