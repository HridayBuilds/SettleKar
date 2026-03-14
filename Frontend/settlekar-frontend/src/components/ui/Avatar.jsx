import { cn } from '../../lib/utils';
import { getInitials } from '../../lib/formatters';

const AVATAR_COLORS = [
  'bg-[#1E40AF]',
  'bg-[#14532D]',
  'bg-[#78350F]',
  'bg-[#7C2D12]',
  'bg-[#581C87]',
  'bg-[#164E63]',
  'bg-[#713F12]',
  'bg-[#1E3A5F]',
];

function getColorFromName(name) {
  let hash = 0;
  const str = name || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export function Avatar({ src, firstName, lastName, size = 'md', className }) {
  const initials = getInitials(firstName, lastName);
  const colorClass = getColorFromName(`${firstName}${lastName}`);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ''} ${lastName || ''}`}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        sizes[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
