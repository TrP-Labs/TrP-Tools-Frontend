"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import GroupCard from './GroupCard';

interface Group {
  id: string;
  name: string;
  iconUrl: string;
}

interface GroupListProps {
  groups: Group[];
  className?: string;
}

const GroupList: React.FC<GroupListProps> = ({ groups, className }) => {
  const router = useRouter();
  const handleGroupClick = (groupId: string) => {
    router.push(`/dashboard/${groupId}`);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className || ''}`}>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          name={group.name}
          iconUrl={group.iconUrl}
          onClick={() => handleGroupClick(group.id)}
        />
      ))}
    </div>
  );
};

export default GroupList;
