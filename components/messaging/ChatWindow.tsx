// components/messaging/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, SendMessageData } from '@/types/messaging';
import { getMessagesAction, sendMessageAction } from '@/actions/messaging-actions';

interface ChatWindowProps {
  currentUser: any;
  otherUser: { id: string; name: string; role: string };
  onMessageSent?: () => void;
  showSnackbar: (message: string, severity?: 'success' | 'error') => void;
}

export default function ChatWindow({ currentUser, otherUser, onMessageSent, showSnackbar }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [otherUser.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await getMessagesAction(currentUser.id || currentUser._id, otherUser.id);
      if (result.success && result.messages) {
        setMessages(result.messages as Message[]);
      } else {
        showSnackbar(result.error || 'Failed to load messages', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading messages', 'error');
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageData: SendMessageData = {
      receiverId: otherUser.id,
      receiverName: otherUser.name,
      receiverRole: otherUser.role as 'student' | 'mentor' | 'admin',
      content: newMessage.trim()
    };

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: currentUser.id || currentUser._id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: otherUser.id,
      receiverName: otherUser.name,
      receiverRole: otherUser.role as 'student' | 'mentor' | 'admin',
      content: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const result = await sendMessageAction(
        currentUser.id || currentUser._id,
        currentUser.name,
        currentUser.role,
        messageData
      );

      if (result.success) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id 
              ? { ...msg, _id: result.messageId! }
              : msg
          )
        );
        onMessageSent?.();
        showSnackbar('Message sent successfully!');
      } else {
        // Remove temp message if failed
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        showSnackbar(result.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      // Remove temp message if error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      showSnackbar('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800 border border-blue-200',
      mentor: 'bg-green-100 text-green-800 border border-green-200',
      admin: 'bg-purple-100 text-purple-800 border border-purple-200'
    };

    const labels = {
      student: 'Student',
      mentor: 'Mentor',
      admin: 'Admin'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(otherUser.role)}
                <span className="text-xs text-gray-500">{otherUser.role === 'student' ? '👨‍🎓' : '👨‍🏫'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={loadMessages}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId === (currentUser.id || currentUser._id) ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.senderId === (currentUser.id || currentUser._id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`flex justify-between items-center mt-1 ${
                    message.senderId === (currentUser.id || currentUser._id)
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}>
                    <span className="text-xs">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {message.senderId === (currentUser.id || currentUser._id) && (
                      <span className="text-xs">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
                {message._id.startsWith('temp-') && (
                  <div className="text-xs text-gray-500 text-right mt-1">Sending...</div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            maxLength={2000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {newMessage.length}/2000 characters
          </p>
          <p className="text-xs text-gray-500">
            Press Enter to send
          </p>
        </div>
      </form>
    </div>
  );
}