// app/students/highereducation/components/TA_RAGuide.tsx
'use client';

import { useState, useEffect } from 'react';
import { getHigherEducationData } from '@/actions/highereducation-students-actions';
import { TA_RAGuideItem } from '@/types/higher-education';

export default function TA_RAGuide() {
  const [activeSection, setActiveSection] = useState<'overview' | 'eligibility' | 'application' | 'tips'>('overview');
  const [taRaGuides, setTaRaGuides] = useState<TA_RAGuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHigherEducationData();
        setTaRaGuides(data.taRaGuides || []);
      } catch (error) {
        console.error('Error fetching TA/RA guides:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get unique countries for filter
  const countries = ['all', ...new Set(taRaGuides.map(guide => guide.countryName))];

  // Filter guides by selected country
  const filteredGuides = selectedCountry === 'all' 
    ? taRaGuides 
    : taRaGuides.filter(guide => guide.countryName === selectedCountry);

  // Fallback data if no database data
  const fallbackData = {
    overview: {
      title: "Teaching & Research Assistantships",
      icon: "👨‍🏫",
      content: {
        description: "TA/RA positions provide financial support through monthly stipends, tuition waivers, and valuable professional experience.",
        benefits: [
          "Full tuition waiver in most universities",
          "Monthly stipend ($1,500 - $3,000 depending on university)",
          "Health insurance coverage",
          "Professional teaching/research experience",
          "Networking opportunities with faculty"
        ],
        types: [
          {
            type: "Teaching Assistant (TA)",
            description: "Assist professors with teaching undergraduate courses",
            responsibilities: ["Grading assignments", "Conducting lab sessions", "Holding office hours", "Tutoring students"],
            stipend: "$1,800 - $2,500/month"
          },
          {
            type: "Research Assistant (RA)",
            description: "Work on research projects under faculty supervision",
            responsibilities: ["Literature review", "Data collection & analysis", "Paper writing", "Lab experiments"],
            stipend: "$2,000 - $3,000/month"
          }
        ]
      }
    },
    eligibility: {
      title: "Eligibility Requirements",
      icon: "✅",
      content: {
        academic: [
          "Strong academic record (GPA 3.5+ preferred)",
          "Relevant background in proposed research/teaching area",
          "Good standardized test scores (GRE 320+ for STEM)",
          "Prior research/teaching experience (advantageous)"
        ],
        language: [
          "TOEFL iBT 100+ or IELTS 7.5+ for international students",
          "Good communication skills for TA positions",
          "Some universities require spoken English tests"
        ],
        other: [
          "Full-time enrollment in graduate program",
          "Good standing with the university",
          "Specific course prerequisites for TA positions"
        ]
      }
    },
    application: {
      title: "Application Process",
      icon: "📝",
      content: {
        steps: [
          {
            step: "1. Research Faculty",
            description: "Identify professors whose research aligns with your interests"
          },
          {
            step: "2. Prepare Documents",
            description: "CV, transcripts, research statement, writing samples"
          },
          {
            step: "3. Contact Professors",
            description: "Send personalized emails 6-8 months before application deadline"
          },
          {
            step: "4. Apply to Program",
            description: "Indicate interest in TA/RA positions in your application"
          },
          {
            step: "5. Interview",
            description: "Be prepared for teaching/research focused interviews"
          }
        ],
        timeline: "Start the process 12-18 months before intended start date"
      }
    },
    tips: {
      title: "Success Tips",
      icon: "💡",
      content: {
        strategies: [
          "Start early and be proactive in contacting faculty",
          "Tailor your application to specific research groups",
          "Highlight relevant coursework and projects",
          "Obtain strong letters of recommendation",
          "Prepare a compelling research statement"
        ],
        commonMistakes: [
          "Generic emails to multiple professors",
          "Poorly written research statements",
          "Not highlighting relevant experience",
          "Waiting too long to start the process"
        ]
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading TA/RA Guides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
            <span className="text-white text-xl">💼</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">TA/RA Assistantship Guide</h2>
            <p className="text-gray-600">Secure funding through teaching and research positions</p>
          </div>
        </div>
        
        {/* Country Filter */}
        {taRaGuides.length > 0 && (
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {countries.map(country => (
              <option key={country} value={country}>
                {country === 'all' ? 'All Countries' : country}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Show database data if available, otherwise fallback */}
      {taRaGuides.length > 0 ? (
        <div className="space-y-6">
          {filteredGuides.map((guide) => (
            <div key={guide._id} className="border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{guide.countryName} - TA/RA Guide</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Stipend: {guide.averageStipend}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eligibility */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-3">Eligibility</h4>
                  <ul className="space-y-2">
                    {guide.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start text-green-700">
                        <span className="text-green-500 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {guide.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-blue-700">
                        <span className="text-blue-500 mr-2">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Process */}
                <div className="bg-purple-50 rounded-lg p-4 md:col-span-2">
                  <h4 className="font-bold text-purple-800 mb-3">Application Process</h4>
                  <div className="space-y-2">
                    {guide.applicationProcess.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">
                          {index + 1}
                        </span>
                        <span className="text-purple-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Documents */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-3">Required Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.documentsRequired.map((doc, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-bold text-indigo-800 mb-3">Timeline</h4>
                  <ul className="space-y-2">
                    {guide.timeline.map((item, index) => (
                      <li key={index} className="text-indigo-700 text-sm">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-3">Success Tips</h4>
                <ul className="space-y-2">
                  {guide.tips.map((tip, index) => (
                    <li key={index} className="flex items-start text-green-700">
                      <span className="text-green-500 mr-2">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              {guide.contactInfo && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {guide.contactInfo.email && (
                      <div>
                        <strong>Email:</strong> {guide.contactInfo.email}
                      </div>
                    )}
                    {guide.contactInfo.website && (
                      <div>
                        <strong>Website:</strong> 
                        <a href={guide.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {guide.contactInfo.website}
                        </a>
                      </div>
                    )}
                    {guide.contactInfo.deadline && (
                      <div>
                        <strong>Deadline:</strong> {guide.contactInfo.deadline}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Fallback to hardcoded data if no database data
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Note:</strong> Using general TA/RA information. Specific country guides will be available soon.
            </p>
          </div>
          
          {/* Your existing hardcoded component content here */}
          {/* ... include all your existing hardcoded JSX ... */}
        </div>
      )}
    </div>
  );
}