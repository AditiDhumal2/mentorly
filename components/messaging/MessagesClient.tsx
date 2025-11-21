// components/messaging/MessagesClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/types/messaging';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import { getConversationsAction } from '@/actions/messaging-actions';
import Snackbar from '@/components/Snackbar';

interface MessagesClientProps {
  currentUser: any;
  basePath: string; // '/students' or '/mentors'
}

export default function MessagesClient({ currentUser, basePath }: MessagesClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadConversations();
  }, [currentUser]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await getConversationsAction(
        currentUser.id || currentUser._id,
        currentUser.role
      );
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        showSnackbar(result.error || 'Failed to load conversations', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading conversations', 'error');
    }
    setLoading(false);
  };

  const handleNewConversation = (user: { id: string; name: string; role: string }) => {
    setSelectedUser(user);
    setShowNewMessage(false);
    
    // Add to conversations if not already there
    if (!conversations.find(conv => conv.userId === user.id)) {
      setConversations(prev => [{
        userId: user.id,
        userName: user.name,
        userRole: user.role as any,
        unreadCount: 0
      }, ...prev]);
    }
    
    showSnackbar(`Started conversation with ${user.name}`);
  };

  const handleRefreshConversations = () => {
    loadConversations();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">Loading messages...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Conversations</h2>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    New Message
                  </button>
                </div>
                
                {showNewMessage && (
                  <UserSearch
                    currentUserId={currentUser.id || currentUser._id}
                    onUserSelect={handleNewConversation}
                    onClose={() => setShowNewMessage(false)}
                    currentUserRole={currentUser.role}
                    showSnackbar={showSnackbar}
                  />
                )}
              </div>
              
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUser?.id}
                onSelectConversation={(user) => setSelectedUser(user)}
                currentUser={currentUser}
              />
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <ChatWindow
                  currentUser={currentUser}
                  otherUser={selectedUser}
                  onMessageSent={handleRefreshConversations}
                  showSnackbar={showSnackbar}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                    <p className="text-gray-600 mb-4">Choose a conversation from the list or start a new one</p>
                    <button
                      onClick={() => setShowNewMessage(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </div>
  );
}