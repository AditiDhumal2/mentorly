// actions/communityforum-students-actions.ts
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

export async function getCommunityPosts() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    // Convert all Mongoose objects to plain objects with proper userRole
    const plainPosts = posts.map(post => ({
      _id: post._id.toString(),
      userId: post.userId.toString(),
      userName: post.userName,
      userRole: post.userRole || 'student', // Default to student for backward compatibility
      title: post.title,
      content: post.content,
      category: post.category,
      replies: post.replies.map((reply: any) => ({
        _id: reply._id.toString(),
        userId: reply.userId.toString(),
        userName: reply.userName,
        userRole: reply.userRole || 'student', // Default to student for backward compatibility
        message: reply.message,
        createdAt: reply.createdAt.toISOString()
      })),
      upvotes: post.upvotes.map((upvote: any) => upvote.toString()),
      createdAt: post.createdAt.toISOString(),
      __v: post.__v
    }));
    
    return plainPosts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw new Error('Failed to fetch community posts');
  }
}

export async function addCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    const post = new CommunityPost({
      userId: toObjectId(data.userId),
      userName: data.userName,
      userRole: data.userRole, // Include userRole
      title: data.title,
      content: data.content,
      category: data.category,
      replies: [],
      upvotes: [],
      createdAt: new Date(),
    });

    await post.save();
    
    revalidatePath('/students/communityforum');
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
      userRole: replyData.userRole, // Include userRole
      message: replyData.message,
      createdAt: new Date(),
    };

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      { $push: { replies: reply } },
      { new: true }
    );
    
    revalidatePath('/students/communityforum');
    return { success: true };
  } catch (error) {
    console.error('Error adding reply:', error);
    return { success: false, error: 'Failed to add reply' };
  }
}

export async function upvotePostAction(postId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    // Check if user already upvoted
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const userIdObj = toObjectId(userId);
    const hasUpvoted = post.upvotes.some(upvoteId => 
      upvoteId.toString() === userIdObj.toString()
    );

    if (hasUpvoted) {
      // Remove upvote
      await CommunityPost.findByIdAndUpdate(
        toObjectId(postId),
        { $pull: { upvotes: userIdObj } }
      );
    } else {
      // Add upvote
      await CommunityPost.findByIdAndUpdate(
        toObjectId(postId),
        { $addToSet: { upvotes: userIdObj } }
      );
    }
    
    revalidatePath('/students/communityforum');
    return { success: true };
  } catch (error) {
    console.error('Error upvoting post:', error);
    return { success: false, error: 'Failed to upvote post' };
  }
}