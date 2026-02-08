"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { generateEmiOverlayMessage } from '@/ai/flows/generate-emi-overlay-message';

type Device = {
  id: string;
  imei: string;
  model: string;
  customer: string;
  emiAmount: number;
  dueDate: string;
  vendor: string;
};

export function DeviceLockDialog({ device, onClose, onLock }: { device: Device, onClose: () => void, onLock: (id: string) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateEmiOverlayMessage({
        deviceName: device.model,
        shopName: device.vendor,
        ownerName: 'Admin',
        emiAmount: device.emiAmount,
        dueDate: device.dueDate
      });
      setMessage(result.overlayMessage);
    } catch (error) {
      console.error('Failed to generate message:', error);
      setMessage(`PAYMENT OVERDUE: Your EMI for ${device.model} is pending. Please visit ${device.vendor} immediately to avoid permanent lock.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLockAction = () => {
    setIsLocking(true);
    // Simulate API call to Firebase
    setTimeout(() => {
      onLock(device.id);
      setIsLocking(false);
    }, 1500);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <ShieldAlert size={24} />
            <DialogTitle>Remote Lock Command</DialogTitle>
          </div>
          <DialogDescription>
            You are about to lock <strong>{device.customer}&apos;s</strong> device ({device.model}). This will enforce Kiosk Mode until payment is verified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="overlay-message">Overlay Message (Display on Phone)</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-accent gap-1 hover:bg-accent/5"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Auto-Compose
              </Button>
            </div>
            <Textarea 
              id="overlay-message" 
              placeholder="Enter the message the user will see on their screen..."
              className="min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 text-xs text-destructive flex items-start gap-2">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Once locked, the device owner can only access the "Dialer" for emergency calls and a "Pay Now" interface. Full uninstallation protection is active.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleLockAction}
            disabled={!message || isLocking}
            className="gap-2"
          >
            {isLocking && <Loader2 className="h-4 w-4 animate-spin" />}
            Execute Lock Command
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}