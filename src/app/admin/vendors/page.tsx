"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserCheck, UserX, ExternalLink, ShieldCheck, Mail, Phone } from 'lucide-react';

const MOCK_VENDORS = [
  { id: 'V-001', name: 'City Mobile Center', owner: 'Arun Kumar', mobile: '+91 9876543210', status: 'active', devices: 412, joinDate: '2024-01-12' },
  { id: 'V-002', name: 'Galaxy Hub', owner: 'Priya Verma', mobile: '+91 9123456789', status: 'pending', devices: 0, joinDate: '2024-05-22' },
  { id: 'V-003', name: 'Smart Choice Store', owner: 'Sanjeev Goel', mobile: '+91 8877665544', status: 'active', devices: 156, joinDate: '2024-02-15' },
  { id: 'V-004', name: 'Prime Mobiles', owner: 'Karan Mehra', mobile: '+91 7766554433', status: 'suspended', devices: 89, joinDate: '2023-11-05' },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState(MOCK_VENDORS);

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
          <Input className="pl-10 h-10" placeholder="Search by Shop, Owner or Mobile..." />
        </div>
        <Button variant="outline" className="gap-2">
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-bold">Shop Details</TableHead>
                <TableHead className="font-bold">Owner</TableHead>
                <TableHead className="font-bold">Contact</TableHead>
                <TableHead className="font-bold text-center">Managed Devices</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-accent/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">{vendor.name}</span>
                      <span className="text-xs text-muted-foreground">ID: {vendor.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.owner}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Phone size={12} className="text-accent" />
                        {vendor.mobile}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-accent">{vendor.devices}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={vendor.status === 'active' ? 'secondary' : vendor.status === 'pending' ? 'outline' : 'destructive'}
                      className="capitalize"
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {vendor.status === 'pending' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 gap-1">
                          <UserCheck size={14} />
                          Approve
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8">
                        View KYC
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MoreVertical({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}