import { getCurrentUser } from '../../lib/session';
import { getRoadmapAction, getRoadmapProgressAction } from '../../actions/roadmap-actions';
import RoadmapClient from './components/roadmap-client';

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view your roadmap.</p>
        </div>
      </div>
    );
  }

  const [roadmapResult, progressResult] = await Promise.all([
    getRoadmapAction(user.year),
    getRoadmapProgressAction(user.id)
  ]);

  // Handle database errors
  if (!roadmapResult.success || !roadmapResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Roadmap</h1>
          <p className="text-gray-600 mb-4">
            {roadmapResult.error || 'Roadmap data not found'}
          </p>
          <p>Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (!progressResult.success || !progressResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Progress</h1>
          <p className="text-gray-600 mb-4">
            {progressResult.error || 'Progress data not found'}
          </p>
          <p>Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  // Ensure we're passing plain objects
  const roadmapData = JSON.parse(JSON.stringify(roadmapResult.data));
  const progressData = JSON.parse(JSON.stringify(progressResult.data.progress));

  return (
    <RoadmapClient 
      roadmap={roadmapData} 
      progress={progressData}
      currentYear={user.year}
      userId={user.id}
    />
  );
}