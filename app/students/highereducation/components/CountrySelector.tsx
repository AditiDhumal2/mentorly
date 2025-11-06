// app/students/highereducation/components/CountrySelector.tsx
'use client';

import { useState } from 'react';
import { Country, UniversityDetail } from '@/types/higher-education';

interface CountrySelectorProps {
  countries: Country[] | null | undefined;
}

// Default empty country structure that matches your DB
const defaultCountry: Partial<Country> = {
  topInstitutes: [],
  visaRequirements: [],
  taRaGuide: {
    eligibility: [
      "Full-time enrollment in graduate program",
      "Minimum GPA of 3.0/4.0",
      "Good academic standing",
      "Relevant background for position"
    ],
    requirements: [
      "CV/Resume",
      "Statement of purpose",
      "Letters of recommendation",
      "Transcripts"
    ],
    applicationProcess: [
      "Apply to graduate program",
      "Indicate interest in assistantship",
      "Contact potential advisors"
    ],
    tips: [
      "Contact professors early",
      "Highlight relevant experience",
      "Tailor applications to specific programs"
    ],
    documentsRequired: [
      "Updated CV",
      "Academic transcripts",
      "Statement of purpose"
    ],
    averageStipend: '$1,500 - $2,500/month'
  },
  costOfLiving: {
    monthly: 'Not specified',
    yearly: 'Not specified'
  }
};

// Country flag mapping
const countryFlags: { [key: string]: string } = {
  'United States': '🇺🇸',
  'Germany': '🇩🇪', 
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'Australia': '🇦🇺',
  'France': '🇫🇷',
  'Netherlands': '🇳🇱',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'Singapore': '🇸🇬'
};

