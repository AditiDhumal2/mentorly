'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost, Report } from '@/models/CommunityPost';
import { CreatePostData, CreateReplyData } from '@/types/community';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { 
  canUserManagePost, 
  updatePostAction, 
  deletePostWithPermissionCheck,
  canUserManageReply,
  deleteReplyWithPermissionCheck 
} from './post-management-actions';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      return new Types.ObjectId();
    }
    return new Types.ObjectId(id);
  }
  return id;
};

// USE THE SAME QUERY LOGIC AS MENTORS BUT FOR STUDENT VISIBILITY
export async function getStudentCommunityPosts() {
  try {
    await connectDB();
    
    console.log('🎯 Fetching ALL posts for students...');
    
    const posts = await CommunityPost.find({
      isDeleted: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'students' },
        { category: 'announcement' } // Include ALL announcements
      ]
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log('✅ Student posts fetched:', posts.length);
    
    // Log breakdown for debugging
    const publicPosts = posts.filter(post => post.visibility === 'public');
    const studentPosts = posts.filter(post => post.visibility === 'students');
    const announcements = posts.filter(post => post.category === 'announcement');
    
    console.log('📊 Breakdown:');
    console.log('🌍 Public posts:', publicPosts.length);
    console.log('👥 Student-only posts:', studentPosts.length);
    console.log('📢 ANNOUNCEMENTS:', announcements.length);
    
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
      edited: (post as any).edited || false,
      editedAt: (post as any).editedAt?.toISOString(),
      editCount: (post as any).editCount || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('❌ Error fetching student community posts:', error);
    throw new Error('Failed to fetch community posts');
  }
}

// USE THE SAME CATEGORY QUERY AS MENTORS
export async function getPostsByCategoryForStudents(category: string) {
  try {
    await connectDB();
    
    console.log(`🎯 Fetching posts for category: ${category} for students`);
    
    let query: any = { isDeleted: false };
    
    // Handle special categories - SAME LOGIC AS MENTORS
    if (category === 'mentor-chats') {
      query.visibility = 'mentors';
    } else if (category === 'admin-mentors') {
      query.visibility = 'admin-mentors';
    } else if (category === 'announcements') {
      query.category = 'announcement';
    } else {
      query.category = category;
    }
    
    // Add visibility restrictions based on user role (student)
    query.$or = [
      { visibility: 'public' },
      { visibility: 'students' },
      { category: 'announcement' } // Always include announcements
    ];
    
    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log(`✅ Posts for category ${category}:`, posts.length);
    console.log(`📢 Announcements in ${category}:`, posts.filter(post => post.category === 'announcement').length);
    
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
      edited: (post as any).edited || false,
      editedAt: (post as any).editedAt?.toISOString(),
      editCount: (post as any).editCount || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching posts by category for students:', error);
    throw new Error('Failed to fetch posts by category');
  }
}

export async function addCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    console.log('Student creating post with visibility:', data.visibility);
    
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
      edited: false,
      editCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await post.save();
    
    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating student post:', error);
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

// New Post Management Functions
export async function updateStudentPostAction(
  postId: string,
  updateData: { title?: string; content?: string; category?: string },
  userId: string,
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  return updatePostAction(postId, updateData, userId, userRole);
}

export async function deleteStudentPostAction(
  postId: string, 
  userId: string, 
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  return deletePostWithPermissionCheck(postId, userId, userRole, userId);
}

export async function deleteStudentReplyAction(
  postId: string, 
  replyId: string, 
  userId: string, 
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  return deleteReplyWithPermissionCheck(postId, replyId, userId, userRole, userId);
}

export async function checkStudentPostPermissions(
  postId: string, 
  userId: string, 
  userRole: string
) {
  return canUserManagePost(postId, userId, userRole);
}