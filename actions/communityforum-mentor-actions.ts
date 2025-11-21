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

// 🆕 NEW: Route validation for mentor actions
async function validateMentorRouteAccess(userId: string, userRole: string): Promise<{ valid: boolean; error?: string }> {
  // 🆕 CRITICAL: Ensure this is actually a mentor accessing mentor routes
  if (userRole !== 'mentor') {
    console.error('🚨 CRITICAL SECURITY VIOLATION: Non-mentor accessing mentor route:', {
      userId,
      userRole
    });
    return { valid: false, error: 'Access denied: Mentor routes require mentor authentication' };
  }
  
  return { valid: true };
}

export async function getMentorCommunityPosts() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({
      isDeleted: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'mentors' },
        { visibility: 'admin-mentors' },
        { category: 'announcement' }
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
      edited: (post as any).edited || false,
      editedAt: (post as any).editedAt?.toISOString(),
      editCount: (post as any).editCount || 0,
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
      edited: (post as any).edited || false,
      editedAt: (post as any).editedAt?.toISOString(),
      editCount: (post as any).editCount || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching admin-mentor chats:', error);
    throw new Error('Failed to fetch admin-mentor chats');
  }
}

export async function getAnnouncements() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({
      isDeleted: false,
      category: 'announcement'
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
      edited: (post as any).edited || false,
      editedAt: (post as any).editedAt?.toISOString(),
      editCount: (post as any).editCount || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw new Error('Failed to fetch announcements');
  }
}

export async function addCommunityPostAction(data: CreatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    console.log('Creating post with visibility:', data.visibility);
    
    // Validate mentor can create specific types of posts
    if (data.userRole === 'mentor') {
      // Mentors cannot create admin-mentor posts (only admins can)
      if (data.visibility === 'admin-mentors') {
        return { success: false, error: 'Mentors cannot create admin-only posts' };
      }
      // Mentors can create announcements, student posts, and mentor-only posts
      const allowedVisibilities = ['public', 'students', 'mentors'];
      if (!allowedVisibilities.includes(data.visibility)) {
        return { success: false, error: 'Mentors can only create public posts, student posts, and mentor-only posts' };
      }
    }

    // Validate student can only create public or student-only posts
    if (data.userRole === 'student' && !['public', 'students'].includes(data.visibility)) {
      return { success: false, error: 'Students can only create public or student-only posts' };
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

    console.log('Saving post with data:', {
      title: post.title,
      category: post.category,
      visibility: post.visibility,
      userRole: post.userRole
    });

    await post.save();
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    revalidatePath('/mentors/community/announcements');
    revalidatePath('/students/communityforum');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating post:', error);
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
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    revalidatePath('/mentors/community/announcements');
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
    
    revalidatePath('/mentors/community');
    revalidatePath('/mentors/community/admin-chats');
    revalidatePath('/mentors/community/announcements');
    revalidatePath('/students/communityforum');
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
      edited: postObj.edited || false,
      editedAt: postObj.editedAt?.toISOString(),
      editCount: postObj.editCount || 0,
      createdAt: postObj.createdAt?.toISOString(),
      updatedAt: postObj.updatedAt?.toISOString() || postObj.createdAt?.toISOString()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
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

// 🆕 ENHANCED: Post management with STRICT OWNERSHIP
export async function updateMentorPostAction(
  postId: string,
  updateData: { title?: string; content?: string; category?: string },
  userId: string,
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🆕 SECURITY: Route validation before proceeding
    const routeCheck = await validateMentorRouteAccess(userId, userRole);
    if (!routeCheck.valid) {
      return { success: false, error: routeCheck.error };
    }

    // Additional validation before proceeding
    await connectDB();
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // 🆕 CRITICAL: ONLY OWNER can edit - remove admin exception
    const isOwner = post.userId.toString() === userId.toString();
    if (!isOwner) {
      console.error('🚨 SECURITY VIOLATION: Unauthorized edit attempt by user:', {
        userId, userRole, postOwner: post.userId.toString()
      });
      return { success: false, error: 'You can only edit your own posts' };
    }

    // 🆕 Pass route type to the action
    return updatePostAction(postId, updateData, userId, userRole, 'mentor');
  } catch (error) {
    console.error('Error in secure post update:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

export async function deleteMentorPostAction(
  postId: string, 
  userId: string, 
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🆕 SECURITY: Route validation before proceeding
    const routeCheck = await validateMentorRouteAccess(userId, userRole);
    if (!routeCheck.valid) {
      return { success: false, error: routeCheck.error };
    }

    // Additional validation before proceeding
    await connectDB();
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // 🆕 CRITICAL: ONLY OWNER can delete - remove admin exception
    const isOwner = post.userId.toString() === userId.toString();
    
    if (!isOwner) {
      console.error('🚨 SECURITY VIOLATION: Unauthorized delete attempt by user:', {
        userId, userRole, postOwner: post.userId.toString()
      });
      return { success: false, error: 'You can only delete your own posts' };
    }

    // 🆕 Pass route type to the action
    return deletePostWithPermissionCheck(postId, userId, userRole, userId, 'mentor');
  } catch (error) {
    console.error('Error in secure post deletion:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function deleteMentorReplyAction(
  postId: string, 
  replyId: string, 
  userId: string, 
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🆕 SECURITY: Route validation before proceeding
    const routeCheck = await validateMentorRouteAccess(userId, userRole);
    if (!routeCheck.valid) {
      return { success: false, error: routeCheck.error };
    }

    // Additional validation before proceeding
    await connectDB();
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const reply = post.replies.find((r: any) => r._id.toString() === replyId);
    if (!reply) {
      return { success: false, error: 'Reply not found' };
    }

    // 🆕 CRITICAL: ONLY OWNER can delete - remove admin exception
    const isOwner = reply.userId.toString() === userId.toString();
    
    if (!isOwner) {
      console.error('🚨 SECURITY VIOLATION: Unauthorized reply delete attempt by user:', {
        userId, userRole, replyOwner: reply.userId.toString()
      });
      return { success: false, error: 'You can only delete your own replies' };
    }

    // 🆕 Pass route type to the action
    return deleteReplyWithPermissionCheck(postId, replyId, userId, userRole, userId, 'mentor');
  } catch (error) {
    console.error('Error in secure reply deletion:', error);
    return { success: false, error: 'Failed to delete reply' };
  }
}

export async function checkMentorPostPermissions(
  postId: string, 
  userId: string, 
  userRole: string
) {
  // 🆕 Pass route type to the permission check
  return canUserManagePost(postId, userId, userRole, 'mentor');
}

// Add alias for compatibility
export const getCommunityPosts = getMentorCommunityPosts;