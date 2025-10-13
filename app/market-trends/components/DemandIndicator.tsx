"use client";

interface DemandIndicatorProps {
  score: number;
}

export default function DemandIndicator({ score }: DemandIndicatorProps) {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-red-500';
    if (score >= 80) return 'bg-orange-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getWidth = (score: number) => {
    return `${Math.min(score, 100)}%`;
  };

  return (
    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${getColor(score)} transition-all duration-300`}
        style={{ width: getWidth(score) }}
      />
    </div>
  );
}