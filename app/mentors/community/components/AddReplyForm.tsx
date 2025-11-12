// app/mentors/community/components/AddReplyForm.tsx
'use client';

import { useState } from 'react';

interface AddReplyFormProps {
  onAddReply: (message: string) => void | Promise<void>; // Allow both sync and async
}

export default function AddReplyForm({ onAddReply }: AddReplyFormProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !submitting) {
      setSubmitting(true);
      try {
        console.log('📤 Submitting reply:', message);
        await Promise.resolve(onAddReply(message)); // Handle both sync and async
        setMessage('');
      } catch (error) {
        console.error('Error submitting reply:', error);
      } finally {
        setSubmitting(false);
      }
    } else {
      alert('Please write a reply before submitting');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-lg font-semibold text-blue-800 mb-3">Post Your Reply</h4>
      <div className="mb-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your reply as a mentor... Share your expertise and help students learn!"
          required
          disabled={submitting}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Character count: {message.length}
        </span>
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : '💬 Post Reply as Mentor'}
        </button>
      </div>
    </form>
  );
}