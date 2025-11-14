'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost } from '@/models/CommunityPost';
import { CreatePostData, CreateReplyData } from '@/types/community';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  return id;
};

export async function getMentorCommunityPosts() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({
      isDeleted: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'students' },
        { visibility: 'mentors' }
      ]
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    return posts.map(post => ({
      _id: post._id.toString(),
      userId: post.userId.toString(),
      userName: post.userName,
      userRole: post.userRole,
      title: post.title,
      content: post.content,
      category: post.category,
      visibility: post.visibility,
      replies: post.replies
        .filter((reply: any) => !reply.isDeleted)
        .map((reply: any) => ({
          _id: reply._id.toString(),
          userId: reply.userId.toString(),
          userName: reply.userName,
          userRole: reply.userRole,
          message: reply.message,
          createdAt: reply.createdAt.toISOString(),
          isDeleted: reply.isDeleted
        })),
      upvotes: post.upvotes.map((upvote: any) => upvote.toString()),
      isDeleted: post.isDeleted,
      reportCount: post.reportCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching mentor community posts:', error);
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
    
    return posts.map(post => ({
      _id: post._id.toString(),
      userId: post.userId.toString(),
      userName: post.userName,
      userRole: post.userRole,
      title: post.title,
      content: post.content,
      category: post.category,
      visibility: post.visibility,
      replies: post.replies
        .filter((reply: any) => !reply.isDeleted)
        .map((reply: any) => ({
          _id: reply._id.toString(),
          userId: reply.userId.toString(),
          userName: reply.userName,
          userRole: reply.userRole,
          message: reply.message,
          createdAt: reply.createdAt.toISOString(),
          isDeleted: reply.isDeleted
        })),
      upvotes: post.upvotes.map((upvote: any) => upvote.toString()),
      isDeleted: post.isDeleted,
      reportCount: post.reportCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching admin-mentor chats:', error);
    throw new Error('Failed to fetch admin-mentor chats');
  }
}

export async function addCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    // Validate mentor can create all types of posts except admin-only
    if (data.userRole === 'mentor' && data.visibility === 'admin-mentors') {
      return { success: false, error: 'Mentors cannot create admin-only posts' };
    }

    const post = new CommunityPost({
      userId: toObjectId(data.userId),
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

    await post.save();
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    return { success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function replyToPostAction(postId: string | Types.ObjectId, replyData: Omit<CreateReplyData, 'postId'>): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    const reply = {
      _id: new Types.ObjectId(),
      userId: toObjectId(replyData.userId),
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
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    return { success: true };
  } catch (error) {
    console.error('Error adding reply:', error);
    return { success: false, error: 'Failed to add reply' };
  }
}

export async function upvotePostAction(postId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const userIdObj = toObjectId(userId);
    const hasUpvoted = post.upvotes.some(upvoteId => 
      upvoteId.toString() === userIdObj.toString()
    );

    if (hasUpvoted) {
      await CommunityPost.findByIdAndUpdate(
        toObjectId(postId),
        { 
          $pull: { upvotes: userIdObj },
          $set: { updatedAt: new Date() }
        }
      );
    } else {
      await CommunityPost.findByIdAndUpdate(
        toObjectId(postId),
        { 
          $addToSet: { upvotes: userIdObj },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    return { success: true };
  } catch (error) {
    console.error('Error upvoting post:', error);
    return { success: false, error: 'Failed to upvote post' };
  }
}

export async function getPostById(postId: string) {
  try {
    await connectDB();
    const post = await CommunityPost.findById(postId).lean();
    
    if (!post) return null;
    
    const postObj = post as any;
    
    return {
      _id: postObj._id.toString(),
      title: postObj.title,
      content: postObj.content,
      category: postObj.category,
      visibility: postObj.visibility,
      userId: postObj.userId.toString(),
      userName: postObj.userName,
      userRole: postObj.userRole,
      replies: postObj.replies
        .filter((reply: any) => !reply.isDeleted)
        .map((reply: any) => ({
          _id: reply._id?.toString() || new Types.ObjectId().toString(),
          userId: reply.userId?.toString(),
          userName: reply.userName,
          userRole: reply.userRole,
          message: reply.message,
          createdAt: reply.createdAt?.toISOString() || new Date().toISOString(),
          isDeleted: reply.isDeleted
        })),
      upvotes: (postObj.upvotes || []).map((id: any) => id.toString()),
      isDeleted: postObj.isDeleted,
      reportCount: postObj.reportCount,
      createdAt: postObj.createdAt?.toISOString(),
      updatedAt: postObj.updatedAt?.toISOString() || postObj.createdAt?.toISOString()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}