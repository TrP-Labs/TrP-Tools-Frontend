import { IconCancel, IconHeadphones, IconMicrophone, IconCrown } from '@tabler/icons-react';

interface PermissionButtonProps {
  Icon: any
  label: string;
  active: boolean;
  onClick: () => void;
}

const PermissionButton: React.FC<PermissionButtonProps> = ({ Icon, label, active, onClick }) => (
  <div className="relative flex flex-col items-center group">
    <button onClick={onClick} className="focus:outline-none cursor-pointer">
      <Icon size={20} className={active ? 'text-blue-500' : 'text-gray-400'} />
    </button>
    <div className="absolute bottom-full left-1/2 mb-2 w-max max-w-xs px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transform -translate-x-1/2 transition-opacity duration-200">
      {label}
    </div>
  </div>
);

interface PermissionsSelectorProps {
  permLevel: number;
  onPermissionChange: (id: string, level: number) => void;
  rankId: string;
}

export const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({ permLevel, onPermissionChange, rankId }) => {
  const permissions = [
    { Icon: IconCancel, label: 'No Permissions' },
    { Icon: IconHeadphones, label: 'Dispatch' },
    { Icon: IconMicrophone, label: 'Host' },
    { Icon: IconCrown, label: 'Manage Group' },
  ];

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-1">
      <label className="text-xs text-gray-400 mb-1">Permissions</label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {permissions.map((perm, index) => (
          <PermissionButton
            key={index}
            Icon={perm.Icon}
            label={perm.label}
            active={permLevel === index}
            onClick={() => onPermissionChange(rankId, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionsSelector