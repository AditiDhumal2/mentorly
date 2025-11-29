// components/messaging/MessageBadge.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUnreadMessageCount } from '@/actions/messaging-actions';

interface MessageBadgeProps {
  userId: string | null;
  className?: string;
  showSnackbar?: (message: string, severity?: 'success' | 'error') => void;
}

export default function MessageBadge({ userId, className = '', showSnackbar }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      // Don't fetch if no user ID
      if (!userId) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 MessageBadge - Fetching unread count for user:', userId);
        const result = await getUnreadMessageCount(userId);
        
        if (result.success && result.count !== undefined) {
          console.log('✅ MessageBadge - Unread count:', result.count);
          setUnreadCount(result.count);
        } else {
          console.error('❌ MessageBadge - Failed to get unread count:', result.error);
          if (showSnackbar) {
            showSnackbar(result.error || 'Failed to load unread count', 'error');
          }
        }
      } catch (error) {
        console.error('❌ MessageBadge - Error loading unread count:', error);
        if (showSnackbar) {
          showSnackbar('Error loading unread count', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();
    
    // Refresh every 30 seconds only if user is authenticated
    if (userId) {
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, showSnackbar]);

  // Don't show badge while loading or if no unread messages
  if (loading || unreadCount === 0) return null;

  return (
    <span 
      className={`bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse ${className}`}
      title={`${unreadCount} unread messages`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}