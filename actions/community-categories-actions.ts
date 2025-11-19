'use server';

import { connectDB } from '@/lib/db';
import { CommunityPost } from '@/models/CommunityPost';
import { CategoryInfo } from '@/types/community';

export async function getPostsByCategory(
  category: string, 
  userRole: 'student' | 'mentor' | 'admin' | null
) {
  try {
    await connectDB();
    
    let query: any = { isDeleted: false };
    
    // Handle special categories
    if (category === 'mentor-chats') {
      query.visibility = 'mentors';
    } else if (category === 'admin-mentors') {
      query.visibility = 'admin-mentors';
    } else if (category === 'announcements') {
      query.category = 'announcement';
    } else {
      query.category = category;
    }
    
    // Add visibility restrictions based on user role
    if (userRole === 'student') {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'students' },
        { category: 'announcement' }
      ];
    } else if (userRole === 'mentor') {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'students' },
        { visibility: 'mentors' },
        { visibility: 'admin-mentors' },
        { category: 'announcement' }
      ];
    }
    
    const posts = await CommunityPost.find(query)
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
    console.error('Error fetching posts by category:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function getCategoryCounts(userRole: 'student' | 'mentor' | 'admin' | null) {
  try {
    await connectDB();
    
    const baseCategories = [
      'higher-education',
      'market-trends', 
      'domains',
      'placements',
      'general',
      'academic',
      'career',
      'technical',
      'announcement'
    ];
    
    const counts: { [key: string]: number } = {};
    
    for (const category of baseCategories) {
      let query: any = { 
        category,
        isDeleted: false 
      };
      
      if (userRole === 'student') {
        query.$or = [
          { visibility: 'public' },
          { visibility: 'students' },
          { category: 'announcement' }
        ];
      } else if (userRole === 'mentor') {
        query.$or = [
          { visibility: 'public' },
          { visibility: 'students' },
          { visibility: 'mentors' },
          { category: 'announcement' }
        ];
      }
      
      counts[category] = await CommunityPost.countDocuments(query);
    }
    
    // Add special categories
    if (userRole === 'mentor' || userRole === 'admin') {
      counts['mentor-chats'] = await CommunityPost.countDocuments({
        visibility: 'mentors',
        isDeleted: false
      });
    }
    
    if (userRole === 'admin') {
      counts['admin-mentors'] = await CommunityPost.countDocuments({
        visibility: 'admin-mentors',
        isDeleted: false
      });
    }
    
    return counts;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return {};
  }
}

export async function getCategoriesForUser(userRole: 'student' | 'mentor' | 'admin' | null): Promise<CategoryInfo[]> {
  try {
    const counts = await getCategoryCounts(userRole);
    
    const baseCategories: CategoryInfo[] = [
      {
        id: 'higher-education',
        name: 'Higher Education',
        description: 'Discussions about universities, courses, admissions, and academic pathways',
        icon: '🎓',
        color: 'from-blue-500 to-blue-600',
        postCount: counts['higher-education'] || 0,
        visibility: ['public', 'students', 'mentors']
      },
      {
        id: 'market-trends',
        name: 'Market Trends',
        description: 'Latest industry trends, job market insights, and career opportunities',
        icon: '📈',
        color: 'from-green-500 to-green-600',
        postCount: counts['market-trends'] || 0,
        visibility: ['public', 'students', 'mentors', 'admin-mentors']
      },
      {
        id: 'domains',
        name: 'Domains & Specializations',
        description: 'Technical domains, specializations, and skill development discussions',
        icon: '🔧',
        color: 'from-purple-500 to-purple-600',
        postCount: counts['domains'] || 0,
        visibility: ['public', 'students', 'mentors']
      },
      {
        id: 'placements',
        name: 'Placements & Careers',
        description: 'Interview preparation, resume tips, and placement guidance',
        icon: '💼',
        color: 'from-orange-500 to-orange-600',
        postCount: counts['placements'] || 0,
        visibility: ['public', 'students', 'mentors']
      },
      {
        id: 'announcements',
        name: 'Announcements',
        description: 'Important updates and announcements from mentors and administrators',
        icon: '📢',
        color: 'from-yellow-500 to-yellow-600',
        postCount: counts['announcement'] || 0,
        visibility: ['public', 'students', 'mentors']
      },
      {
        id: 'general',
        name: 'General Discussion',
        description: 'General questions and community discussions',
        icon: '💬',
        color: 'from-indigo-500 to-indigo-600',
        postCount: counts['general'] || 0,
        visibility: ['public', 'students', 'mentors']
      }
    ];

    // Add role-specific categories
    if (userRole === 'mentor' || userRole === 'admin') {
      baseCategories.push({
        id: 'mentor-chats',
        name: 'Mentor Discussions',
        description: 'Private discussions between mentors about student guidance and strategies',
        icon: '👨‍🏫',
        color: 'from-red-500 to-red-600',
        postCount: counts['mentor-chats'] || 0,
        visibility: ['mentors', 'admin-mentors']
      });
    }

    if (userRole === 'admin') {
      baseCategories.push({
        id: 'admin-mentors',
        name: 'Admin-Mentor Chats',
        description: 'Private communication channel between administrators and mentors',
        icon: '🔒',
        color: 'from-gray-600 to-gray-700',
        postCount: counts['admin-mentors'] || 0,
        visibility: ['admin-mentors']
      });
    }

    return baseCategories;
  } catch (error) {
    console.error('Error getting categories for user:', error);
    return [];
  }
}