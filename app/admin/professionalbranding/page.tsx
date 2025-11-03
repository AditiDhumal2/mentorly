// app/admin/professionalbranding/page.tsx
import { getAdminBrandingChecklists } from '@/actions/professionalbranding-admin-actions';
import { BrandingChecklistTable } from './components/BrandingChecklistTable';
import { CreateChecklistButton } from './components/CreateChecklistButton';

export default async function AdminProfessionalBrandingPage() {
  const result = await getAdminBrandingChecklists();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Professional Branding Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage year-wise branding checklists for students
            </p>
          </div>
          <CreateChecklistButton />
        </div>

        {!result.success ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{result.error}</p>
          </div>
        ) : result.checklists && result.checklists.length > 0 ? (
          <BrandingChecklistTable checklists={result.checklists} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Checklists Found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first branding checklist for students.
              </p>
              <CreateChecklistButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}