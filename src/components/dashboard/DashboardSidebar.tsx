"use client";
import React from 'react';
import { IconHome, IconUsers, IconSettings, IconActivity, IconCalendar, IconDashboard, IconRadio, IconRobot, IconRoute } from '@tabler/icons-react';
import BaseSidebar from '@/components/BaseSidebar';
import { useParams } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ className }) => {
  const params = useParams();
  const groupid = params.groupid as string;

  const dashboardItems = [
    {
      ID: 1,
      Icon: IconHome,
      Text: 'Overview',
      url: `/dashboard/${groupid}`,
      RequiresAccount: false
    },
    {
      ID: 2,
      Icon: IconUsers,
      Text: 'Manage Ranks',
      url: `/dashboard/${groupid}/ranks`,
      RequiresAccount: false
    },
    {
      ID: 3,
      Icon: IconActivity,
      Text: 'View Activity',
      url: `/dashboard/${groupid}/activity`,
      RequiresAccount: false
    },
    {
      ID: 4,
      Icon: IconCalendar,
      Text: 'Schedule Shifts',
      url: `/dashboard/${groupid}/shifts`,
      RequiresAccount: false
    },
    {
      ID: 5,
      Icon: IconDashboard,
      Text: 'Shift Dashboard',
      url: `/dashboard/${groupid}/dashboard`,
      RequiresAccount: false
    },
    {
      ID : 6,
      Icon: IconRoute,
      Text: "Manage Routes",
      url: `/dashboard/${groupid}/routes`,
      RequiresAccount: false
    },
    {
      ID: 7,
      Icon: IconRadio,
      Text: 'Dispatch',
      url: `/dashboard/${groupid}/dispatch`,
      RequiresAccount: false
    },
        {
      ID: 8,
      Icon: IconRobot,
      Text: 'Bot',
      url: `/dashboard/${groupid}/bot`,
      RequiresAccount: false
    }
  ];

  return (
    <BaseSidebar
      items={dashboardItems}
      title="Configure"
      className={className}
    />
  );
};

export default DashboardSidebar;
