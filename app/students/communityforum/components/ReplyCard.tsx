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
      day: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-gray-800">{reply.userName}</span>
        <span className="text-sm text-gray-500">
          {formatDate(reply.createdAt)}
        </span>
      </div>
      <p className="text-gray-700">{reply.message}</p>
    </div>
  );
}