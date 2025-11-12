// actions/communityforum-mentor-actions.ts
'use server';

import { CommunityPost } from '@/models/CommunityPost';
import { connectDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

// Helper function to safely serialize posts
function serializePost(post: any) {
  const basePost = {
    _id: post._id?.toString() || new Types.ObjectId().toString(),
    title: post.title || '',
    content: post.content || '',
    category: post.category || 'query',
    userId: post.userId?.toString() || '',
    userName: post.userName || 'Unknown User',
    userRole: post.userRole || 'student',
    replies: (post.replies || []).map((reply: any) => ({
      _id: reply._id?.toString() || new Types.ObjectId().toString(),
      userId: reply.userId?.toString() || '',
      userName: reply.userName || 'Unknown User',
      userRole: reply.userRole || 'student',
      message: reply.message || '',
      createdAt: reply.createdAt?.toISOString() || new Date().toISOString()
    })),
    upvotes: (post.upvotes || []).map((id: any) => id.toString()),
    createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
    // Safely handle updatedAt - use createdAt if not available
    updatedAt: post.updatedAt?.toISOString() || post.createdAt?.toISOString() || new Date().toISOString()
  };

  return basePost;
}

export async function getCommunityPosts() {
  try {
    await connectDB();
    
    const posts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    // Proper serialization with safe field access
    const transformedPosts = posts.map(post => {
      // Handle the lean document structure safely
      const postObj = post as any;
      return {
        _id: postObj._id.toString(),
        title: postObj.title,
        content: postObj.content,
        category: postObj.category,
        userId: postObj.userId.toString(),
        userName: postObj.userName,
        userRole: postObj.userRole || 'student',
        replies: (postObj.replies || []).map((reply: any) => ({
          _id: reply._id?.toString() || new Types.ObjectId().toString(),
          userId: reply.userId?.toString(),
          userName: reply.userName,
          userRole: reply.userRole || 'student',
          message: reply.message,
          createdAt: reply.createdAt?.toISOString() || new Date().toISOString()
        })),
        upvotes: (postObj.upvotes || []).map((id: any) => id.toString()),
        createdAt: postObj.createdAt?.toISOString(),
        // Safely handle updatedAt - fallback to createdAt
        updatedAt: postObj.updatedAt?.toISOString() || postObj.createdAt?.toISOString()
      };
    });
    
    return transformedPosts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
}

export async function addCommunityPostAction(postData: {
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
}) {
  try {
    await connectDB();

    const newPost = new CommunityPost({
      ...postData,
      userId: new Types.ObjectId(postData.userId),
      replies: [],
      upvotes: []
    });

    await newPost.save();
    
    revalidatePath('/mentors/community');
    
    // Return serialized data
    return { 
      success: true, 
      post: serializePost(newPost)
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function replyToPostAction(
  postId: string, 
  replyData: {
    userId: string;
    userName: string;
    userRole: 'student' | 'mentor';
    message: string;
  }
) {
  try {
    await connectDB();

    console.log('🔍 Searching for post with ID:', postId);
    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      console.log('❌ Post not found for ID:', postId);
      return { success: false, error: 'Post not found' };
    }

    console.log('✅ Post found:', post.title);
    console.log('📝 Adding reply from:', replyData.userName, 'as', replyData.userRole);

    const newReply = {
      ...replyData,
      userId: new Types.ObjectId(replyData.userId),
      _id: new Types.ObjectId(),
      createdAt: new Date()
    };

    // Use type assertion for replies array
    (post.replies as any[]).push(newReply);
    await post.save();
    
    console.log('✅ Reply added successfully. Total replies:', post.replies.length);
    
    revalidatePath('/mentors/community');
    return { success: true };
  } catch (error) {
    console.error('❌ Error adding reply:', error);
    return { success: false, error: 'Failed to add reply: ' + (error as Error).message };
  }
}

export async function upvotePostAction(postId: string, userId: string) {
  try {
    await connectDB();

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Use type assertion for upvotes array
    const upvotesArray = post.upvotes as Types.ObjectId[];
    const hasUpvoted = upvotesArray.some(upvoteId => 
      upvoteId.toString() === userObjectId.toString()
    );

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = upvotesArray.filter(upvoteId => 
        upvoteId.toString() !== userObjectId.toString()
      );
    } else {
      // Add upvote
      upvotesArray.push(userObjectId);
    }

    await post.save();
    
    revalidatePath('/mentors/community');
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
    
    // Type assertion for the lean document
    const postObj = post as any;
    
    return {
      _id: postObj._id.toString(),
      title: postObj.title,
      content: postObj.content,
      category: postObj.category,
      userId: postObj.userId.toString(),
      userName: postObj.userName,
      userRole: postObj.userRole || 'student',
      replies: (postObj.replies || []).map((reply: any) => ({
        _id: reply._id?.toString() || new Types.ObjectId().toString(),
        userId: reply.userId?.toString(),
        userName: reply.userName,
        userRole: reply.userRole || 'student',
        message: reply.message,
        createdAt: reply.createdAt?.toISOString() || new Date().toISOString()
      })),
      upvotes: (postObj.upvotes || []).map((id: any) => id.toString()),
      createdAt: postObj.createdAt?.toISOString(),
      // Safely handle updatedAt with fallback
      updatedAt: postObj.updatedAt?.toISOString() || postObj.createdAt?.toISOString()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}