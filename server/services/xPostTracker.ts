/**
 * X Post Tracker - Prevents Duplicate Posts
 * Maintains a hash of recently posted content to avoid repetition
 */

import crypto from 'crypto';

interface PostRecord {
  hash: string;
  timestamp: number;
  content: string;
  mediaType: string;
}

class XPostTracker {
  private recentPosts: PostRecord[] = [];
  private readonly maxRecordAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private readonly maxRecords = 100; // Keep last 100 posts

  /**
   * Check if content is duplicate of recent post
   */
  isDuplicate(content: string): boolean {
    this.cleanOldRecords();
    
    const hash = this.generateContentHash(content);
    return this.recentPosts.some(record => record.hash === hash);
  }

  /**
   * Record a new post to prevent future duplicates
   */
  recordPost(content: string, mediaType: string = 'text'): void {
    this.cleanOldRecords();
    
    const hash = this.generateContentHash(content);
    const record: PostRecord = {
      hash,
      timestamp: Date.now(),
      content: content.substring(0, 100), // Store first 100 chars for debugging
      mediaType
    };
    
    this.recentPosts.push(record);
    
    // Keep only most recent records
    if (this.recentPosts.length > this.maxRecords) {
      this.recentPosts = this.recentPosts.slice(-this.maxRecords);
    }
    
    console.log(`📝 Recorded post (${mediaType}): ${hash.substring(0, 8)}... (${this.recentPosts.length} total)`);
  }

  /**
   * Generate content hash for duplicate detection
   */
  private generateContentHash(content: string): string {
    // Normalize content: remove extra spaces, convert to lowercase, remove URLs
    const normalized = content
      .toLowerCase()
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Remove old records to prevent memory bloat
   */
  private cleanOldRecords(): void {
    const cutoff = Date.now() - this.maxRecordAge;
    const initialCount = this.recentPosts.length;
    
    this.recentPosts = this.recentPosts.filter(record => record.timestamp > cutoff);
    
    const removedCount = initialCount - this.recentPosts.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned ${removedCount} old post records`);
    }
  }

  /**
   * Get statistics about recent posts
   */
  getStats(): { totalPosts: number; oldestPost: Date | null; newestPost: Date | null } {
    this.cleanOldRecords();
    
    if (this.recentPosts.length === 0) {
      return { totalPosts: 0, oldestPost: null, newestPost: null };
    }
    
    const timestamps = this.recentPosts.map(r => r.timestamp);
    return {
      totalPosts: this.recentPosts.length,
      oldestPost: new Date(Math.min(...timestamps)),
      newestPost: new Date(Math.max(...timestamps))
    };
  }

  /**
   * Force clear all records (for testing)
   */
  clearAll(): void {
    this.recentPosts = [];
    console.log('🗑️ Cleared all post records');
  }
}

export const xPostTracker = new XPostTracker();