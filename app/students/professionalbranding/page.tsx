// app/students/professionalbranding/page.tsx
import { getBrandingChecklist } from '@/actions/professionalbranding-students-actions';
import { BrandingHeader } from './components/BrandingHeader';
import { ProgressSummary } from './components/ProgressSummary';
import { ChecklistItem } from './components/ChecklistItem';
import { ResetChecklistButton } from './components/ResetChecklistButton';
import { groupTasksByCategory, categoryNames } from '@/utils/professional-branding-utils';

export default async function ProfessionalBrandingPage() {
  const result = await getBrandingChecklist();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <BrandingHeader />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { checklist, progress, userProgress = [] } = result;

  // Group tasks by category using utility function
  const tasksByCategory = groupTasksByCategory(checklist.tasks);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <BrandingHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {Object.entries(tasksByCategory).map(([category, tasks]: [string, any]) => (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {tasks.map((task: any) => {
                    const isCompleted = userProgress.some((progress: any) => 
                      progress.taskId === task._id && progress.completed
                    );
                    
                    return (
                      <ChecklistItem
                        key={task._id}
                        task={task}
                        completed={isCompleted}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressSummary progress={progress!} />
            <ResetChecklistButton />
          </div>
        </div>
      </div>
    </div>
  );
}