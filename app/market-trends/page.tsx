import { redirect } from 'next/navigation';
import DashboardLayout from '../dashboard/components/DashboardLayout';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

async function getCurrentUserData() {
  try {
    await connectDB();
    
    const userId = '68e77f7e4da2142915e863e6'; // Aditi's user ID
    
    const userDoc = await User.findById(userId).select('-password').lean();
    
    if (!userDoc) {
      throw new Error('User not found');
    }

    const user = userDoc as any;

    return {
      name: user.name || 'User',
      email: user.email || '',
      year: user.year || 1,
      college: user.college || 'Unknown College',
      role: user.role || 'student'
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

export default async function MarketTrendsPage() {
  let userData;

  try {
    userData = await getCurrentUserData();
  } catch (error) {
    console.error('Error loading market trends:', error);
    redirect('/auth/login');
  }

  // Mock data - replace with your actual data fetching
  const trendsData = {
    month: 'January 2024',
    updatedAt: new Date().toISOString(),
    apiSource: 'Industry Reports & Platform Analytics',
    trendingSkills: [
      { skill: 'Artificial Intelligence', demandScore: 95 },
      { skill: 'Cloud Computing', demandScore: 88 },
      { skill: 'Cybersecurity', demandScore: 85 },
      { skill: 'Data Science', demandScore: 82 },
      { skill: 'DevOps', demandScore: 78 },
      { skill: 'Blockchain', demandScore: 75 },
    ],
    hiringDomains: [
      { domain: 'Software Development', openings: 12500 },
      { domain: 'Data Analytics', openings: 8900 },
      { domain: 'Cloud Engineering', openings: 7600 },
      { domain: 'AI/ML Engineering', openings: 6800 },
      { domain: 'Cybersecurity', openings: 5400 },
    ],
    salaryComparison: [
      { role: 'Software Engineer', india: 12, abroad: 85 },
      { role: 'Data Scientist', india: 15, abroad: 95 },
      { role: 'DevOps Engineer', india: 14, abroad: 105 },
      { role: 'AI Engineer', india: 18, abroad: 120 },
      { role: 'Cloud Architect', india: 22, abroad: 130 },
    ],
    hotArticles: [
      { 
        title: 'The Rise of AI in Software Development', 
        url: '#',
        summary: 'How AI tools are transforming the development lifecycle'
      },
      { 
        title: 'Remote Work: The New Normal in Tech', 
        url: '#',
        summary: 'Impact of remote work on hiring and salaries'
      },
    ]
  };

  return (
    <DashboardLayout user={userData}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Market Trends
              </h1>
              <p className="text-gray-300">
                Current industry insights and hiring landscape for {trendsData.month}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-gray-400">
              Last updated: {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trending Skills & Hiring Domains */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Skills Section */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-green-400 mr-2">📈</span>
                  Trending Skills
                </h2>
                <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/50">
                  Top {trendsData.trendingSkills.length} skills
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendsData.trendingSkills
                  .sort((a, b) => b.demandScore - a.demandScore)
                  .map((skill, index) => (
                    <div key={skill.skill} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 border border-green-400/30">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-white text-sm">{skill.skill}</h3>
                        </div>
                        <span className="text-green-400 text-sm font-bold">{skill.demandScore}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                          style={{ width: `${skill.demandScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Hiring Domains Section */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-blue-400 mr-2">💼</span>
                  Top Hiring Domains
                </h2>
                <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/50">
                  Based on job openings
                </span>
              </div>
              <div className="space-y-4">
                {trendsData.hiringDomains
                  .sort((a, b) => b.openings - a.openings)
                  .map((domain, index) => (
                    <div key={domain.domain} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 border border-blue-400/30">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{domain.domain}</h3>
                          <p className="text-gray-400 text-sm">{domain.openings.toLocaleString()} openings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-semibold">
                          {Math.round((domain.openings / trendsData.hiringDomains[0].openings) * 100)}%
                        </div>
                        <div className="text-xs text-gray-400">of peak demand</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Salary Insights & Highlights */}
          <div className="space-y-8">
            {/* Salary Insights */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-yellow-400 mr-2">💰</span>
                Salary Comparison
              </h2>
              <div className="space-y-4">
                {trendsData.salaryComparison.map((salary, index) => (
                  <div key={salary.role} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                    <h3 className="font-semibold text-white text-sm mb-3">{salary.role}</h3>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <div className="text-cyan-400 font-bold">₹{salary.india}L</div>
                        <div className="text-gray-400 text-xs">India</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">${salary.abroad}k</div>
                        <div className="text-gray-400 text-xs">Abroad</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400 border-t border-gray-600/50 pt-3">
                <p>India: LPA (Lakhs Per Annum)</p>
                <p>Abroad: USD Thousands per year</p>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-400/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-purple-400 mr-2">🔥</span>
                What's Hot This Month
              </h2>
              <div className="space-y-4">
                {trendsData.hotArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    className="block p-4 bg-purple-500/10 rounded-lg border border-purple-400/20 hover:bg-purple-500/20 transition-colors group"
                  >
                    <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-purple-300 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-purple-300 text-xs">{article.summary}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}