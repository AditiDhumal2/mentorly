'use client';

import { useState, useEffect } from 'react';
import { getAllCareerDomains, getCareerDomainsStats } from '@/actions/careerdomain-admin-actions';
import AdminDomainTable from './components/AdminDomainTable';
import CreateDomainForm from './components/CreateDomainForm';
import StatsOverview from './components/StatsOverview';
import PageHeader from './components/PageHeader';
import SearchFilters from './components/SearchFilters';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import { ICareerDomain, CareerDomainsStats } from '@/types/careerDomains';

export default function AdminCareerDomainsPage() {
  const [domains, setDomains] = useState<ICareerDomain[]>([]);
  const [stats, setStats] = useState<CareerDomainsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [domainsData, statsData] = await Promise.all([
        getAllCareerDomains(),
        getCareerDomainsStats()
      ]);
      setDomains(domainsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader onRefresh={handleRefresh} />
        
        <StatsOverview stats={stats} />
        
        {domains.length > 0 && (
          <SearchFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultsCount={filteredDomains.length}
            totalCount={domains.length}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 sticky top-6">
              <CreateDomainForm onDomainCreated={handleRefresh} />
            </div>
          </div>

          <div className="xl:col-span-3">
            {domains.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <AdminDomainTable 
                  domains={filteredDomains} 
                  onDomainDeleted={handleRefresh}
                  onDomainUpdated={handleRefresh}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {filteredDomains.length === 0 && domains.length > 0 && (
          <div className="mt-6">
            <EmptyState 
              type="search"
              title="No domains found"
              description="Try adjusting your search terms to find what you're looking for."
            />
          </div>
        )}
      </div>
    </div>
  );
}