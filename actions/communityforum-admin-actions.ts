'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost } from '@/models/CommunityPost';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

// Helper function to convert string to ObjectId
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  return id;
};

export async function deletePostAction(postId: string | Types.ObjectId): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await CommunityPost.findByIdAndDelete(toObjectId(postId));
    
    revalidatePath('/admin/communityforum');
    revalidatePath('/students/communityforum');
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
      .lean() // Use lean() to get plain objects
      .exec();
    
    // Convert all Mongoose objects to plain objects
    const plainPosts = posts.map(post => ({
      _id: post._id.toString(),
      userId: post.userId.toString(),
      userName: post.userName,
      title: post.title,
      content: post.content,
      category: post.category,
      replies: post.replies.map((reply: any) => ({
        _id: reply._id.toString(),
        userId: reply.userId.toString(),
        userName: reply.userName,
        message: reply.message,
        createdAt: reply.createdAt.toISOString()
      })),
      upvotes: post.upvotes.map((upvote: any) => upvote.toString()),
      createdAt: post.createdAt.toISOString(),
      __v: post.__v // Changed from _v to __v
    }));
    
    return plainPosts;
  } catch (error) {
    console.error('Error fetching community posts for admin:', error);
    throw new Error('Failed to fetch community posts');
  }
}