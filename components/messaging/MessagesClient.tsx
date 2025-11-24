// components/messaging/MessagesClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getConversationsAction, 
  getMessagesAction, 
  sendMessageAction, 
  searchUsersAction,
  getUnreadCountAction 
} from '@/actions/messaging-actions';
import { Conversation, UserSearchResult } from '@/types/messaging';

interface MessagesClientProps {
  currentUser: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: 'student' | 'mentor' | 'admin';
    profilePhoto?: string;
  };
  basePath: string;
}

export default function MessagesClient({ currentUser, basePath }: MessagesClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const userId = currentUser._id || currentUser.id;

  // Load conversations
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [userId]);

  // Load messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const result = await getConversationsAction(userId!, currentUser.role);
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const result = await getMessagesAction(userId!, otherUserId);
      if (result.success && result.messages) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadCountAction(userId!);
      if (result.success && result.count !== undefined) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const messageData = {
        receiverId: selectedUser.userId,
        receiverName: selectedUser.userName,
        receiverRole: selectedUser.userRole,
        content: newMessage.trim()
      };

      const result = await sendMessageAction(
        userId!,
        currentUser.name,
        currentUser.role,
        messageData
      );

      if (result.success) {
        setNewMessage('');
        // Reload messages and conversations
        await loadMessages(selectedUser.userId);
        await loadConversations();
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await searchUsersAction(query, userId!);
      if (result.success && result.users) {
        setSearchResults(result.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startNewConversation = (user: UserSearchResult) => {
    const newConversation: Conversation = {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      profilePhoto: user.profilePhoto,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };
    
    setSelectedUser(newConversation);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSidebarCollapsed(true); // Auto-collapse sidebar when conversation starts
    
    // Update URL
    router.push(`${basePath}/messages/${user._id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get user initials for fallback avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user avatar color based on name
  const getUserColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-rose-500 to-rose-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] min-h-[600px] max-h-[800px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Conversations Sidebar - Reduced Width */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} border-r border-gray-200 flex flex-col bg-gray-50/50 transition-all duration-300 ease-in-out`}>
        
        {/* Header - Compact when collapsed */}
        <div className="p-4 border-b border-gray-200 bg-white">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                <p className="text-xs text-gray-600 mt-1">{conversations.length} conversations</p>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  title="New conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Collapse sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Expand sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-1 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                title="New conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}

          {/* Search - Only show when sidebar is expanded */}
          {showSearch && !sidebarCollapsed && (
            <div className="relative mt-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  <div className="p-1">
                    <div className="text-xs font-semibold text-gray-500 px-2 py-1">SEARCH RESULTS</div>
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => startNewConversation(user)}
                        className="w-full p-2 text-left hover:bg-gray-50 rounded-md flex items-center space-x-2 transition-colors duration-200 text-sm"
                      >
                        {user.profilePhoto ? (
                          <img 
                            src={user.profilePhoto} 
                            alt={user.name}
                            className="w-6 h-6 rounded-md object-cover"
                          />
                        ) : (
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium ${getUserColor(user.name)}`}>
                            {getUserInitials(user.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversations List - Compact when collapsed */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !sidebarCollapsed ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-sm">No conversations</p>
            </div>
          ) : sidebarCollapsed ? (
            // Compact sidebar - just avatars
            <div className="p-2 space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => {
                    setSelectedUser(conversation);
                    setSidebarCollapsed(true);
                  }}
                  className={`w-full p-2 rounded-lg transition-all duration-200 relative ${
                    selectedUser?.userId === conversation.userId 
                      ? 'bg-blue-100 ring-2 ring-blue-300' 
                      : 'hover:bg-white hover:ring-1 hover:ring-gray-200'
                  }`}
                  title={conversation.userName}
                >
                  {conversation.profilePhoto ? (
                    <img 
                      src={conversation.profilePhoto} 
                      alt={conversation.userName}
                      className="w-8 h-8 rounded-lg object-cover mx-auto"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium mx-auto ${getUserColor(conversation.userName)}`}>
                      {getUserInitials(conversation.userName)}
                    </div>
                  )}
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            // Expanded sidebar - full conversation preview
            <div className="p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => setSelectedUser(conversation)}
                  className={`w-full p-3 text-left rounded-xl transition-all duration-200 mb-1 ${
                    selectedUser?.userId === conversation.userId 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' 
                      : 'hover:bg-white border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {conversation.profilePhoto ? (
                      <img 
                        src={conversation.profilePhoto} 
                        alt={conversation.userName}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium flex-shrink-0 ${getUserColor(conversation.userName)}`}>
                        {getUserInitials(conversation.userName)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {conversation.userName}
                        </h3>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.lastMessage || 'Start chatting...'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - More space when sidebar is collapsed */}
      <div className={`flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50/30 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : ''
      }`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {selectedUser.profilePhoto ? (
                    <img 
                      src={selectedUser.profilePhoto} 
                      alt={selectedUser.userName}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium shadow-sm ${getUserColor(selectedUser.userName)}`}>
                      {getUserInitials(selectedUser.userName)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedUser.userName}</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 capitalize">{selectedUser.userRole}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container - More space */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Start the conversation by sending the first message.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.senderId === userId;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-3`}
                    >
                      {!isCurrentUser && showAvatar && (
                        message.senderProfilePhoto ? (
                          <img 
                            src={message.senderProfilePhoto} 
                            alt={message.senderName}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 mb-1"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium ${getUserColor(message.senderName)} flex-shrink-0 mb-1`}>
                            {getUserInitials(message.senderName)}
                          </div>
                        )
                      )}
                      
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-8 flex-shrink-0"></div>
                      )}
                      
                      <div className={`max-w-2xl ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                        {!isCurrentUser && showAvatar && (
                          <div className="text-xs font-medium text-gray-600 mb-1 ml-1">
                            {message.senderName}
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md shadow-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`text-xs mt-2 flex items-center space-x-1 ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {message.isRead && isCurrentUser && (
                              <>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span>Read</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        currentUser.profilePhoto ? (
                          <img 
                            src={currentUser.profilePhoto} 
                            alt={currentUser.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 mb-1"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium ${getUserColor(currentUser.name)} flex-shrink-0 mb-1`}>
                            {getUserInitials(currentUser.name)}
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Taller and better */}
            <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex space-x-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-sm"
                    disabled={sending}
                    style={{ minHeight: '100px', maxHeight: '150px' }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center space-x-2 min-h-[52px]"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Select a Conversation</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Choose a conversation from the sidebar to start messaging.
            </p>
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Show Conversations</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}