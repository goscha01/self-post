import { PostForm } from '@/components/posts/post-form';
import { PostsList } from '@/components/posts/posts-list';

export default function PostsPage() {
  return (
    <div className="min-h-full p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Posts</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create Post</h2>
          <PostForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Posts</h2>
          <PostsList />
        </div>
      </div>
    </div>
  );
}
