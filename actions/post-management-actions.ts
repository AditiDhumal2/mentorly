'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost } from '@/models/CommunityPost';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { PostPermissions, CommunityPost as CommunityPostType } from '@/types/community';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
    return new Types.ObjectId(id);
  }
  return id;
};

/**
 * Convert Mongoose document to plain CommunityPost type
 */
function convertToCommunityPost(post: any): CommunityPostType {
  return {
    _id: post._id.toString(),
    userId: post.userId.toString(),
    userName: post.userName,
    userRole: post.userRole,
    title: post.title,
    content: post.content,
    category: post.category,
    visibility: post.visibility,
    replies: post.replies.map((reply: any) => ({
      _id: reply._id.toString(),
      userId: reply.userId.toString(),
      userName: reply.userName,
      userRole: reply.userRole,
      message: reply.message,
      createdAt: reply.createdAt.toISOString(),
      isDeleted: reply.isDeleted,
      deletedBy: reply.deletedBy?.toString(),
      deletedAt: reply.deletedAt?.toISOString()
    })),
    upvotes: post.upvotes.map((upvote: any) => upvote.toString()),
    isDeleted: post.isDeleted,
    deletedBy: post.deletedBy?.toString(),
    deletedAt: post.deletedAt?.toISOString(),
    reportCount: post.reportCount,
    edited: post.edited || false,
    editedAt: post.editedAt?.toISOString(),
    editCount: post.editCount || 0,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  };
}

/**
 * 🆕 CRITICAL SECURITY: Enhanced permission check - ONLY OWNER can edit/delete
 * Added detailed logging to track permission issues
 */
export async function canUserManagePost(postId: string, userId: string, userRole: string, routeType?: 'mentor' | 'student'): Promise<PostPermissions> {
  try {
    await connectDB();
    
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      console.log('🔍 PERMISSION CHECK: Post not found', { postId, userId });
      return { canEdit: false, canDelete: false, reason: 'Post not found' };
    }

    if (post.isDeleted) {
      console.log('🔍 PERMISSION CHECK: Post is deleted', { postId, userId });
      return { canEdit: false, canDelete: false, reason: 'Post is already deleted' };
    }

    // 🆕 CRITICAL: Convert both IDs to string for proper comparison
    const postUserId = post.userId.toString();
    const currentUserId = userId.toString();
    
    const isOwner = postUserId === currentUserId;

    console.log('🔐 STRICT OWNERSHIP CHECK:', {
      postId: postId,
      postUserId: postUserId,
      currentUserId: currentUserId,
      isOwner: isOwner,
      userRole: userRole,
      routeType: routeType,
      postTitle: post.title,
      postRepliesCount: post.replies.length
    });

    // 🆕 CRITICAL: Route-based security validation
    if (routeType === 'mentor' && userRole !== 'mentor') {
      console.error('🚨 SECURITY VIOLATION: Student accessing mentor route permissions');
      return { 
        canEdit: false, 
        canDelete: false, 
        reason: 'Access denied: Mentor routes require mentor authentication' 
      };
    }

    if (routeType === 'student' && userRole !== 'student') {
      console.error('🚨 SECURITY VIOLATION: Mentor accessing student route permissions');
      return { 
        canEdit: false, 
        canDelete: false, 
        reason: 'Access denied: Student routes require student authentication' 
      };
    }

    // 🆕 CRITICAL FIX: ONLY POST OWNER can edit or delete
    if (!isOwner) {
      console.log('🔐 PERMISSION DENIED: User is not post owner', {
        postUserId,
        currentUserId,
        isOwner
      });
      return { 
        canEdit: false, 
        canDelete: false, 
        reason: 'You can only manage your own posts'
      };
    }

    console.log('🔐 PERMISSION GRANTED: User is post owner', {
      postUserId,
      currentUserId,
      isOwner
    });

    // 🆕 ONLY if user is the owner, allow edit/delete
    return { 
      canEdit: true, 
      canDelete: true
    };
  } catch (error) {
    console.error('❌ Error checking post permissions:', error);
    return { canEdit: false, canDelete: false, reason: 'Error checking permissions' };
  }
}

/**
 * Update a post (only if user has permission)
 */
