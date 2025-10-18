import { Button } from './ui/button';
import { Calendar, Target, Trophy } from 'lucide-react';

interface ProgressSidebarProps {
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  currentYear: number;
}

export default function ProgressSidebar({ 
  completedSteps, 
  totalSteps, 
  progressPercentage, 
  currentYear 
}: ProgressSidebarProps) {
  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 0) return "Start your journey today! 🚀";
    if (percentage < 25) return "Great start! Keep going! 💪";
    if (percentage < 50) return "You're making progress! 🌟";
    if (percentage < 75) return "Halfway there! Keep pushing! 🔥";
    if (percentage < 100) return "Almost there! Finish strong! 🎯";
    return "Amazing! You've completed all steps! 🏆";
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {progressPercentage}%
            </span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            {getMotivationalMessage(progressPercentage)}
          </p>
        </div>
      </div>
      
      {/* Next Year Access */}
      {progressPercentage === 100 && currentYear < 4 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6" />
            <h3 className="font-semibold">Amazing Work! 🎉</h3>
          </div>
          <p className="text-sm mb-4">
            You've completed all steps for Year {currentYear}. Ready to move to Year {currentYear + 1}?
          </p>
          <Button 
            variant="secondary" 
            size="small"
            className="w-full bg-white text-green-600 hover:bg-gray-100"
          >
            Continue to Year {currentYear + 1}
          </Button>
        </div>
      )}
    </div>
  );
}