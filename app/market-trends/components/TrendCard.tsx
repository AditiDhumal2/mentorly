import DemandIndicator from './DemandIndicator';

interface TrendCardProps {
  skill: string;
  demandScore: number;
  rank: number;
}

export default function TrendCard({ skill, demandScore, rank }: TrendCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-500';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <div className={`w-8 h-8 ${getRankColor(rank)} rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{skill}</h3>
        <div className="flex items-center mt-2">
          <DemandIndicator score={demandScore} />
          <span className="text-sm text-gray-600 ml-2">
            {demandScore}% demand
          </span>
        </div>
      </div>
    </div>
  );
}