import Loading from '@/components/Loader';
import React from 'react';

const DashboardLoading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loading title='Loading dashboard...'/>
  </div>
);

export default DashboardLoading;