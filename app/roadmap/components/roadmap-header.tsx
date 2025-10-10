interface RoadmapHeaderProps {
  year: number;
  title: string;
  description: string;
  progressPercentage: number;
}

export default function RoadmapHeader({ year, title, description, progressPercentage }: RoadmapHeaderProps) {
  const getYearLabel = (year: number) => {
    const labels: { [key: number]: string } = {
      1: '1st Year - Foundation',
      2: '2nd Year - Skill Development', 
      3: '3rd Year - Specialization',
      4: '4th Year - Placement Preparation'
    };
    return labels[year] || `Year ${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getYearLabel(year)}</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">{title}</h2>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}