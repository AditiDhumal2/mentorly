// components/messaging/MessageBadge.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUnreadMessageCount } from '@/actions/messaging-actions';

interface MessageBadgeProps {
  userId: string;
  className?: string;
  showSnackbar?: (message: string, severity?: 'success' | 'error') => void;
}

export default function MessageBadge({ userId, className = '', showSnackbar }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await getUnreadMessageCount(userId);
        if (result.success && result.count !== undefined) {
          setUnreadCount(result.count);
        } else if (showSnackbar) {
          showSnackbar(result.error || 'Failed to load unread count', 'error');
        }
      } catch (error) {
        if (showSnackbar) {
          showSnackbar('Error loading unread count', 'error');
        }
      }
    };

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId, showSnackbar]);

  if (unreadCount === 0) return null;

  return (
    <span className={`bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}