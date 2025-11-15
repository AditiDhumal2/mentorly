'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost } from '@/models/CommunityPost';
import { CreatePostData, CreateReplyData } from '@/types/community';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

// Helper function to convert string to ObjectId
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  return id;
};

// Helper function to safely convert dates to ISO strings
const safeToISOString = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export async function deletePostAction(postId: string | Types.ObjectId): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await CommunityPost.findByIdAndDelete(toObjectId(postId));
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function deleteReplyAction(postId: string | Types.ObjectId, replyId: string | Types.ObjectId): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      { $pull: { replies: { _id: toObjectId(replyId) } } }
    );
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error) {
    console.error('Error deleting reply:', error);
    return { success: false, error: 'Failed to delete reply' };
  }
}

export async function getAdminCommunityPosts() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log('Raw posts from database:', posts.length);
    
    // Convert all Mongoose objects to plain objects with safe date handling
    const plainPosts = posts.map(post => {
      // Safely handle all date fields
      const createdAt = safeToISOString(post.createdAt);
      const updatedAt = safeToISOString((post as any).updatedAt || post.createdAt);
      const deletedAt = (post as any).deletedAt ? safeToISOString((post as any).deletedAt) : undefined;

      // Safely handle replies
      const safeReplies = (post.replies || []).map((reply: any) => ({
        _id: reply._id?.toString() || new Types.ObjectId().toString(),
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || '',
        createdAt: safeToISOString(reply.createdAt),
        isDeleted: reply.isDeleted || false,
        deletedBy: reply.deletedBy?.toString(),
        deletedAt: reply.deletedAt ? safeToISOString(reply.deletedAt) : undefined
      }));

      return {
        _id: post._id.toString(),
        userId: post.userId.toString(),
        userName: post.userName || 'Unknown User',
        userRole: post.userRole || 'student',
        title: post.title || 'No Title',
        content: post.content || 'No Content',
        category: post.category || 'general',
        visibility: (post as any).visibility || 'public',
        replies: safeReplies,
        upvotes: (post.upvotes || []).map((upvote: any) => upvote.toString()),
        isDeleted: (post as any).isDeleted || false,
        reportCount: (post as any).reportCount || 0,
        deletedBy: (post as any).deletedBy?.toString(),
        deletedAt: deletedAt,
        createdAt: createdAt,
        updatedAt: updatedAt
      };
    });
    
    console.log('Processed posts:', plainPosts.length);
    return plainPosts;
  } catch (error) {
    console.error('Error fetching community posts for admin:', error);
    throw new Error('Failed to fetch community posts');
  }
}

export async function getAdminMentorChats() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({
      isDeleted: false,
      visibility: 'admin-mentors'
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    // Use the same safe transformation as getAdminCommunityPosts
    const plainPosts = posts.map(post => {
      const createdAt = safeToISOString(post.createdAt);
      const updatedAt = safeToISOString((post as any).updatedAt || post.createdAt);
      const deletedAt = (post as any).deletedAt ? safeToISOString((post as any).deletedAt) : undefined;

      const safeReplies = (post.replies || []).map((reply: any) => ({
        _id: reply._id?.toString() || new Types.ObjectId().toString(),
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || '',
        createdAt: safeToISOString(reply.createdAt),
        isDeleted: reply.isDeleted || false,
        deletedBy: reply.deletedBy?.toString(),
        deletedAt: reply.deletedAt ? safeToISOString(reply.deletedAt) : undefined
      }));

      return {
        _id: post._id.toString(),
        userId: post.userId.toString(),
        userName: post.userName || 'Unknown User',
        userRole: post.userRole || 'student',
        title: post.title || 'No Title',
        content: post.content || 'No Content',
        category: post.category || 'general',
        visibility: (post as any).visibility || 'public',
        replies: safeReplies,
        upvotes: (post.upvotes || []).map((upvote: any) => upvote.toString()),
        isDeleted: (post as any).isDeleted || false,
        reportCount: (post as any).reportCount || 0,
        deletedBy: (post as any).deletedBy?.toString(),
        deletedAt: deletedAt,
        createdAt: createdAt,
        updatedAt: updatedAt
      };
    });
    
    return plainPosts;
  } catch (error) {
    console.error('Error fetching admin-mentor chats:', error);
    throw new Error('Failed to fetch admin-mentor chats');
  }
}

export async function addAdminCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    console.log('Admin creating post with visibility:', data.visibility);
    
    // Admin can only create admin-mentors posts
    if (data.visibility !== 'admin-mentors') {
      return { success: false, error: 'Admins can only create admin-mentor posts' };
    }

    let userId: Types.ObjectId;
    try {
      userId = toObjectId(data.userId);
    } catch (error) {
      console.warn('Invalid userId, generating new ObjectId for demo');
      userId = new Types.ObjectId();
    }

    const post = new CommunityPost({
      userId: userId,
      userName: data.userName,
      userRole: data.userRole,
      title: data.title,
      content: data.content,
      category: data.category,
      visibility: data.visibility,
      replies: [],
      upvotes: [],
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Saving admin post with data:', {
      title: post.title,
      category: post.category,
      visibility: post.visibility,
      userRole: post.userRole
    });

    await post.save();
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating admin post:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    return { success: false, error: `Failed to create post: ${error.message}` };
  }
}

export async function replyToPostAction(postId: string | Types.ObjectId, replyData: Omit<CreateReplyData, 'postId'>): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    let userId: Types.ObjectId;
    try {
      userId = toObjectId(replyData.userId);
    } catch (error) {
      console.warn('Invalid userId in reply, generating new ObjectId');
      userId = new Types.ObjectId();
    }

    const reply = {
      _id: new Types.ObjectId(),
      userId: userId,
      userName: replyData.userName,
      userRole: replyData.userRole,
      message: replyData.message,
      createdAt: new Date(),
      isDeleted: false
    };

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      { 
        $push: { replies: reply },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error) {
    console.error('Error adding reply:', error);
    return { success: false, error: 'Failed to add reply' };
  }
}