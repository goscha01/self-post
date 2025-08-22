'use client';

import { Calendar, Edit } from 'lucide-react';

const upcomingPosts = [
  {
    id: 1,
    title: 'Product Launch Announcement',
    content: 'Exciting news! Our new product is launching next week...',
    scheduledFor: '2024-01-15 10:00 AM',
    platforms: ['Instagram', 'Twitter', 'Facebook'],
    status: 'Scheduled',
  },
  {
    id: 2,
    title: 'Weekly Tips & Tricks',
    content: 'Here are this week\'s top tips for maximizing your productivity...',
    scheduledFor: '2024-01-16 2:00 PM',
    platforms: ['Instagram', 'Twitter'],
    status: 'Draft',
  },
  {
    id: 3,
    title: 'Customer Success Story',
    content: 'Meet Sarah, who transformed her business using our platform...',
    scheduledFor: '2024-01-17 9:00 AM',
    platforms: ['Facebook', 'LinkedIn'],
    status: 'Scheduled',
  },
];

export function UpcomingPosts() {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Posts</h3>
      <div className="space-y-4">
        {upcomingPosts.map((post) => (
          <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">{post.title}</h4>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{post.scheduledFor}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                post.status === 'Scheduled' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {post.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {post.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
        View All Posts
      </button>
    </div>
  );
}
