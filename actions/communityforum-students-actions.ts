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

export async function getStudentCommunityPosts() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({
      isDeleted: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'students' },
        { category: 'announcement' }
      ]
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log('Student posts fetched:', posts.length);
    console.log('Public posts:', posts.filter(post => post.visibility === 'public').length);
    console.log('Student-only posts:', posts.filter(post => post.visibility === 'students').length);
    console.log('Announcements:', posts.filter(post => post.category === 'announcement').length);
    
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
    console.error('Error fetching student community posts:', error);
    throw new Error('Failed to fetch community posts');
  }
}

export async function addCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    console.log('Student creating post with visibility:', data.visibility);
    
    // Remove admin-mentors visibility option for students
    if (data.userRole === 'student' && !['public', 'students'].includes(data.visibility)) {
      return { success: false, error: 'Students can only create public posts or student chats' };
    }

    let userId: Types.ObjectId;
    try {
      userId = toObjectId(data.userId);
    } catch (error) {
      console.warn('Invalid userId, generating new ObjectId');
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

    await post.save();
    
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating student post:', error);
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
    
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
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

    let userIdObj: Types.ObjectId;
    try {
      userIdObj = toObjectId(userId);
    } catch (error) {
      console.warn('Invalid userId in upvote, generating new ObjectId');
      userIdObj = new Types.ObjectId();
    }

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
    
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error) {
    console.error('Error upvoting post:', error);
    return { success: false, error: 'Failed to upvote post' };
  }
}

export async function reportPostAction(postId: string, replyId: string | undefined, reason: string, reportedBy: string, reportedByRole: 'student' | 'mentor' | 'moderator' | 'admin'): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    let reportedById: Types.ObjectId;
    try {
      reportedById = toObjectId(reportedBy);
    } catch (error) {
      console.warn('Invalid reportedBy ID, generating new ObjectId');
      reportedById = new Types.ObjectId();
    }

    // Create report
    const report = new Report({
      postId: toObjectId(postId),
      replyId: replyId ? toObjectId(replyId) : undefined,
      reportedBy: reportedById,
      reportedByRole,
      reason,
      status: 'pending',
      createdAt: new Date()
    });

    await report.save();

    // Increment report count on post
    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      { 
        $inc: { reportCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error reporting post:', error);
    return { success: false, error: 'Failed to report content' };
  }
}