"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, QrCode, Copy, Info, Download, Smartphone } from 'lucide-react';

export default function ProvisioningPage() {
  const provisioningJson = {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.financeshield.mdm/.receiver.MyDeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://storage.googleapis.com/finance-shield-mdm-assets/latest-shield-mdm.apk",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": "WkVYQkdIVFpLTU5PUE9SU1RVT1ZXWFlaQUJDREVGR0hJSktMTU5PUFFSU1RVVlc=",
    "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "server_url": "https://api.financeshield.com",
      "auto_enroll": true
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(provisioningJson, null, 2));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Device Provisioning</h1>
        <p className="text-muted-foreground">Setup new devices with Emi.locker using the Android 7-tap QR method.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
              <QrCode size={24} />
            </div>
            <CardTitle>Provisioning QR Code</CardTitle>
            <CardDescription>Scan this on a factory-reset device (tap 7 times on the welcome screen).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-muted flex items-center justify-center aspect-square w-64">
              <div className="relative group">
                 <QrCode size={180} className="text-primary opacity-20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" className="gap-2 bg-white">
                       <Download size={16} />
                       Generate Code
                    </Button>
                 </div>
              </div>
            </div>
            <div className="w-full space-y-2">
               <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
                  <Info size={16} className="text-accent shrink-0" />
                  <p>QR code includes MDM package location, checksum, and initial config tokens.</p>
               </div>
               <Button variant="outline" className="w-full gap-2">
                  <Download size={16} />
                  Download QR as Image
               </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Provisioning JSON</CardTitle>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Copy size={16} />
                </Button>
              </div>
              <CardDescription>Raw configuration payload sent to DPC during enrollment.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-primary text-primary-foreground p-4 rounded-lg text-xs font-mono overflow-x-auto h-[350px]">
                {JSON.stringify(provisioningJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-primary text-primary-foreground overflow-hidden">
        <div className="md:flex">
          <div className="p-8 md:w-2/3">
            <h3 className="text-xl font-headline font-bold mb-4">Technical Requirements</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-white shrink-0">1</div>
                Device must be factory reset (FRP cleared)
              </li>
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-white shrink-0">2</div>
                Android 9.0 (Pie) or higher recommended
              </li>
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-white shrink-0">3</div>
                Active WiFi connection for MDM package download
              </li>
              <li className="flex gap-2 text-yellow-400 font-bold">
                <Shield size={18} className="shrink-0" />
                Once set, Emi.locker becomes the "Device Owner" and cannot be uninstalled.
              </li>
            </ul>
          </div>
          <div className="hidden md:block w-1/3 bg-accent/20 flex items-center justify-center">
            <Smartphone size={120} className="text-white/20" />
          </div>
        </div>
      </Card>
    </div>
  );
}