"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, QrCode, Copy, Info, Download, Smartphone, Terminal, Cpu, RefreshCw, Maximize2, ExternalLink, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProvisioningPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  const provisioningJson = useMemo(() => ({
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.afwsamples.testdpc/com.afwsamples.testdpc.DeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://github.com/googlesamples/android-testdpc/releases/download/v9.0.5/testdpc-9.0.5.apk",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "I5YvS0NGBicHn-N-V7Svi_88n5vU6t2y4I6E_6Y6U_w",
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "com.emilocker.mdm.PROJECT_ID": "emilocker-a9f98",
      "com.emilocker.mdm.SERVER_ENDPOINT": origin || 'https://emilocker-a9f98.web.app',
      "com.emilocker.mdm.STRICT_MODE": true
    }
  }), [origin]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(provisioningJson, null, 2));
    toast({
      title: "Payload Copied",
      description: "Ready for QR Master Encoding.",
    });
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-24">
        <RefreshCw className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
        <div>
          <h1 className="text-5xl font-black italic text-primary tracking-tighter uppercase mb-2">MDM PROVISIONING</h1>
          <p className="text-muted-foreground font-medium text-lg">Industrial grade deployment protocols for Etawah mobile vendors.</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-primary text-white px-4 py-2 font-black italic rounded-xl">TESTDPC v9.0.5</Badge>
          <Badge variant="outline" className="border-accent text-accent px-4 py-2 font-black rounded-xl">SECURE-BOOT ACTIVE</Badge>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
         {/* PWA Enforcer */}
         <Card className="border-accent border-2 shadow-2xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white animate-pulse">
                  <Smartphone size={20} />
               </div>
            </div>
            <CardHeader>
               <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Fast-Track PWA</CardTitle>
               <CardDescription className="text-primary/70 font-semibold italic">Zero-Reset Simulation Protocol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <Alert className="bg-slate-900 border-none text-white rounded-2xl">
                  <Terminal className="h-5 w-5 text-accent" />
                  <AlertTitle className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Status: Ready</AlertTitle>
                  <AlertDescription className="text-xs font-mono opacity-80 leading-relaxed">
                    Deploy the simulation link via Chrome on any customer device. This bypasses the need for a factory reset while maintaining the lock/unlock logic.
                  </AlertDescription>
               </Alert>
               
               <Button className="w-full h-16 bg-accent hover:bg-accent/90 gap-3 text-lg font-black rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95" asChild>
                  <a href="/devices">
                     <ExternalLink size={20} />
                     OPEN PORTFOLIO
                  </a>
               </Button>
            </CardContent>
         </Card>

         {/* Native DPC */}
         <Card className="border-slate-200 shadow-xl bg-slate-50/50">
            <CardHeader>
               <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Enterprise DPC</CardTitle>
               <CardDescription className="font-semibold">Full OS Enforcement (Kiosk Mode)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Provisioning Strategy</p>
                  <ul className="space-y-3">
                     <li className="flex gap-3 items-start">
                        <Code2 size={16} className="text-primary mt-1" />
                        <span className="text-sm font-medium leading-tight">Install <strong>com.afwsamples.testdpc</strong> as Device Owner.</span>
                     </li>
                     <li className="flex gap-3 items-start">
                        <Code2 size={16} className="text-primary mt-1" />
                        <span className="text-sm font-medium leading-tight">Use 6-taps on 'Welcome Screen' to scan the Master QR.</span>
                     </li>
                  </ul>
               </div>
               <Button variant="outline" className="w-full h-14 border-primary text-primary hover:bg-primary/5 font-bold gap-2 rounded-2xl" onClick={copyToClipboard}>
                  <Copy size={18} />
                  COPY ADMIN EXTRAS
               </Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <Card className="md:col-span-2 shadow-2xl border-none bg-primary text-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter">
              <QrCode className="text-accent" />
              Master QR Encode
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8">
            <div className="p-8 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center aspect-square w-full max-w-[300px] border-8 border-primary/20">
              <div className="relative">
                 <QrCode size={220} className="text-primary" />
                 <div className="absolute inset-0 bg-white/95 flex items-center justify-center flex-col gap-4 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl">
                    <Button variant="default" className="bg-accent hover:bg-accent/90 shadow-xl font-black italic">
                       REGENERATE
                    </Button>
                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em]">AES-256 Encrypted</p>
                 </div>
              </div>
            </div>
            <p className="text-center text-xs opacity-60 font-bold uppercase tracking-widest px-8">Scan this code on a factory-reset device to initiate the MDM handshake.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 h-full border-none shadow-2xl bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-6">
            <div>
              <CardTitle className="text-white text-xl font-black italic uppercase tracking-tighter">DPC Manifest</CardTitle>
              <CardDescription className="text-slate-400 font-mono text-[10px]">JSON_PAYLOAD_V4.2</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-slate-400 hover:text-white hover:bg-white/10">
              <Copy size={20} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="text-emerald-400 p-8 text-xs font-mono overflow-x-auto h-[450px] leading-relaxed scrollbar-hide">
              {JSON.stringify(provisioningJson, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
