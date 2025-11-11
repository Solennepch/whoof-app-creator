import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onError } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        setIsRetrying(attempt > 0);
        
        const result = await asyncFn();
        
        setIsRetrying(false);
        setRetryCount(0);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    setIsRetrying(false);
    
    if (lastError) {
      onError?.(lastError);
      throw lastError;
    }
    
    throw new Error('Max retries reached without success');
  }, [asyncFn, maxRetries, retryDelay, onError]);

  return {
    execute: executeWithRetry,
    isRetrying,
    retryCount,
  };
}
