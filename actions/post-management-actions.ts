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
 * Check if user can edit/delete a post
 * Users can only edit/delete their own posts if there are no replies
 * Admins can always delete but not edit
 */
export async function canUserManagePost(postId: string, userId: string, userRole: string): Promise<PostPermissions> {
  try {
    await connectDB();
    
    const post = await CommunityPost.findById(toObjectId(postId));
    if (!post) {
      return { canEdit: false, canDelete: false, reason: 'Post not found' };
    }

    if (post.isDeleted) {
      return { canEdit: false, canDelete: false, reason: 'Post is already deleted' };
    }

    const isOwner = post.userId.toString() === userId;
    const hasReplies = post.replies.length > 0;
    const isAdmin = userRole === 'admin';

    // Admin can always delete but not edit
    if (isAdmin) {
      return { 
        canEdit: false, 
        canDelete: true, 
        reason: 'Admins can delete any post but cannot edit',
        post: convertToCommunityPost(post)
      };
    }

    // Regular users can only manage their own posts
    if (!isOwner) {
      return { 
        canEdit: false, 
        canDelete: false, 
        reason: 'You can only manage your own posts',
        post: convertToCommunityPost(post)
      };
    }

    // Owners cannot edit/delete if there are replies
    if (hasReplies) {
      return { 
        canEdit: false, 
        canDelete: false, 
        reason: 'Cannot edit or delete posts that have replies',
        post: convertToCommunityPost(post)
      };
    }

    return { 
      canEdit: true, 
      canDelete: true,
      post: convertToCommunityPost(post)
    };
  } catch (error) {
    console.error('Error checking post permissions:', error);
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
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Check permissions first
    const permissionCheck = await canUserManagePost(postId, userId, userRole);
    if (!permissionCheck.canEdit) {
      return { success: false, error: permissionCheck.reason || 'Not authorized to edit this post' };
    }

    const updateFields: any = {
      ...updateData,
      edited: true,
      editedAt: new Date(),
      editCount: (permissionCheck.post?.editCount || 0) + 1,
      updatedAt: new Date()
    };

    await CommunityPost.findByIdAndUpdate(
      toObjectId(postId),
      updateFields,
      { new: true }
    );

    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    revalidatePath('/admin/communityforum');
    revalidatePath('/moderator/community');

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
  deletedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Check permissions first
    const permissionCheck = await canUserManagePost(postId, userId, userRole);
    if (!permissionCheck.canDelete) {
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

    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    revalidatePath('/admin/communityforum');
    revalidatePath('/moderator/community');

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

/**
 * Check if user can manage a reply
 */
export async function canUserManageReply(
  postId: string, 
  replyId: string, 
  userId: string, 
  userRole: string
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

    // Use the correct way to find a reply in the array
    const reply = post.replies.find((r: any) => r._id.toString() === replyId);
    if (!reply) {
      return { canDelete: false, reason: 'Reply not found' };
    }

    if (reply.isDeleted) {
      return { canDelete: false, reason: 'Reply is already deleted' };
    }

    const isOwner = reply.userId.toString() === userId;
    const isAdmin = userRole === 'admin';

    // Admin can always delete replies
    if (isAdmin) {
      return { canDelete: true };
    }

    // Regular users can only delete their own replies
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
  deletedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Check permissions first
    const permissionCheck = await canUserManageReply(postId, replyId, userId, userRole);
    if (!permissionCheck.canDelete) {
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

    revalidatePath('/students/communityforum');
    revalidatePath('/mentors/community');
    revalidatePath('/admin/communityforum');
    revalidatePath('/moderator/community');

    return { success: true };
  } catch (error) {
    console.error('Error deleting reply:', error);
    return { success: false, error: 'Failed to delete reply' };
  }
}