import * as FileSystem from 'expo-file-system';

const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}video-cache/`;
const MAX_CACHE_AGE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

const getFilename = (url: string) => {
  if (!url) return '';
  // Create a simple hash from string to use as filename
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Remove query parameters to keep extension if possible, but hash ensures uniqueness
  const extension = url.split('.').pop()?.split('?')[0] || 'mp4';
  return `v_${Math.abs(hash)}.${extension}`;
};

/**
 * Initialize cache directory and perform cleanup
 */
export const initVideoCache = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
    }
    // Clean up expired files on startup
    await cleanupCache();
  } catch (e) {
    console.error('Failed to init video cache', e);
  }
};

/**
 * Remove files older than 5 hours
 */
export const cleanupCache = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
    const now = Date.now();
    
    for (const file of files) {
      const fileUri = `${VIDEO_CACHE_DIR}${file}`;
      const info = await FileSystem.getInfoAsync(fileUri);
      
      if (info.exists && !info.isDirectory && info.modificationTime) {
        const age = now - (info.modificationTime * 1000);
        if (age > MAX_CACHE_AGE) {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
          // console.log(`[VideoCache] Deleted expired file: ${file}`);
        }
      }
    }
  } catch (e) {
    console.error('[VideoCache] Cleanup failed', e);
  }
};

/**
 * Get local URI for a video URL if it exists and is fresh
 */
export const getCachedVideoUri = async (url: string): Promise<string> => {
  if (!url) return url;
  
  const filename = getFilename(url);
  const fileUri = `${VIDEO_CACHE_DIR}${filename}`;
  
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (fileInfo.exists && fileInfo.modificationTime) {
    const age = Date.now() - (fileInfo.modificationTime * 1000);
    if (age <= MAX_CACHE_AGE) {
      return fileUri;
    }
    // Expired - delete it
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }
  
  return url;
};

/**
 * Download a video to local cache if not already present
 */
export const prefetchVideo = async (url: string) => {
  if (!url || !url.startsWith('http')) return;
  
  const filename = getFilename(url);
  const fileUri = `${VIDEO_CACHE_DIR}${filename}`;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && fileInfo.modificationTime) {
      const age = Date.now() - (fileInfo.modificationTime * 1000);
      if (age <= MAX_CACHE_AGE) {
        return; // Fresh cache exists
      }
      // Expired cache - remove before redownloading
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }

    // console.log(`[VideoCache] Prefetching: ${url}`);
    await FileSystem.downloadAsync(url, fileUri);
  } catch (e) {
    // Fail silently for prefetch
    // console.error(`[VideoCache] Prefetch failed for ${url}`, e);
  }
};
