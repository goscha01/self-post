'use client';

import { useState } from 'react';
import { Edit, Trash2, Calendar, Eye, MoreVertical } from 'lucide-react';

const mockPosts = [
  {
    id: 1,
    title: 'Product Launch Announcement',
    content: 'Exciting news! Our new product is launching next week...',
    status: 'Scheduled',
    scheduledFor: '2024-01-15 10:00 AM',
    platforms: ['Instagram', 'Twitter', 'Facebook'],
    engagement: '2.4K',
  },
  {
    id: 2,
    title: 'Weekly Tips & Tricks',
    content: 'Here are this week\'s top tips for maximizing your productivity...',
    status: 'Draft',
    scheduledFor: null,
    platforms: ['Instagram', 'Twitter'],
    engagement: null,
  },
  {
    id: 3,
    title: 'Customer Success Story',
    content: 'Meet Sarah, who transformed her business using our platform...',
    status: 'Published',
    scheduledFor: '2024-01-10 9:00 AM',
    platforms: ['Facebook', 'LinkedIn'],
    engagement: '1.8K',
  },
];

export function PostsList() {
  const [posts] = useState(mockPosts);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
              </div>
              <button className="ml-2 p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
                
                {post.scheduledFor && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{post.scheduledFor}</span>
                  </div>
                )}
                
                {post.engagement && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>{post.engagement}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-blue-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {post.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          View All Posts
        </button>
      </div>
    </div>
  );
}
