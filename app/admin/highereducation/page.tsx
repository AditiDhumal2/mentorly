import { getHigherEducationData, getAllStudentProgress } from '@/actions/highereducation-admin-actions';
import DataManager from './components/DataManager';
import StudentProgressOverview from './components/StudentProgressOverview';

export default async function AdminHigherEducationPage() {
  const [higherEdData, studentProgress] = await Promise.all([
    getHigherEducationData(),
    getAllStudentProgress()
  ]);

  const safeStudentProgress = Array.isArray(studentProgress) ? studentProgress : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Higher Education Admin</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Countries</h3>
            <p className="text-3xl font-bold text-blue-600">{higherEdData.countries?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Exams</h3>
            <p className="text-3xl font-bold text-green-600">{higherEdData.examPreparations?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Students</h3>
            <p className="text-3xl font-bold text-purple-600">{safeStudentProgress.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DataManager initialData={higherEdData} />
          <StudentProgressOverview progressData={safeStudentProgress} />
        </div>
      </div>
    </div>
  );
}