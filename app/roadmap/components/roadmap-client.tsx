'use client';

import { useState, useEffect } from 'react';
import RoadmapHeader from './roadmap-header';
import StepCard from './step-card';
import ProgressSidebar from './progress-sidebar';
import { getStepEngagementAction } from '../../../actions/auto-progress-actions';

interface RoadmapClientProps {
  roadmap: any;
  progress: any[];
  currentYear: number;
  userId: string;
}

export default function RoadmapClient({ roadmap, progress, currentYear, userId }: RoadmapClientProps) {
  const [stepEngagements, setStepEngagements] = useState<{[key: string]: any}>({});

  // Load engagement data for all steps
  useEffect(() => {
    async function loadEngagements() {
      const engagements: {[key: string]: any} = {};
      
      for (const step of roadmap.steps) {
        const result = await getStepEngagementAction(userId, step._id);
        if (result.success && result.data) {
          engagements[step._id] = result.data;
        }
      }
      
      setStepEngagements(engagements);
    }
    
    loadEngagements();
  }, [userId, roadmap.steps]);

  const completedSteps = Object.values(stepEngagements).filter((engagement: any) => engagement.completed).length;
  const totalSteps = roadmap.steps?.length || 0;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Handle case where roadmap data is incomplete
  if (!roadmap || !roadmap.steps?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Roadmap Data</h1>
          <p className="text-gray-600">Roadmap data is not available for your current year.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <RoadmapHeader 
              year={currentYear}
              title={roadmap.title || 'Your Learning Roadmap'}
              description={roadmap.description || 'Start your learning journey'}
              progressPercentage={progressPercentage}
            />
            
            <div className="mt-8 space-y-4">
              {roadmap.steps.map((step: any, index: number) => {
                const engagement = stepEngagements[step._id] || {};
                const isCompleted = engagement.completed || false;
                
                return (
                  <StepCard
                    key={step._id}
                    step={step}
                    index={index}
                    isCompleted={isCompleted}
                    userId={userId}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProgressSidebar
              completedSteps={completedSteps}
              totalSteps={totalSteps}
              progressPercentage={progressPercentage}
              currentYear={currentYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}