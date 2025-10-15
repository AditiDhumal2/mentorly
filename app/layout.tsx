// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { getCurrentUser } from '@/lib/session';
import DashboardLayoutWrapper from './components/DashboardLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  
  try {
    user = await getCurrentUser();
    console.log('=== ROOT LAYOUT ===');
    console.log('🔍 User from session:', user);
  } catch (error) {
    console.error('🔍 Error getting user:', error);
    user = null;
  }

  const userData = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    year: user.year || 0,
    college: user.college || '',
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    profiles: user.profiles,
    interests: user.interests,
    roadmapProgress: user.roadmapProgress,
    learningStats: user.learningStats
  } : null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayoutWrapper userData={userData}>
          {children}
        </DashboardLayoutWrapper>
      </body>
    </html>
  );
}