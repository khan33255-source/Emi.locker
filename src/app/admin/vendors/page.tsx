
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, UserCheck, Phone, Loader2, Eye, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function AdminVendorsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const vendorsQuery = useMemo(() => firestore ? collection(firestore, 'vendors') : null, [firestore]);
  const { data: vendors, loading } = useCollection<any>(vendorsQuery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);

  const filteredVendors = vendors?.filter(v => 
    v.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.mobile?.includes(searchTerm)
  );

  const handleApprove = (vendorId: string) => {
    if (!firestore) return;
    setIsApproving(true);
    
    const vendorRef = doc(firestore, 'vendors', vendorId);
    updateDoc(vendorRef, {
      status: 'active'
    })
    .then(() => {
      toast({
        title: "Vendor Approved",
        description: "The shop has been activated successfully.",
      });
      setSelectedVendor(null);
    })
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `vendors/${vendorId}`,
        operation: 'update',
        requestResourceData: { status: 'active' },
      });
      errorEmitter.emit('permission-error', permissionError);
    })
    .finally(() => setIsApproving(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-widest hover:underline mb-2">
              <ArrowLeft size={12} />
              Return to Control Center
            </Link>
            <h1 className="text-4xl font-headline font-black text-primary tracking-tight">Vendor Management</h1>
            <p className="text-muted-foreground">Monitoring all registered mobile shops in Etawah district.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-tighter">Admin Session Active: {user?.phoneNumber || 'Faisal'}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              className="h-12 pl-10 bg-white shadow-sm border-slate-200"
              placeholder="Search by Shop Name, Owner or Mobile Number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Vendor Registry...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100 border-none">
                    <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Shop Profile</TableHead>
                    <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Owner Name</TableHead>
                    <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Mobile Number</TableHead>
                    <TableHead className="font-black text-primary uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                    <TableHead className="text-right font-black text-primary uppercase text-[10px] tracking-widest h-14 pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors?.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-accent/5 transition-colors border-slate-100 h-16">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{vendor.shopName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">UID: {vendor.id?.substring(0, 8)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{vendor.ownerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <Phone size={14} className="text-accent" />
                          {vendor.mobile}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={vendor.status === 'active' ? 'secondary' : vendor.status === 'pending' ? 'outline' : 'destructive'}
                          className={`capitalize font-bold px-3 py-1 rounded-full text-[10px] ${
                            vendor.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                            vendor.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : ''
                          }`}
                        >
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 gap-2 font-bold text-xs hover:bg-accent hover:text-white transition-all rounded-lg"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <Eye size={14} />
                          Review KYC
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredVendors?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2">
                           <ShieldCheck size={48} className="text-slate-200" />
                           <p className="text-muted-foreground font-medium">No vendor applications found matching your search.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Review Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic flex items-center gap-2 text-primary">
              <ShieldCheck className="text-accent" />
              KYC INVESTIGATION
            </DialogTitle>
            <DialogDescription className="font-medium">
              Verify legal identity documents before shop activation.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Business</p>
                  <p className="font-bold text-primary">{selectedVendor.shopName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Legal Owner</p>
                  <p className="font-bold text-primary">{selectedVendor.ownerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Mobile Contact</p>
                  <p className="font-bold text-primary">{selectedVendor.mobile}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Registration Date</p>
                  <p className="font-bold text-primary">{selectedVendor.joinDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-[10px] uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                  Aadhar Card Assets
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-center text-slate-500">FRONT-SIDE SCAN</p>
                    <div className="aspect-video rounded-xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden">
                      {selectedVendor.aadharFront ? (
                        <img src={selectedVendor.aadharFront} alt="Aadhar Front" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 italic">No asset uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-center text-slate-500">BACK-SIDE SCAN</p>
                    <div className="aspect-video rounded-xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden">
                      {selectedVendor.aadharBack ? (
                        <img src={selectedVendor.aadharBack} alt="Aadhar Back" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 italic">No asset uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                <Button variant="outline" className="font-bold" onClick={() => setSelectedVendor(null)}>Close Terminal</Button>
                {selectedVendor.status === 'pending' && (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold px-8" 
                    onClick={() => handleApprove(selectedVendor.id)}
                    disabled={isApproving}
                  >
                    {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck size={16} />}
                    ACTIVATE VENDOR
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
