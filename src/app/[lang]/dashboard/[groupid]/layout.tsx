import DashboardSidebar from '@/components//dashboard/DashboardSidebar';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
