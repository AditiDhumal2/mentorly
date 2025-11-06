// app/students/highereducation/components/TA_RAGuide.tsx
'use client';

import { useState } from 'react';

export default function TA_RAGuide() {
  const [activeSection, setActiveSection] = useState<'overview' | 'eligibility' | 'application' | 'tips'>('overview');

  const sections = {
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

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
          <span className="text-white text-xl">💼</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">TA/RA Assistantship Guide</h2>
          <p className="text-gray-600">Secure funding through teaching and research positions</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeSection === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <p className="text-lg text-gray-800">
              {sections.overview.content.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-lg text-green-800 mb-3">Benefits</h4>
              <ul className="space-y-2">
                {sections.overview.content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-green-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-bold text-lg text-purple-800 mb-3">Average Stipends</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Public Universities:</span>
                  <span className="font-semibold">$1,500 - $2,200/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Private Universities:</span>
                  <span className="font-semibold">$2,000 - $3,000/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Tier (Ivy League):</span>
                  <span className="font-semibold">$2,500 - $3,500/month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.overview.content.types.map((type, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-xl text-gray-900 mb-3">{type.type}</h4>
                <p className="text-gray-600 mb-4">{type.description}</p>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-semibold">Average Stipend: {type.stipend}</p>
                </div>
                
                <h5 className="font-semibold text-gray-800 mb-2">Responsibilities:</h5>
                <ul className="space-y-1 text-sm text-gray-700">
                  {type.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'eligibility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-blue-800 mb-4 flex items-center">
                <span className="mr-2">🎓</span> Academic Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {sections.eligibility.content.academic.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-green-800 mb-4 flex items-center">
                <span className="mr-2">🗣️</span> Language Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {sections.eligibility.content.language.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-purple-800 mb-4 flex items-center">
                <span className="mr-2">📝</span> Other Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {sections.eligibility.content.other.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="font-bold text-lg text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">💡</span> Key Success Factors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <ul className="space-y-1">
                <li>• Strong letters of recommendation</li>
                <li>• Relevant research experience</li>
                <li>• Clear statement of purpose</li>
                <li>• Publications or conference papers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Contact professors early</li>
                <li>• Tailor applications to specific labs</li>
                <li>• Highlight teaching experience</li>
                <li>• Demonstrate funding need appropriately</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'application' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-bold text-lg text-blue-800 mb-2">Application Timeline</h4>
            <p className="text-blue-700">{sections.application.content.timeline}</p>
          </div>

          <div className="space-y-4">
            {sections.application.content.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{step.step}</h5>
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-bold text-lg text-green-800 mb-3">Sample Timeline</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>12-18 months before:</span>
                <span className="font-semibold">Research universities and faculty</span>
              </div>
              <div className="flex justify-between items-center">
                <span>8-12 months before:</span>
                <span className="font-semibold">Contact professors</span>
              </div>
              <div className="flex justify-between items-center">
                <span>6-8 months before:</span>
                <span className="font-semibold">Prepare application materials</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Application deadline:</span>
                <span className="font-semibold">Submit applications</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'tips' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-lg text-green-800 mb-3">Winning Strategies</h4>
              <ul className="space-y-2 text-sm text-green-700">
                {sections.tips.content.strategies.map((strategy, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h4 className="font-bold text-lg text-red-800 mb-3">Common Mistakes to Avoid</h4>
              <ul className="space-y-2 text-sm text-red-700">
                {sections.tips.content.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h4 className="font-bold text-lg text-purple-800 mb-3">Email Template for Contacting Professors</h4>
            <div className="bg-white rounded-lg p-4 border text-sm">
              <p className="text-gray-600 mb-2"><strong>Subject:</strong> Inquiry about Research Assistant Position - [Your Name]</p>
              <p className="text-gray-700">
                Dear Professor [Last Name],<br/><br/>
                I am writing to express my interest in the Research Assistant positions in your lab...<br/><br/>
                [Your specific interest in their research]<br/><br/>
                I have attached my CV and would be happy to provide any additional information.<br/><br/>
                Best regards,<br/>
                [Your Name]
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}