import { Injectable, Logger } from '@nestjs/common';

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks?: string[];
  fan_count?: number;
  verification_status?: string;
}

export interface FacebookPostData {
  message: string;
  link?: string;
  picture?: string;
  name?: string;
  description?: string;
  scheduled_publish_time?: number;
}

export interface FacebookPostResult {
  id: string;
  message?: string;
  created_time: string;
  mock?: boolean;
  success: boolean;
  error?: string;
}

@Injectable()
export class FacebookApiService {
  private readonly logger = new Logger(FacebookApiService.name);

  /**
   * Get Facebook pages the user manages
   */
  async getPages(accessToken: string): Promise<FacebookPage[]> {
    try {
      this.logger.log('🔍 Fetching Facebook pages...');
      
      const response = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ Failed to fetch Facebook pages: ${response.status} - ${errorText}`);
        throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const pages = data.data || [];
      
      this.logger.log(`✅ Successfully fetched ${pages.length} Facebook pages`);
      
      return pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
        tasks: page.tasks || [],
        fan_count: page.fan_count,
        verification_status: page.verification_status
      }));
    } catch (error) {
      this.logger.error('❌ Error fetching Facebook pages:', error);
      throw error;
    }
  }

  /**
   * Post to a Facebook page
   */
  async postToPage(pageId: string, pageAccessToken: string, postData: FacebookPostData): Promise<FacebookPostResult> {
    try {
      this.logger.log(`📝 Posting to Facebook page: ${pageId}`);
      this.logger.log(`📊 Post data:`, postData);

      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development') {
        this.logger.log('🔄 Development mode: Using mock Facebook posting');
        return this.mockPagePost(pageId, postData);
      }

      // Production mode: Real Facebook Graph API posting
      this.logger.log('🚀 Production mode: Posting to Facebook Graph API');
      
      const response = await fetch(`https://graph.facebook.com/${pageId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          access_token: pageAccessToken
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`❌ Facebook posting failed: ${response.status} - ${errorText}`);
        throw new Error(`Facebook posting error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.log(`✅ Successfully posted to Facebook page: ${result.id}`);
      
      return {
        id: result.id,
        message: postData.message,
        created_time: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      this.logger.error('❌ Error posting to Facebook page:', error);
      throw error;
    }
  }

  /**
   * Mock Facebook posting for development
   */
  private mockPagePost(pageId: string, postData: FacebookPostData): FacebookPostResult {
    this.logger.log(`🎭 Mock Facebook post for page: ${pageId}`);
    
    const mockId = `${pageId}_${Date.now()}`;
    const mockTime = new Date().toISOString();
    
    this.logger.log(`🎭 Mock post created with ID: ${mockId}`);
    this.logger.log(`🎭 Mock post time: ${mockTime}`);
    
    return {
      id: mockId,
      message: postData.message,
      created_time: mockTime,
      mock: true,
      success: true
    };
  }

  /**
   * Get page insights (mock in development)
   */
  async getPageInsights(pageId: string, pageAccessToken: string): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.mockPageInsights(pageId);
      }

      const response = await fetch(
        `https://graph.facebook.com/${pageId}/insights?metric=page_views_total,page_fans&access_token=${pageAccessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('❌ Error fetching page insights:', error);
      throw error;
    }
  }

  /**
   * Mock page insights for development
   */
  private mockPageInsights(pageId: string): any {
    return {
      data: [
        {
          name: 'page_views_total',
          values: [{ value: Math.floor(Math.random() * 1000) + 100 }]
        },
        {
          name: 'page_fans',
          values: [{ value: Math.floor(Math.random() * 500) + 50 }]
        }
      ],
      mock: true
    };
  }

  /**
   * Schedule a post (mock in development)
   */
  async schedulePost(pageId: string, pageAccessToken: string, postData: FacebookPostData, publishTime: Date): Promise<FacebookPostResult> {
    try {
      const scheduledTime = Math.floor(publishTime.getTime() / 1000);
      
      if (process.env.NODE_ENV === 'development') {
        return this.mockScheduledPost(pageId, postData, scheduledTime);
      }

      const response = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          published: false,
          scheduled_publish_time: scheduledTime,
          access_token: pageAccessToken
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule post: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        message: postData.message,
        created_time: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      this.logger.error('❌ Error scheduling Facebook post:', error);
      throw error;
    }
  }

  /**
   * Mock scheduled post for development
   */
  private mockScheduledPost(pageId: string, postData: FacebookPostData, scheduledTime: number): FacebookPostResult {
    const mockId = `${pageId}_scheduled_${Date.now()}`;
    
    return {
      id: mockId,
      message: postData.message,
      created_time: new Date().toISOString(),
      mock: true,
      success: true
    };
  }
}
