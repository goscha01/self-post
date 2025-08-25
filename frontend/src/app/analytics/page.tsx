'use client';

import { useState } from 'react';

interface AnalyticsData {
  totalPosts: number;
  totalInteractions: number;
  sources: {
    name: string;
    posts: number;
    interactions: number;
    engagement: number;
  }[];
  timeline: {
    date: string;
    posts: number;
    interactions: number;
  }[];
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedSource, setSelectedSource] = useState('all');

  // Mock data - replace with real API calls
  const analyticsData: AnalyticsData = {
    totalPosts: 156,
    totalInteractions: 2847,
    sources: [
      { name: 'Google Business Profile', posts: 45, interactions: 892, engagement: 19.8 },
      { name: 'Facebook', posts: 38, interactions: 756, engagement: 19.9 },
      { name: 'Instagram', posts: 42, interactions: 678, engagement: 16.1 },
      { name: 'LinkedIn', posts: 31, interactions: 521, engagement: 16.8 }
    ],
    timeline: [
      { date: '2024-01-01', posts: 5, interactions: 89 },
      { date: '2024-01-02', posts: 3, interactions: 67 },
      { date: '2024-01-03', posts: 7, interactions: 124 },
      { date: '2024-01-04', posts: 4, interactions: 78 },
      { date: '2024-01-05', posts: 6, interactions: 95 },
      { date: '2024-01-06', posts: 2, interactions: 45 },
      { date: '2024-01-07', posts: 8, interactions: 156 }
    ]
  };

  const filteredSources = selectedSource === 'all' 
    ? analyticsData.sources 
    : analyticsData.sources.filter(s => s.name === selectedSource);

  return (
    <div className="min-h-full p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <div className="flex gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select 
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            {analyticsData.sources.map(source => (
              <option key={source.name} value={source.name}>{source.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalInteractions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analyticsData.sources.reduce((acc, s) => acc + s.engagement, 0) / analyticsData.sources.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Source Performance</h3>
          <div className="space-y-4">
            {filteredSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{source.posts} posts</div>
                  <div className="text-sm text-gray-600">{source.interactions.toLocaleString()} interactions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
          <div className="space-y-4">
            {filteredSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <span className="font-medium">{source.name}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(source.engagement * 5, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{source.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Graph */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Posts & Interactions Timeline</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analyticsData.timeline.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-sm relative">
                <div 
                  className="bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(day.posts / 8) * 100}%` }}
                />
                <div 
                  className="bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600 absolute bottom-0 w-full"
                  style={{ height: `${(day.interactions / 156) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
            Posts
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2" />
            Interactions
          </div>
        </div>
      </div>
    </div>
  );
}
