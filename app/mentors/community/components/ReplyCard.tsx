import { CommunityReply } from '@/types/community';

interface ReplyCardProps {
  reply: CommunityReply;
}

export default function ReplyCard({ reply }: ReplyCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: 'student' | 'mentor' | 'moderator' | 'admin') => {
    const roleStyles = {
      student: 'bg-blue-100 text-blue-800 border border-blue-200',
      mentor: 'bg-green-100 text-green-800 border border-green-200',
      moderator: 'bg-purple-100 text-purple-800 border border-purple-200',
      admin: 'bg-red-100 text-red-800 border border-red-200'
    };

    const roleLabels = {
      student: '👨‍🎓 Student',
      mentor: '👨‍🏫 Mentor',
      moderator: '🛡️ Moderator',
      admin: '👑 Admin'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role]}`}>
        {roleLabels[role]}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-800">{reply.userName}</span>
          {getRoleBadge(reply.userRole)}
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(reply.createdAt)}
        </span>
      </div>
      <p className="text-gray-700">{reply.message}</p>
    </div>
  );
}