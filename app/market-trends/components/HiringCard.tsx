interface HiringCardProps {
  domain: string;
  openings: number;
  rank: number;
}

export default function HiringCard({ domain, openings, rank }: HiringCardProps) {
  const formatOpenings = (openings: number) => {
    if (openings >= 1000) {
      return `${(openings / 1000).toFixed(1)}k`;
    }
    return openings.toString();
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-center min-w-0">
        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
          {rank}
        </div>
        <span className="font-medium text-gray-900 truncate">{domain}</span>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <span className="text-lg font-bold text-green-600">
          {formatOpenings(openings)}
        </span>
        <p className="text-xs text-gray-500">openings</p>
      </div>
    </div>
  );
}