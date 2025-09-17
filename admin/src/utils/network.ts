// Network utility functions to handle connectivity issues

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      // Check if it's a network-related error
      const isNetworkError = 
        error.message?.includes('QUIC_PROTOCOL_ERROR') ||
        error.message?.includes('ERR_NETWORK') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.code === 'unavailable';

      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
};

export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const waitForConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

// Wrapper for Firebase operations with retry logic
export const withRetry = <T>(operation: () => Promise<T>) => {
  return retryWithBackoff(operation, 3, 1000);
};
