 // app/mentors/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from '@/actions/mentor-auth-actions';
import { getMentorDashboardData } from '@/actions/mentor-dashboard-actions';
import WelcomeBanner from './components/WelcomeBanner';
import ProfilePhotoUpload from './components/ProfilePhotoUpload';
import StatsOverview from './components/StatsOverview';
import QuickActions from './components/QuickActions';
import RecentActivities from './components/RecentActivities';
import UpcomingSessions from './components/UpcomingSessions';
import GettingStarted from './components/GettingStarted';
import MentorTips from './components/MentorTips';
import AccessDenied from './components/AccessDenied';
import LoadingSpinner from './components/LoadingSpinner';
import { Mentor, DashboardStats, Session, Activity } from '@/types';

export default function MentorDashboard() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    completedSessions: 0,
    studentsHelped: 0,
    rating: 0,
    pendingRequests: 0,
    totalEarnings: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      try {
        const authResult = await checkMentorAuth();
        
        if (!authResult.isAuthenticated || !authResult.mentor) {
          window.location.href = '/mentors-auth/login';
          return;
        }

        const mentorData = authResult.mentor as Mentor;
        setMentor(mentorData);

        if (!mentorData.profileCompleted) {
          setAccessDenied(true);
          setDeniedReason('profile');
          return;
        }

        if (mentorData.approvalStatus !== 'approved') {
          setAccessDenied(true);
          setDeniedReason('approval');
          return;
        }

        await loadDashboardData(mentorData);

      } catch (error) {
        window.location.href = '/mentors-auth/login';
      } finally {
        setLoading(false);
      }
    };

    const loadDashboardData = async (mentorData: Mentor) => {
      try {
        const dashboardResult = await getMentorDashboardData(mentorData._id);
        
        if (dashboardResult.success && dashboardResult.mentor) {
          setStats(dashboardResult.stats || {
            upcomingSessions: 0,
            completedSessions: mentorData.totalSessions || 0,
            studentsHelped: mentorData.stats?.studentsHelped || 0,
            rating: mentorData.rating || 0,
            pendingRequests: 0,
            totalEarnings: 0
          });

          if (dashboardResult.upcomingSessions) {
            setUpcomingSessions(dashboardResult.upcomingSessions);
          }

          if (dashboardResult.recentActivities) {
            const activitiesWithIcons: Activity[] = dashboardResult.recentActivities.map(activity => ({
              ...activity,
              type: normalizeActivityType(activity.type),
              icon: getActivityIcon(activity.type),
            }));
            setRecentActivities(activitiesWithIcons);
          }

          setMentor(dashboardResult.mentor);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    const normalizeActivityType = (type: string): Activity['type'] => {
      const validTypes: Activity['type'][] = ['session', 'request', 'message', 'review', 'payment'];
      return validTypes.includes(type as Activity['type']) ? type as Activity['type'] : 'other';
    };

    const getActivityIcon = (type: string): string => {
      const icons: { [key: string]: string } = {
        session: '🎯',
        request: '🆕',
        message: '💬',
        review: '⭐',
        payment: '💰'
      };
      return icons[type] || '📝';
    };

    checkAuthAndAccess();
  }, []);

  const handleProfilePhotoUpdate = (imageUrl: string) => {
    if (mentor) {
      setMentor({ ...mentor, profilePhoto: imageUrl });
    }
  };

  if (accessDenied) {
    return <AccessDenied reason={deniedReason} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!mentor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <WelcomeBanner mentor={mentor} stats={stats} />
        <ProfilePhotoUpload mentor={mentor} onPhotoUpdate={handleProfilePhotoUpdate} />
        <StatsOverview stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <QuickActions />
            <RecentActivities activities={recentActivities} />
          </div>
          
          <div className="space-y-6">
            <UpcomingSessions sessions={upcomingSessions} />
            <GettingStarted />
            <MentorTips />
          </div>
        </div>
      </div>
    </div>
  );
}