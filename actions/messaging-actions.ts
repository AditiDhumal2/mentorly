// actions/messaging-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Message } from '@/models/Message';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import { SendMessageData, UserSearchResult, Conversation } from '@/types/messaging';

const toObjectId = (id: string): Types.ObjectId => {
  return new Types.ObjectId(id);
};

// Send a new message
export async function sendMessageAction(
  senderId: string,
  senderName: string,
  senderRole: 'student' | 'mentor' | 'admin',
  messageData: SendMessageData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    await connectDB();

    // Validate receiver exists
    let receiver;
    if (messageData.receiverRole === 'student') {
      receiver = await Student.findById(messageData.receiverId).select('name email').lean();
    } else if (messageData.receiverRole === 'mentor') {
      receiver = await Mentor.findById(messageData.receiverId).select('name email').lean();
    }

    if (!receiver) {
      return { success: false, error: 'Recipient not found' };
    }

    // Create message
    const message = new Message({
      senderId: toObjectId(senderId),
      senderName,
      senderRole,
      receiverId: toObjectId(messageData.receiverId),
      receiverName: messageData.receiverName,
      receiverRole: messageData.receiverRole,
      content: messageData.content.trim(),
      isRead: false
    });

    await message.save();

    // Revalidate relevant paths
    revalidatePath('/messages');
    revalidatePath(`/messages/${messageData.receiverId}`);

    // FIX: Properly type the _id access
    return { 
      success: true, 
      messageId: (message._id as Types.ObjectId).toString() 
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

// Get conversations list for a user
export async function getConversationsAction(
  userId: string,
  userRole: 'student' | 'mentor' | 'admin'
): Promise<{ success: boolean; conversations?: Conversation[]; error?: string }> {
  try {
    await connectDB();

    // Get unique conversations (people you've messaged or been messaged by)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: toObjectId(userId) },
            { receiverId: toObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', toObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          otherUserName: {
            $first: {
              $cond: [
                { $eq: ['$senderId', toObjectId(userId)] },
                '$receiverName',
                '$senderName'
              ]
            }
          },
          otherUserRole: {
            $first: {
              $cond: [
                { $eq: ['$senderId', toObjectId(userId)] },
                '$receiverRole',
                '$senderRole'
              ]
            }
          },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', toObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    // Convert aggregation result to Conversation type
    const formattedConversations: Conversation[] = conversations.map((conv: any) => ({
      userId: (conv._id as Types.ObjectId).toString(),
      userName: conv.otherUserName,
      userRole: conv.otherUserRole,
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime?.toISOString(),
      unreadCount: conv.unreadCount
    }));

    return { success: true, conversations: formattedConversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Failed to fetch conversations' };
  }
}

// Get messages between two users
export async function getMessagesAction(
  currentUserId: string,
  otherUserId: string
): Promise<{ success: boolean; messages?: any[]; error?: string }> {
  try {
    await connectDB();

    const messages = await Message.find({
      $or: [
        { senderId: toObjectId(currentUserId), receiverId: toObjectId(otherUserId) },
        { senderId: toObjectId(otherUserId), receiverId: toObjectId(currentUserId) }
      ]
    })
    .sort({ createdAt: 1 })
    .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        receiverId: toObjectId(currentUserId),
        senderId: toObjectId(otherUserId),
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Properly type the message document
    const formattedMessages = messages.map((msg: any) => ({
      _id: (msg._id as Types.ObjectId).toString(),
      senderId: (msg.senderId as Types.ObjectId).toString(),
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      receiverId: (msg.receiverId as Types.ObjectId).toString(),
      receiverName: msg.receiverName,
      receiverRole: msg.receiverRole,
      content: msg.content,
      isRead: msg.isRead,
      readAt: msg.readAt?.toISOString(),
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString()
    }));

    return { success: true, messages: formattedMessages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error: 'Failed to fetch messages' };
  }
}

// Search users for messaging
export async function searchUsersAction(
  query: string,
  currentUserId: string
): Promise<{ success: boolean; users?: UserSearchResult[]; error?: string }> {
  try {
    await connectDB();

    if (!query || query.length < 2) {
      return { success: true, users: [] };
    }

    const searchRegex = new RegExp(query, 'i');

    // Search in both students and mentors
    const [students, mentors] = await Promise.all([
      Student.find({
        _id: { $ne: toObjectId(currentUserId) },
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('name email role').limit(10).lean(),
      
      Mentor.find({
        _id: { $ne: toObjectId(currentUserId) },
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('name email role').limit(10).lean()
    ]);

    const users: UserSearchResult[] = [
      ...students.map((s: any) => ({
        _id: (s._id as Types.ObjectId).toString(),
        name: s.name,
        email: s.email,
        role: 'student' as const
      })),
      ...mentors.map((m: any) => ({
        _id: (m._id as Types.ObjectId).toString(),
        name: m.name,
        email: m.email,
        role: 'mentor' as const
      }))
    ];

    return { success: true, users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: 'Failed to search users' };
  }
}

// Get unread message count
export async function getUnreadCountAction(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await connectDB();

    const count = await Message.countDocuments({
      receiverId: toObjectId(userId),
      isRead: false
    });

    return { success: true, count };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: 'Failed to fetch unread count' };
  }
}

// Delete a message (only for sender)
export async function deleteMessageAction(
  messageId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Use lean to avoid Mongoose document typing issues
    const message = await Message.findOne({
      _id: toObjectId(messageId),
      senderId: toObjectId(userId)
    }).select('receiverId').lean();

    if (!message) {
      return { success: false, error: 'Message not found or unauthorized' };
    }

    await Message.deleteOne({ _id: toObjectId(messageId) });

    // Revalidate paths
    revalidatePath('/messages');
    revalidatePath(`/messages/${(message.receiverId as Types.ObjectId).toString()}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}