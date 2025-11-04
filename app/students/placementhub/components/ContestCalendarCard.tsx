// app/students/placementhub/components/ContestCalendarCard.tsx

import { Contest } from '@/types/placementhub';

interface ContestCalendarCardProps {
  contests: Contest[];
}

export function ContestCalendarCard({ contests }: ContestCalendarCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Coding Contest Calendar</h3>
      <div className="space-y-3">
        {contests.map((contest, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
              isUpcoming(contest.date) 
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{contest.name}</h4>
              <p className="text-sm text-gray-500">{contest.platform}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatDate(contest.date)}
              </div>
              <div className={`text-xs ${
                isUpcoming(contest.date) ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isUpcoming(contest.date) ? 'Upcoming' : 'Completed'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}