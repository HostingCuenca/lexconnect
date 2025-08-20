import 'server-only';

// Safe database wrapper that handles connection failures gracefully during SSG
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  try {
    // Add timeout to prevent hanging during build
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timeout')), 10000);
    });
    
    const result = await Promise.race([operation(), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error(`Safe DB operation failed for ${operationName}:`, error.message);
    
    // During build/production, return fallback instead of throwing
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`Returning fallback for ${operationName} due to database error during build`);
      return fallback;
    }
    
    // During development, still throw the error for debugging
    throw error;
  }
}

// Check if we're in a build environment
export function isBuildTime(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PHASE === 'phase-production-build' ||
         process.env.NEXT_PHASE === 'phase-export';
}