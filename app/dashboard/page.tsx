import { redirect } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';
import StatsGrid from './components/StatsGrid';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import ProgressChart from './components/ProgressChart';
import { getUserData, getUserProgress } from '../../actions/userActions';

async function getUserId() {
  return '68e77f7e4da2142915e863e6';
}

export default async function DashboardPage() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      redirect('/auth/login');
    }

    const [userData, progressData] = await Promise.all([
      getUserData(userId),
      getUserProgress(userId)
    ]);

    const dashboardUser = {
      name: userData.name,
      email: userData.email,
      year: userData.year,
      college: userData.college,
    };

    return (
      <DashboardLayout user={dashboardUser}>
        <div className="space-y-8">
          {/* Welcome Header with Dark Theme */}
          <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden border border-cyan-400/20">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                    <div className="text-white font-bold text-lg">M</div>
                  </div>
                  <span className="text-cyan-200 text-sm font-medium">Mentorly Dashboard</span>
                </div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                  Welcome back, {userData.name}! 👋
                </h1>
                <p className="text-cyan-100 text-lg mb-6 max-w-2xl">
                  You're in <span className="font-semibold text-white">Year {userData.year}</span> at{" "}
                  <span className="font-semibold text-white">{userData.college}</span>. 
                  Your engineering career journey continues here!
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                    <span className="text-yellow-300">⭐</span>
                    <span className="text-sm font-medium">Ready to Learn</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                    <span className="text-green-300">🚀</span>
                    <span className="text-sm font-medium">Career Path Active</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                    <span className="text-cyan-300">🎯</span>
                    <span className="text-sm font-medium">Goals Set</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-400/30 shadow-2xl">
                    <span className="text-4xl">🎓</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs text-white">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid 
            roadmapProgress={progressData.roadmapProgress}
            brandingProgress={progressData.brandingProgress}
            savedResources={progressData.savedResources}
            currentYear={userData.year}
          />

          {/* Rest of your dashboard content with dark theme adjustments */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-2 space-y-8">
              <ProgressChart 
                roadmapProgress={progressData.roadmapProgress}
                brandingProgress={progressData.brandingProgress}
              />
              <QuickActions currentYear={userData.year} />
              
              {/* Learning Path Preview - Dark Theme */}
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="text-cyan-400 mr-2">📚</span>
                    Your Learning Path
                  </h2>
                  <span className="text-sm text-cyan-400 font-semibold bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                    Year {userData.year}
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Programming Fundamentals', status: 'completed', progress: 100 },
                    { title: 'Data Structures & Algorithms', status: 'in-progress', progress: 65 },
                    { title: 'Web Development Basics', status: 'not-started', progress: 0 },
                    { title: 'Database Management', status: 'not-started', progress: 0 },
                  ].map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/80 transition-colors border border-gray-600/50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          course.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-400/30' :
                          course.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' :
                          'bg-gray-600 text-gray-400 border border-gray-500/30'
                        }`}>
                          {course.status === 'completed' ? '✓' : course.status === 'in-progress' ? '⟳' : '•'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{course.title}</h3>
                          <p className={`text-sm ${
                            course.status === 'completed' ? 'text-green-400' :
                            course.status === 'in-progress' ? 'text-blue-400' :
                            'text-gray-400'
                          }`}>
                            {course.status === 'completed' ? 'Completed' : 
                             course.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-24 bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              course.status === 'completed' ? 'bg-green-500' :
                              course.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <RecentActivity activities={progressData.recentActivity} />
              
              {/* Weekly Goals - Dark Theme */}
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="text-yellow-400 mr-2">🎯</span>
                    Weekly Goals
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded border border-gray-600/50">
                    This Week
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { task: 'Complete 2 roadmap steps', progress: 50, icon: '🗺️', color: 'cyan' },
                    { task: 'Solve 5 DSA problems', progress: 20, icon: '💻', color: 'blue' },
                    { task: 'Update LinkedIn profile', progress: 80, icon: '⭐', color: 'purple' },
                    { task: 'Join 1 coding contest', progress: 0, icon: '🏆', color: 'orange' },
                  ].map((goal, index) => (
                    <div key={index} className="group p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/80 transition-all duration-300 border border-gray-600/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-${goal.color}-500/20 text-${goal.color}-400 flex items-center justify-center border border-${goal.color}-400/30`}>
                          <span className="text-sm">{goal.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{goal.task}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progress</span>
                          <span className={`font-semibold text-${goal.color}-400`}>{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r from-${goal.color}-400 to-${goal.color}-600 h-2 rounded-full transition-all duration-500 group-hover:shadow-lg`}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines - Dark Theme */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-400/30 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-red-400 mr-2">⏰</span>
                  Upcoming Deadlines
                </h2>
                <div className="space-y-3">
                  {[
                    { title: 'DSA Assignment', date: 'Oct 15', priority: 'high' },
                    { title: 'Web Dev Project', date: 'Oct 20', priority: 'medium' },
                    { title: 'Resume Update', date: 'Oct 25', priority: 'low' },
                  ].map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-orange-400/20">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          deadline.priority === 'high' ? 'bg-red-500' :
                          deadline.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="font-medium text-white text-sm">{deadline.title}</span>
                      </div>
                      <span className="text-xs text-gray-300 bg-gray-600/50 px-2 py-1 rounded border border-gray-500/50">
                        {deadline.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Section - Dark Theme */}
          <div className="bg-gradient-to-r from-cyan-600/80 to-blue-600/80 backdrop-blur-lg rounded-2xl p-8 text-white text-center shadow-xl border border-cyan-400/30">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
                  <div className="text-white font-bold text-sm">M</div>
                </div>
                <span className="text-cyan-200 font-medium">Mentorly</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Keep Building! 🚀</h2>
              <p className="text-cyan-100 text-lg mb-6">
                "The expert in anything was once a beginner. Every small step you take today brings you closer to your dream career."
              </p>
              <div className="flex justify-center space-x-4">
                <div className="flex items-center space-x-2 text-cyan-200">
                  <span>⭐</span>
                  <span className="text-sm">You're on the right path</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-200">
                  <span>💪</span>
                  <span className="text-sm">Stay consistent</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-200">
                  <span>🎯</span>
                  <span className="text-sm">Focus on growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-400/30">
            <span className="text-2xl text-red-400">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error loading dashboard</h1>
          <p className="text-gray-400 mb-4">Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 border border-cyan-400/50"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }
}