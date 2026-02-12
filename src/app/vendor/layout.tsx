
"use client";

import DashboardLayout from '../dashboard/layout';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
