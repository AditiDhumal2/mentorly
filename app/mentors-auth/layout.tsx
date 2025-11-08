// app/mentors-auth/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentor Registration - Mentorly',
  description: 'Join as a mentor to guide students and share your expertise',
};

export default function MentorAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {children}
    </div>
  );
}