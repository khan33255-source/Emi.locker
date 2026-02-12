
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scan, X, Camera } from 'lucide-react';

interface ImeiScannerProps {
  onScan: (imei: string) => void;
  label?: string;
}

export function ImeiScanner({ onScan, label = 'Scan IMEI' }: ImeiScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the div is in the DOM
      const timer = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          'imei-reader',
          { fps: 10, qrbox: { width: 250, height: 100 } },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            // Standard barcode reading often includes non-digits, clean it
            const cleaned = decodedText.replace(/\D/g, '').substring(0, 15);
            if (cleaned.length >= 14) {
              onScan(cleaned);
              handleClose();
            }
          },
          (error) => {
            // Silent error for continuous scanning
          }
        );
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, onScan]);

  const handleClose = () => {
    setIsOpen(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest border-accent text-accent hover:bg-accent/5">
          <Scan size={14} />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-zinc-950 border-zinc-800">
        <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-black italic text-white flex items-center gap-2">
              <Camera className="text-accent" size={18} />
              HARDWARE SCANNER
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-zinc-500 hover:text-white">
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center">
          <div id="imei-reader" className="w-full aspect-video rounded-xl overflow-hidden border-2 border-accent/20 bg-black" />
          <p className="mt-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">
            Position the IMEI barcode within the frame.<br/>The scanner will auto-detect digits.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
