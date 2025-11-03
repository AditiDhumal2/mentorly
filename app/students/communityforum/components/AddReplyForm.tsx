'use client';

import { useState } from 'react';

interface AddReplyFormProps {
  onAddReply: (message: string) => void;
}

export default function AddReplyForm({ onAddReply }: AddReplyFormProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onAddReply(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your reply..."
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Post Reply
      </button>
    </form>
  );
}