'use server';

import { connectDB } from '@/lib/db';
import { Message } from '@/models/PersonalMessage';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { Types } from 'mongoose';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return new Types.ObjectId(id);
  }
  return id;
};

export interface SendMessageData {
  senderId: string;
  senderRole: 'student' | 'mentor';
  senderName: string;
  receiverId: string;
  receiverRole: 'student' | 'mentor';
  receiverName: string;
  message: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export async function sendMessage(data: SendMessageData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const message = new Message({
      senderId: toObjectId(data.senderId),
      senderRole: data.senderRole,
      senderName: data.senderName,
      receiverId: toObjectId(data.receiverId),
      receiverRole: data.receiverRole,
      receiverName: data.receiverName,
      message: data.message
    });

    await message.save();
    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getConversations(userId: string, userRole: 'student' | 'mentor'): Promise<Conversation[]> {
  try {
    await connectDB();

    // Get all unique conversations for the user
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
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          participants: { $first: {
            senderId: '$senderId',
            senderRole: '$senderRole',
            senderName: '$senderName',
            receiverId: '$receiverId',
            receiverRole: '$receiverRole',
            receiverName: '$receiverName'
          }}
        }
      },
      {
        $project: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$participants.senderId', toObjectId(userId)] },
              then: '$participants.receiverId',
              else: '$participants.senderId'
            }
          },
          otherUserRole: {
            $cond: {
              if: { $eq: ['$participants.senderId', toObjectId(userId)] },
              then: '$participants.receiverRole',
              else: '$participants.senderRole'
            }
          },
          otherUserName: {
            $cond: {
              if: { $eq: ['$participants.senderId', toObjectId(userId)] },
              then: '$participants.receiverName',
              else: '$participants.senderName'
            }
          },
          lastMessage: 1,
          lastMessageTime: 1
        }
      }
    ]);

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: toObjectId(userId),
          isRead: false
        });

        return {
          userId: conv.otherUserId.toString(),
          userName: conv.otherUserName,
          userRole: conv.otherUserRole,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount
        };
      })
    );

    return conversationsWithUnread.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

export async function getMessages(conversationId: string, currentUserId: string): Promise<any[]> {
  try {
    await connectDB();

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: toObjectId(currentUserId),
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return messages.map((msg: any) => ({
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      senderRole: msg.senderRole,
      senderName: msg.senderName,
      receiverId: msg.receiverId.toString(),
      receiverRole: msg.receiverRole,
      receiverName: msg.receiverName,
      message: msg.message,
      isRead: msg.isRead,
      readAt: msg.readAt,
      createdAt: msg.createdAt.toISOString(),
      isOwnMessage: msg.senderId.toString() === currentUserId
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function getUsersForMessaging(currentUserId: string, currentUserRole: 'student' | 'mentor', searchTerm?: string): Promise<any[]> {
  try {
    await connectDB();

    let users = [];

    if (currentUserRole === 'student') {
      // Students can message mentors and other students
      const [mentors, students] = await Promise.all([
        Mentor.find(
          searchTerm 
            ? { name: { $regex: searchTerm, $options: 'i' }, approvalStatus: 'approved' }
            : { approvalStatus: 'approved' }
        )
          .select('_id name role')
          .lean(),
        Student.find(
          searchTerm 
            ? { name: { $regex: searchTerm, $options: 'i' }, _id: { $ne: toObjectId(currentUserId) } }
            : { _id: { $ne: toObjectId(currentUserId) } }
        )
          .select('_id name role')
          .lean()
      ]);

      users = [...mentors, ...students];
    } else {
      // Mentors can message students and other mentors
      const [students, mentors] = await Promise.all([
        Student.find(
          searchTerm 
            ? { name: { $regex: searchTerm, $options: 'i' } }
            : {}
        )
          .select('_id name role')
          .lean(),
        Mentor.find(
          searchTerm 
            ? { name: { $regex: searchTerm, $options: 'i' }, _id: { $ne: toObjectId(currentUserId) }, approvalStatus: 'approved' }
            : { _id: { $ne: toObjectId(currentUserId) }, approvalStatus: 'approved' }
        )
          .select('_id name role')
          .lean()
      ]);

      users = [...students, ...mentors];
    }

    return users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      role: user.role
    }));
  } catch (error) {
    console.error('Error getting users for messaging:', error);
    return [];
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    await connectDB();
    return await Message.countDocuments({
      receiverId: toObjectId(userId),
      isRead: false
    });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}