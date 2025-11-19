'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost, Report } from '@/models/CommunityPost';
import { CreatePostData, CreateReplyData } from '@/types/community';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      return new Types.ObjectId();
    }
    return new Types.ObjectId(id);
  }
  return id;
};

export async function deletePostAction(postId: string | Types.ObjectId, deletedBy?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    // For admin, we bypass permission checks but still validate post exists
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const updateData: any = {
      isDeleted: true,
      deletedAt: new Date()
    };
    
    if (deletedBy) {
      updateData.deletedBy = toObjectId(deletedBy);
    }
    
    await CommunityPost.findByIdAndUpdate(toObjectId(postId), updateData);
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    revalidatePath('/moderator/community');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function deleteReplyAction(postId: string | Types.ObjectId, replyId: string | Types.ObjectId, deletedBy?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    // For admin, we bypass permission checks but still validate reply exists
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Use the correct way to find a reply in the array
    const reply = post.replies.find((r: any) => r._id.toString() === replyId.toString());
    if (!reply) {
      return { success: false, error: 'Reply not found' };
    }

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      {
        $set: {
          'replies.$[reply].isDeleted': true,
          'replies.$[reply].deletedAt': new Date(),
          ...(deletedBy && { 'replies.$[reply].deletedBy': toObjectId(deletedBy) })
        }
      },
      {
        arrayFilters: [
          { 'reply._id': toObjectId(replyId) }
        ],
        new: true
      }
    );
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    revalidatePath('/moderator/community');
    return { success: true };
  } catch (error) {
    console.error('Error deleting reply:', error);
    return { success: false, error: 'Failed to delete reply' };
  }
}

// Keep existing functions...
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
      const createdAt = post.createdAt instanceof Date 
        ? post.createdAt.toISOString() 
        : typeof post.createdAt === 'string' 
          ? post.createdAt 
          : new Date().toISOString();

      const updatedAt = (post as any).updatedAt instanceof Date 
        ? (post as any).updatedAt.toISOString() 
        : typeof (post as any).updatedAt === 'string' 
          ? (post as any).updatedAt 
          : createdAt;

      const deletedAt = (post as any).deletedAt instanceof Date 
        ? (post as any).deletedAt.toISOString() 
        : typeof (post as any).deletedAt === 'string' 
          ? (post as any).deletedAt 
          : undefined;

      const editedAt = (post as any).editedAt instanceof Date 
        ? (post as any).editedAt.toISOString() 
        : typeof (post as any).editedAt === 'string' 
          ? (post as any).editedAt 
          : undefined;

      // Safely handle replies
      const safeReplies = (post.replies || []).map((reply: any) => ({
        _id: reply._id?.toString() || new Types.ObjectId().toString(),
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || '',
        createdAt: reply.createdAt instanceof Date 
          ? reply.createdAt.toISOString() 
          : typeof reply.createdAt === 'string' 
            ? reply.createdAt 
            : new Date().toISOString(),
        isDeleted: reply.isDeleted || false,
        deletedBy: reply.deletedBy?.toString(),
        deletedAt: reply.deletedAt instanceof Date 
          ? reply.deletedAt.toISOString() 
          : typeof reply.deletedAt === 'string' 
            ? reply.deletedAt 
            : undefined
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
        edited: (post as any).edited || false,
        editedAt: editedAt,
        editCount: (post as any).editCount || 0,
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
      const createdAt = post.createdAt instanceof Date 
        ? post.createdAt.toISOString() 
        : typeof post.createdAt === 'string' 
          ? post.createdAt 
          : new Date().toISOString();

      const updatedAt = (post as any).updatedAt instanceof Date 
        ? (post as any).updatedAt.toISOString() 
        : typeof (post as any).updatedAt === 'string' 
          ? (post as any).updatedAt 
          : createdAt;

      const deletedAt = (post as any).deletedAt instanceof Date 
        ? (post as any).deletedAt.toISOString() 
        : typeof (post as any).deletedAt === 'string' 
          ? (post as any).deletedAt 
          : undefined;

      const editedAt = (post as any).editedAt instanceof Date 
        ? (post as any).editedAt.toISOString() 
        : typeof (post as any).editedAt === 'string' 
          ? (post as any).editedAt 
          : undefined;

      const safeReplies = (post.replies || []).map((reply: any) => ({
        _id: reply._id?.toString() || new Types.ObjectId().toString(),
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || '',
        createdAt: reply.createdAt instanceof Date 
          ? reply.createdAt.toISOString() 
          : typeof reply.createdAt === 'string' 
            ? reply.createdAt 
            : new Date().toISOString(),
        isDeleted: reply.isDeleted || false,
        deletedBy: reply.deletedBy?.toString(),
        deletedAt: reply.deletedAt instanceof Date 
          ? reply.deletedAt.toISOString() 
          : typeof reply.deletedAt === 'string' 
            ? reply.deletedAt 
            : undefined
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
        edited: (post as any).edited || false,
        editedAt: editedAt,
        editCount: (post as any).editCount || 0,
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
      edited: false,
      editCount: 0,
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
    revalidatePath('/moderator/community');
    return { success: true };
  } catch (error) {
    console.error('Error adding reply:', error);
    return { success: false, error: 'Failed to add reply' };
  }
}