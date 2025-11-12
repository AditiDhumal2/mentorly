// app/mentors/complete-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { completeMentorProfile } from './actions/complete-profile.actions';
import CategorySelector from '@/app/mentors-auth/register/components/CategorySelector';
import EducationBackground from '@/app/mentors-auth/register/components/EducationBackground';
import SkillsSelector from '@/app/mentors-auth/register/components/SkillsSelector';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    college: '',
    expertise: [] as string[],
    experience: '',
    qualification: '',
    bio: '',
    skills: [] as string[],
    education: [{ degree: '', institution: '', year: '' }] as Education[],
    linkedin: '',
    hourlyRate: ''
  });

  // Check if user should be on this page
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // You might want to add a check here to see if profile is already completed
        // and redirect to pending-approval if so
      } catch (error) {
        console.error('Access check error:', error);
      }
    };
    checkAccess();
  }, []);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.expertise.length === 0) {
      setError('Please select at least one mentoring category');
      return;
    }
    if (currentStep === 2 && formData.skills.length === 0) {
      setError('Please select at least one technical skill');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Enhanced validation
    if (!formData.college || !formData.experience || !formData.qualification || !formData.bio) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.expertise.length === 0) {
      setError('Please select at least one expertise area');
      setLoading(false);
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      setLoading(false);
      return;
    }

    // Validate education
    const hasEmptyEducation = formData.education.some(edu => 
      !edu.degree.trim() || !edu.institution.trim() || !edu.year
    );
    if (hasEmptyEducation) {
      setError('Please fill all education fields or remove empty entries');
      setLoading(false);
      return;
    }

    console.log('🔄 Submitting profile data...', formData);

    try {
      const result = await completeMentorProfile({
        college: formData.college,
        expertise: formData.expertise,
        experience: parseInt(formData.experience),
        qualification: formData.qualification,
        bio: formData.bio,
        skills: formData.skills,
        education: formData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: parseInt(edu.year) || new Date().getFullYear()
        })),
        linkedin: formData.linkedin,
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : 0
      });

      console.log('📨 Server response:', result);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        console.log('✅ Profile submitted successfully, redirecting...');
        
        // 🆕 Use hard redirect instead of router.push to ensure cookie is read
        window.location.href = '/mentors/pending-approval';
        
      } else {
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('❌ Submission error:', err);
      setError('Failed to complete profile: ' + (err.message || 'Network error'));
    }

    setLoading(false);
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`flex flex-col items-center ${
            step < currentStep ? 'text-green-400' : 
            step === currentStep ? 'text-purple-400 font-semibold' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step < currentStep ? 'bg-green-500 text-white' :
              step === currentStep ? 'bg-purple-100 border-2 border-purple-500' :
              'bg-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            <span className="text-xs mt-1">
              {step === 1 && 'Expertise'}
              {step === 2 && 'Skills & Education'}
              {step === 3 && 'Profile Details'}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Profile</span>
          </h1>
          <p className="text-gray-300">
            Complete your profile to submit for admin approval
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8">
          <ProgressBar />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Expertise */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Mentoring Expertise</h2>
                <CategorySelector
                  selectedExpertise={formData.expertise}
                  onExpertiseChange={(expertise) => updateFormData({ expertise })}
                />
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Next: Skills & Education
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Skills & Education */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Skills & Education</h2>
                
                <SkillsSelector
                  selectedSkills={formData.skills}
                  onSkillsChange={(skills) => updateFormData({ skills })}
                />

                <div className="border-t border-white/10 pt-8">
                  <EducationBackground
                    education={formData.education}
                    onEducationChange={(education) => updateFormData({ education })}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Next: Profile Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Profile Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Profile Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      College/University *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => updateFormData({ college: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your college or university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => updateFormData({ experience: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Highest Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => updateFormData({ qualification: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., M.Tech Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => updateFormData({ linkedin: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio/Introduction *
                  </label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => updateFormData({ bio: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell students about your background, experience, and how you can help them..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0 (free mentoring)"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Leave as 0 if you want to offer free mentoring sessions
                  </p>
                </div>

                <div className="flex justify-between pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit for Approval'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}