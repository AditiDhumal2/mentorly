'use client';

import { useState } from 'react';
import { ICareerDomain } from '@/types/careerDomains';
import { deleteCareerDomain } from '@/actions/careerdomain-admin-actions';
import { Edit3, Trash2, MoreVertical, Globe, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminDomainTableProps {
  domains: ICareerDomain[];
  onDomainDeleted?: () => void;
  onDomainUpdated?: () => void;
}

export default function AdminDomainTable({ 
  domains, 
  onDomainDeleted, 
  onDomainUpdated 
}: AdminDomainTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDelete = async (domainId: string) => {
    try {
      setLoading(domainId);
      console.log('🗑️ Deleting domain:', domainId);
      
      const result = await deleteCareerDomain(domainId);
      
      if (result.success) {
        console.log('✅ Domain deleted successfully');
        onDomainDeleted?.();
      } else {
        console.error('❌ Error deleting domain:', result.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('❌ Error deleting domain:', error);
    } finally {
      setLoading(null);
      setActiveMenu(null);
    }
  };

  const handleEdit = (domainId: string) => {
    console.log('✏️ Editing domain:', domainId);
    
    router.push(`/admin/careerdomains/edit/${domainId}`);
  };

  const toggleMenu = (domainId: string) => {
    setActiveMenu(activeMenu === domainId ? null : domainId);
  };

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains found</h3>
        <p className="text-gray-600">Create your first career domain to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900">Career Domains</h3>
        <p className="text-sm text-gray-600 mt-1">Manage all career domains and their details</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tools & Roles
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200/50">
            {domains.map((domain) => (
              <tr key={domain._id} className="hover:bg-gray-50/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{domain.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                      {domain.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {domain.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {domain.skills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{domain.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {domain.tools.slice(0, 2).map((tool, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {domain.roles.length} roles
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {domain.averageSalary?.india && (
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-3 h-3 text-green-600 mr-1" />
                        {domain.averageSalary.india}
                      </div>
                    )}
                    {domain.averageSalary?.abroad && (
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe className="w-3 h-3 text-blue-600 mr-1" />
                        {domain.averageSalary.abroad}
                      </div>
                    )}
                    {!domain.averageSalary?.india && !domain.averageSalary?.abroad && (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <div className="flex justify-end space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(domain._id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      title="Edit domain"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button with Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(domain._id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenu === domain._id && (
                        <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                          <button
                            onClick={() => handleDelete(domain._id)}
                            disabled={loading === domain._id}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {loading === domain._id ? 'Deleting...' : 'Delete Domain'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200/50">
        <p className="text-sm text-gray-600">
          Showing {domains.length} of {domains.length} career domains
        </p>
      </div>
    </div>
  );
}