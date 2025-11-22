'use client';

interface FitLevelChipProps {
  level: 'high' | 'strong' | 'possible';
}

export default function FitLevelChip({ level }: FitLevelChipProps) {
  const styles = {
    high: 'bg-[#7F915F] text-white shadow-sm',
    strong: 'bg-[#D2C6A3] text-[#232323]',
    possible: 'bg-gray-300 text-[#232323]',
  };

  const labels = {
    high: 'High Fit',
    strong: 'Strong Fit',
    possible: 'Possible Fit',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${styles[level]}`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {labels[level]}
    </span>
  );
}
