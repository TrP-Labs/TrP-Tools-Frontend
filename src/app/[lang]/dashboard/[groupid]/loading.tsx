import React from 'react';

const DashboardLoading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mr-4" />
    <span className="text-lg">Loading dashboard...</span>
  </div>
);

export default DashboardLoading;
