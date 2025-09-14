"use client";
import React from 'react';

interface GroupCardProps {
  name: string;
  iconUrl: string;
  onClick?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ name, iconUrl, onClick }) => {
  return (
    <button
      className="bg-[var(--background-secondary-muted)] flex flex-col items-center rounded-lg shadow cursor-pointer hover:shadow-lg transition p-4 m-2 w-40 h-48 focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={onClick}
      type="button"
    >
      <img
        src={iconUrl}
        alt={name}
        className="w-24 h-24 rounded mb-2 object-cover border border-border"
        loading="lazy"
      />
      <span className="text-lg font-semibold text-center truncate w-full">{name}</span>
    </button>
  );
};

export default GroupCard;
