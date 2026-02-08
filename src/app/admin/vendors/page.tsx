"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, UserCheck, Phone, Loader2, Eye, ShieldCheck, Calendar } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminVendorsPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Vendor Management</h1>
          <p className="text-muted-foreground">Approve new shop applications and manage existing vendor permissions.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search by Shop, Owner or Mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-bold">Shop Details</TableHead>
                  <TableHead className="font-bold">Owner</TableHead>
                  <TableHead className="font-bold">Contact</TableHead>
                  <TableHead className="font-bold">Join Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors?.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-accent/5 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{vendor.shopName}</span>
                        <span className="text-xs text-muted-foreground">ID: {vendor.id?.substring(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.ownerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone size={14} className="text-accent" />
                        {vendor.mobile}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {vendor.joinDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={vendor.status === 'active' ? 'secondary' : vendor.status === 'pending' ? 'outline' : 'destructive'}
                        className="capitalize"
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setSelectedVendor(vendor)}>
                        <Eye size={14} />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredVendors?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No vendor applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Vendor Review Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShieldCheck className="text-accent" />
              Application Review
            </DialogTitle>
            <DialogDescription>
              Verify the shop details and Aadhar KYC documents before granting access.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Shop Name</p>
                  <p className="font-semibold text-primary">{selectedVendor.shopName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Owner Name</p>
                  <p className="font-semibold text-primary">{selectedVendor.ownerName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Mobile Number</p>
                  <p className="font-semibold text-primary">{selectedVendor.mobile}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Join Date</p>
                  <p className="font-semibold text-primary">{selectedVendor.joinDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-muted-foreground flex items-center gap-2">
                  KYC Documents (Aadhar Card)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-center">Front Side</p>
                    <div className="aspect-[4/3] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden">
                      {selectedVendor.aadharFront ? (
                        <img src={selectedVendor.aadharFront} alt="Aadhar Front" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No image provided</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-center">Back Side</p>
                    <div className="aspect-[4/3] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden">
                      {selectedVendor.aadharBack ? (
                        <img src={selectedVendor.aadharBack} alt="Aadhar Back" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No image provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedVendor(null)}>Close</Button>
                {selectedVendor.status === 'pending' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 gap-2" 
                    onClick={() => handleApprove(selectedVendor.id)}
                    disabled={isApproving}
                  >
                    {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck size={16} />}
                    Approve Shop
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