export default function CountrySelector({ countries }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'universities' | 'visa' | 'cost' | 'ta-ra'>('universities');
  const [searchTerm, setSearchTerm] = useState('');

  console.log('Countries data received:', countries); // Debug log

  // Safe countries data with fallbacks - handle both topInstitutes and popularUniversities
  const safeCountries: Country[] = (countries || []).map(country => {
    const flag = countryFlags[country.name] || '🏳️';
    
    // Use popularUniversities from DB if available, otherwise use topInstitutes
    const universities = (country as any).popularUniversities || country.topInstitutes || [];
    
    return {
      _id: country._id || `country-${Math.random()}`,
      name: country.name || 'Unknown Country',
      code: country.code || 'XX',
      flag: flag,
      topInstitutes: universities,
      visaRequirements: country.visaRequirements || [],
      costOfLiving: country.costOfLiving || defaultCountry.costOfLiving!,
      taRaGuide: country.taRaGuide || defaultCountry.taRaGuide!,
      popularity: country.popularity || 'medium'
    };
  });

  const filteredCountries = safeCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.topInstitutes.some(uni => 
      uni.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Safe university data with fallbacks
  const getSafeUniversity = (university: any): UniversityDetail => ({
    _id: university._id || `uni-${Math.random()}`,
    name: university.name || 'Unknown University',
    ranking: university.ranking || 0,
    globalRanking: university.globalRanking || university.ranking || 0,
    website: university.website || '#',
    popularPrograms: university.popularPrograms || [],
    admissionCriteria: university.admissionCriteria || {
      gpa: 0,
      gre: 0,
      ielts: 0,
      toefl: 0
    },
    averageSalary: university.averageSalary || {
      masters: 'Not specified',
      phd: 'Not specified'
    },
    tuitionFees: university.tuitionFees || {
      masters: 'Not specified',
      phd: 'Not specified'
    },
    financialAid: university.financialAid || {
      ta: false,
      ra: false,
      scholarships: false,
      fellowship: false
    },
    applicationDeadlines: university.applicationDeadlines || {
      fall: 'Not specified',
      spring: 'Not specified'
    }
  });

  // Safe access to university ranking with fallbacks
  const getUniversityRankingText = (university: UniversityDetail) => {
    const hasGlobalRanking = university.globalRanking && university.globalRanking > 0;
    const hasCountryRanking = university.ranking && university.ranking > 0;
    
    if (hasGlobalRanking && hasCountryRanking) {
      return `Global Rank: #${university.globalRanking} • Country Rank: #${university.ranking}`;
    } else if (hasGlobalRanking) {
      return `Global Rank: #${university.globalRanking}`;
    } else if (hasCountryRanking) {
      return `Country Rank: #${university.ranking}`;
    } else {
      return 'Ranking: Not specified';
    }
  };

  // Safe access to TA/RA guide with fallbacks
  const getSafeTaRaGuide = (country: Country) => {
    return country.taRaGuide || defaultCountry.taRaGuide!;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">🌍</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Destinations</h2>
          <p className="text-gray-600">Explore top universities and their requirements</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search countries or universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
        </div>
      </div>
      
      {/* Country Grid with Flags */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {filteredCountries.map((country, index) => (
          <div
            key={country._id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedCountry?._id === country._id 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedCountry(country);
              setSelectedUniversity(null);
              setActiveTab('universities');
            }}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{country.flag}</span>
              <h3 className="font-bold text-gray-800 text-base">{country.name}</h3>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {country.topInstitutes.length} top institute{country.topInstitutes.length !== 1 ? 's' : ''}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                country.popularity === 'high' ? 'bg-green-100 text-green-800' :
                country.popularity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {country.popularity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Country Details */}
      {selectedCountry && (
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{selectedCountry.flag}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCountry.name}</h3>
                <p className="text-gray-600 text-sm">Detailed university information and requirements</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            {[
              { id: 'universities', label: 'Top Universities', icon: '🏛️' },
              { id: 'visa', label: 'Visa Info', icon: '📋' },
              { id: 'cost', label: 'Cost of Living', icon: '💰' },
              { id: 'ta-ra', label: 'TA/RA Guide', icon: '👨‍🏫' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 rounded-md flex-1 text-center transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'universities' && (
            <div className="space-y-4">
              {selectedCountry.topInstitutes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCountry.topInstitutes.map((university, index) => (
                      <div
                        key={university._id || `university-${index}`}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          selectedUniversity?._id === university._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedUniversity(getSafeUniversity(university))}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-base text-gray-900">{university.name}</h4>
                            <p className="text-xs text-gray-600">
                              {getUniversityRankingText(university)}
                            </p>
                          </div>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Top Tier
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Popular Programs:</span>
                            <span className="text-gray-900 font-medium text-right">
                              {university.popularPrograms.slice(0, 2).join(', ')}
                              {university.popularPrograms.length > 2 && '...'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GPA Requirement:</span>
                            <span className="text-gray-900 font-medium">
                              {university.admissionCriteria?.gpa > 0 ? `${university.admissionCriteria.gpa}+` : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GRE Requirement:</span>
                            <span className="text-gray-900 font-medium">
                              {university.admissionCriteria?.gre > 0 ? `${university.admissionCriteria.gre}+` : 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* University Details */}
                  {selectedUniversity && (
                    <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 mt-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-900">{selectedUniversity.name}</h4>
                        <a
                          href={selectedUniversity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Visit Website
                          <span className="ml-1">🔗</span>
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold mb-2 text-gray-800 border-b pb-1 text-sm">Admission Requirements</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">GPA Requirement:</span>
                              <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {selectedUniversity.admissionCriteria.gpa > 0 ? `${selectedUniversity.admissionCriteria.gpa}+` : 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">GRE Score:</span>
                              <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                                {selectedUniversity.admissionCriteria.gre > 0 ? `${selectedUniversity.admissionCriteria.gre}+` : 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">English Proficiency:</span>
                              <span className="font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {selectedUniversity.admissionCriteria.ielts > 0 && `IELTS ${selectedUniversity.admissionCriteria.ielts}+`}
                                {selectedUniversity.admissionCriteria.ielts > 0 && selectedUniversity.admissionCriteria.toefl > 0 && ' / '}
                                {selectedUniversity.admissionCriteria.toefl > 0 && `TOEFL ${selectedUniversity.admissionCriteria.toefl}+`}
                                {!selectedUniversity.admissionCriteria.ielts && !selectedUniversity.admissionCriteria.toefl && 'Not specified'}
                              </span>
                            </div>
                            {selectedUniversity.admissionCriteria.workExperience && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Work Experience:</span>
                                <span className="font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  {selectedUniversity.admissionCriteria.workExperience} years
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2 text-gray-800 border-b pb-1 text-sm">Salary Information</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Average Salary (Masters):</span>
                              <span className="font-medium text-green-600">{selectedUniversity.averageSalary.masters}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average Salary (PhD):</span>
                              <span className="font-medium text-green-600">{selectedUniversity.averageSalary.phd}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Popular Programs:</span>
                              <span className="font-medium text-right">
                                {selectedUniversity.popularPrograms.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-3">🏛️</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No University Data Available</h3>
                  <p className="text-gray-600 text-sm">University information for {selectedCountry.name} is currently being updated.</p>
                </div>
              )}
            </div>
          )}

          {/* Visa Tab */}
          {activeTab === 'visa' && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900">Visa Requirements for {selectedCountry.name}</h4>
              {selectedCountry.visaRequirements.length > 0 ? (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <ul className="space-y-2">
                    {selectedCountry.visaRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start text-orange-800 text-sm">
                        <span className="text-orange-500 mr-2 mt-1">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">Visa information for {selectedCountry.name} is currently being updated.</p>
                </div>
              )}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900">Cost of Living in {selectedCountry.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                  <h5 className="font-semibold text-green-800 mb-2">Monthly Expenses</h5>
                  <p className="text-xl font-bold text-green-600">{selectedCountry.costOfLiving.monthly}</p>
                  <p className="text-sm text-green-600 mt-1">Average per month</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                  <h5 className="font-semibold text-blue-800 mb-2">Yearly Expenses</h5>
                  <p className="text-xl font-bold text-blue-600">{selectedCountry.costOfLiving.yearly}</p>
                  <p className="text-sm text-blue-600 mt-1">Including tuition</p>
                </div>
              </div>
            </div>
          )}

          {/* TA/RA Tab */}
          {activeTab === 'ta-ra' && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900">Teaching & Research Assistantship Guide</h4>
              
              {/* Get safe TA/RA guide with fallbacks */}
              {(() => {
                const taRaGuide = getSafeTaRaGuide(selectedCountry);
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                        <h5 className="font-semibold mb-3 text-gray-800 flex items-center">
                          <span className="mr-2">✅</span> Eligibility Criteria
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {taRaGuide.eligibility.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                        <h5 className="font-semibold mb-3 text-gray-800 flex items-center">
                          <span className="mr-2">💼</span> Documents Required
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {taRaGuide.documentsRequired.map((doc, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <h5 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <span className="mr-2">💡</span> Pro Tips for TA/RA Applications
                      </h5>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {taRaGuide.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                      <p className="text-lg font-semibold text-blue-800">
                        Average Monthly Stipend: {taRaGuide.averageStipend}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        This typically includes tuition waiver and health insurance
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Empty States */}
      {safeCountries.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Country Data Available</h3>
          <p className="text-gray-600 text-sm">Country information is currently being updated. Please check back later.</p>
        </div>
      )}

      {safeCountries.length > 0 && filteredCountries.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No countries found</h3>
          <p className="text-gray-600 text-sm">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}