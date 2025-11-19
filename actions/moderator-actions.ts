'use server';

import { connectDB } from '@/lib/db';
import { Moderator, CommunityPost } from '@/models/CommunityPost'; // Add CommunityPost import
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      return new Types.ObjectId();
    }
    return new Types.ObjectId(id);
  }
  return id;
};

export async function assignModerator(
  userId: string,
  userName: string,
  userRole: 'student' | 'mentor',
  assignedCategories: string[]
) {
  try {
    await connectDB();

    console.log('🔍 Assigning moderator:', { userId, userName, userRole, assignedCategories });

    // Check if user already exists as moderator
    const existingModerator = await Moderator.findOne({ userId: toObjectId(userId) });
    
    if (existingModerator) {
      // Update existing moderator
      existingModerator.assignedCategories = assignedCategories;
      existingModerator.isActive = true;
      existingModerator.updatedAt = new Date();
      await existingModerator.save();
      console.log('✅ Updated existing moderator');
    } else {
      // Create new moderator
      const moderator = new Moderator({
        userId: toObjectId(userId),
        userModel: userRole === 'student' ? 'Student' : 'Mentor',
        userName,
        userRole,
        assignedCategories,
        permissions: {
          canDeletePosts: true,
          canDeleteReplies: true,
          canManageReports: true,
          canViewAllContent: true
        },
        isActive: true
      });
      await moderator.save();
      console.log('✅ Created new moderator');
    }

    revalidatePath('/admin/moderators');
    return { success: true, message: 'Moderator assigned successfully' };
  } catch (error) {
    console.error('❌ Error assigning moderator:', error);
    return { success: false, error: 'Failed to assign moderator' };
  }
}

export async function removeModerator(userId: string) {
  try {
    await connectDB();

    const moderator = await Moderator.findOne({ userId: toObjectId(userId) });
    if (moderator) {
      moderator.isActive = false;
      moderator.updatedAt = new Date();
      await moderator.save();
    }

    revalidatePath('/admin/moderators');
    return { success: true, message: 'Moderator removed successfully' };
  } catch (error) {
    console.error('Error removing moderator:', error);
    return { success: false, error: 'Failed to remove moderator' };
  }
}

export async function getModerators() {
  try {
    await connectDB();

    const moderators = await Moderator.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return moderators.map(mod => ({
      _id: mod._id.toString(),
      userId: mod.userId.toString(),
      userName: mod.userName,
      userRole: mod.userRole,
      assignedCategories: mod.assignedCategories,
      permissions: mod.permissions,
      isActive: mod.isActive,
      createdAt: mod.createdAt.toISOString(),
      updatedAt: mod.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }
}

export async function getModeratorByUserId(userId: string) {
  try {
    await connectDB();

    console.log('🔍 Looking up moderator for user ID:', userId);
    
    const moderator = await Moderator.findOne({ 
      userId: toObjectId(userId), 
      isActive: true 
    }).lean();
    
    if (!moderator) {
      console.log('❌ No active moderator found for user ID:', userId);
      return null;
    }

    console.log('✅ Found moderator:', moderator.userName);
    
    return {
      _id: moderator._id.toString(),
      userId: moderator.userId.toString(),
      userName: moderator.userName,
      userRole: moderator.userRole,
      assignedCategories: moderator.assignedCategories,
      permissions: moderator.permissions,
      isActive: moderator.isActive,
      createdAt: moderator.createdAt.toISOString(),
      updatedAt: moderator.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching moderator:', error);
    return null;
  }
}

export async function isUserModerator(userId: string) {
  try {
    await connectDB();
    const moderator = await Moderator.findOne({ 
      userId: toObjectId(userId), 
      isActive: true 
    });
    return !!moderator;
  } catch (error) {
    console.error('Error checking moderator status:', error);
    return false;
  }
}

export async function canUserModerateCategory(userId: string, category: string) {
  try {
    await connectDB();
    const moderator = await Moderator.findOne({ 
      userId: toObjectId(userId), 
      isActive: true,
      assignedCategories: category 
    });
    return !!moderator;
  } catch (error) {
    console.error('Error checking moderation permissions:', error);
    return false;
  }
}

export async function getModeratorPosts(userId: string) {
  try {
    await connectDB();
    
    console.log('🔍 Getting moderator posts for user ID:', userId);
    
    // First get the moderator's assigned categories
    const moderator = await Moderator.findOne({ 
      userId: toObjectId(userId), 
      isActive: true 
    }).lean();
    
    if (!moderator) {
      console.log('❌ No moderator found for user ID:', userId);
      return [];
    }
    
    console.log('✅ Moderator found, assigned categories:', moderator.assignedCategories);
    
    const posts = await CommunityPost.find({
      isDeleted: false,
      category: { $in: moderator.assignedCategories }
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    console.log(`✅ Found ${posts.length} posts in moderator's categories`);
    
    return posts.map((post: any) => ({
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
      edited: post.edited || false,
      editedAt: post.editedAt?.toISOString(),
      editCount: post.editCount || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('❌ Error fetching moderator posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function searchUsersForModeration(query: string) {
  try {
    await connectDB();

    const students = await Student.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name email role')
    .limit(10)
    .lean();

    const mentors = await Mentor.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name email role')
    .limit(10)
    .lean();

    const users = [
      ...students.map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        role: 'student' as const
      })),
      ...mentors.map((m: any) => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        role: 'mentor' as const
      }))
    ];

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}