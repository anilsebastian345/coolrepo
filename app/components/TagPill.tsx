'use client';

interface TagPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'interactive' | 'display';
}

export default function TagPill({ label, selected = false, onClick, variant = 'interactive' }: TagPillProps) {
  if (variant === 'display') {
    return (
      <span
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-[#F4F7EF] text-[#4A4A4A] border border-[#E5E5E5]"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[40px] ${
        selected
          ? 'bg-[#7F915F] text-white shadow-sm scale-[1.02]'
          : 'bg-white text-[#4A4A4A] border border-[#DDD] hover:bg-[#EEF2E8] hover:border-[#7F915F]'
      }`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {label}
    </button>
  );
}