export async function updatePostAction(
  postId: string, 
  updateData: { title?: string; content?: string; category?: string },
  userId: string,
  userRole: string,
  routeType?: 'mentor' | 'student'
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    console.log('🔄 UPDATE ACTION: Starting post update', { postId, userId, userRole });

    // 🆕 SECURITY: Enhanced permission check with route validation
    const permissionCheck = await canUserManagePost(postId, userId, userRole, routeType);
    if (!permissionCheck.canEdit) {
      console.error('🚨 SECURITY: Unauthorized edit attempt:', {
        postId, userId, userRole, routeType
      });
      return { success: false, error: permissionCheck.reason || 'Not authorized to edit this post' };
    }

    // 🆕 FIX: Fetch current post to get editCount
    const currentPost = await CommunityPost.findById(toObjectId(postId));
    const currentEditCount = currentPost?.editCount || 0;

    const updateFields: any = {
      ...updateData,
      edited: true,
      editedAt: new Date(),
      editCount: currentEditCount + 1,
      updatedAt: new Date()
    };

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      updateFields,
      { new: true }
    );

    console.log('✅ UPDATE ACTION: Post updated successfully', { postId });

    // 🆕 Route-specific revalidation
    if (routeType === 'mentor') {
      revalidatePath('/mentors/community');
    } else if (routeType === 'student') {
      revalidatePath('/students/communityforum');
    } else {
      // Fallback: revalidate all paths
      revalidatePath('/students/communityforum');
      revalidatePath('/mentors/community');
      revalidatePath('/admin/communityforum');
      revalidatePath('/moderator/community');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

/**
 * Delete a post (only if user has permission)
 */
export async function deletePostWithPermissionCheck(
  postId: string, 
  userId: string, 
  userRole: string,
  deletedBy?: string,
  routeType?: 'mentor' | 'student'
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    console.log('🗑️ DELETE ACTION: Starting post deletion', { postId, userId, userRole });

    // 🆕 SECURITY: Enhanced permission check with route validation
    const permissionCheck = await canUserManagePost(postId, userId, userRole, routeType);
    if (!permissionCheck.canDelete) {
      console.error('🚨 SECURITY: Unauthorized delete attempt:', {
        postId, userId, userRole, routeType,
        reason: permissionCheck.reason
      });
      return { success: false, error: permissionCheck.reason || 'Not authorized to delete this post' };
    }

    const updateData: any = {
      isDeleted: true,
      deletedAt: new Date()
    };
    
    if (deletedBy) {
      updateData.deletedBy = toObjectId(deletedBy);
    }

    await CommunityPost.findByIdAndUpdate(toObjectId(postId), updateData);

    console.log('✅ DELETE ACTION: Post deleted successfully', { postId });

    // 🆕 Route-specific revalidation
    if (routeType === 'mentor') {
      revalidatePath('/mentors/community');
    } else if (routeType === 'student') {
      revalidatePath('/students/communityforum');
    } else {
      // Fallback: revalidate all paths
      revalidatePath('/students/communityforum');
      revalidatePath('/mentors/community');
      revalidatePath('/admin/communityforum');
      revalidatePath('/moderator/community');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

/**
 * 🆕 SECURE: Enhanced reply permission check - ONLY OWNER can delete
 */
export async function canUserManageReply(
  postId: string, 
  replyId: string, 
  userId: string, 
  userRole: string,
  routeType?: 'mentor' | 'student'
): Promise<{ 
  canDelete: boolean; 
  reason?: string;
}> {
  try {
    await connectDB();
    
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { canDelete: false, reason: 'Post not found' };
    }

    const reply = post.replies.find((r: any) => r._id.toString() === replyId);
    if (!reply) {
      return { canDelete: false, reason: 'Reply not found' };
    }

    if (reply.isDeleted) {
      return { canDelete: false, reason: 'Reply is already deleted' };
    }

    // 🆕 CRITICAL: Convert both IDs to string for proper comparison
    const replyUserId = reply.userId.toString();
    const currentUserId = userId.toString();
    
    const isOwner = replyUserId === currentUserId;

    console.log('🔐 REPLY PERMISSION CHECK:', {
      postId,
      replyId,
      replyUserId,
      currentUserId,
      isOwner,
      userRole,
      routeType
    });

    // 🆕 CRITICAL: Route-based security validation
    if (routeType === 'mentor' && userRole !== 'mentor') {
      console.error('🚨 SECURITY VIOLATION: Student accessing mentor route reply permissions');
      return { canDelete: false, reason: 'Access denied: Mentor routes require mentor authentication' };
    }

    if (routeType === 'student' && userRole !== 'student') {
      console.error('🚨 SECURITY VIOLATION: Mentor accessing student route reply permissions');
      return { canDelete: false, reason: 'Access denied: Student routes require student authentication' };
    }

    // 🆕 CRITICAL FIX: ONLY REPLY OWNER can delete
    if (!isOwner) {
      return { canDelete: false, reason: 'You can only delete your own replies' };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Error checking reply permissions:', error);
    return { canDelete: false, reason: 'Error checking permissions' };
  }
}

/**
 * Delete a reply (only if user has permission)
 */
export async function deleteReplyWithPermissionCheck(
  postId: string, 
  replyId: string, 
  userId: string, 
  userRole: string,
  deletedBy?: string,
  routeType?: 'mentor' | 'student'
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // 🆕 SECURITY: Enhanced permission check with route validation
    const permissionCheck = await canUserManageReply(postId, replyId, userId, userRole, routeType);
    if (!permissionCheck.canDelete) {
      console.error('🚨 SECURITY: Unauthorized reply delete attempt:', {
        postId, replyId, userId, userRole, routeType
      });
      return { success: false, error: permissionCheck.reason || 'Not authorized to delete this reply' };
    }

    const updateData: any = {
      'replies.$[reply].isDeleted': true,
      'replies.$[reply].deletedAt': new Date(),
      updatedAt: new Date()
    };

    if (deletedBy) {
      updateData['replies.$[reply].deletedBy'] = toObjectId(deletedBy);
    }

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      { $set: updateData },
      {
        arrayFilters: [
          { 'reply._id': toObjectId(replyId) }
        ],
        new: true
      }
    );

    // 🆕 Route-specific revalidation
    if (routeType === 'mentor') {
      revalidatePath('/mentors/community');
    } else if (routeType === 'student') {
      revalidatePath('/students/communityforum');
    } else {
      // Fallback: revalidate all paths
      revalidatePath('/students/communityforum');
      revalidatePath('/mentors/community');
      revalidatePath('/admin/communityforum');
      revalidatePath('/moderator/community');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting reply:', error);
    return { success: false, error: 'Failed to delete reply' };
  }
}