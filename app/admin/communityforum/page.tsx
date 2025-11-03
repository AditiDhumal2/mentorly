import { CommunityPost } from '@/types/community';
import { getAdminCommunityPosts, deletePostAction, deleteReplyAction } from '@/actions/communityforum-admin-actions';
import AdminCommunityForum from './components/AdminCommunityForum';

export default async function AdminCommunityForumPage() {
  let posts: CommunityPost[] = [];
  let loading = false;

  try {
    const fetchedPosts = await getAdminCommunityPosts();
    posts = fetchedPosts;
  } catch (error) {
    console.error('Error loading posts:', error);
    // You can handle this error in a different way, maybe redirect or show error page
    posts = [];
  }

  return (
    <AdminCommunityForum
      posts={posts}
      loading={loading}
      onDeletePost={deletePostAction}
      onDeleteReply={deleteReplyAction}
    />
  );
}