import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide the offline message after coming back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-100 border border-green-400 text-green-800'
          : 'bg-red-100 border border-red-400 text-red-800'
      }`}
    >
      <div className="flex items-center space-x-3">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-600" />
        )}
        <div>
          <p className="font-medium">
            {isOnline ? 'Connection Restored' : 'No Internet Connection'}
          </p>
          <p className="text-sm">
            {isOnline
              ? 'You are back online!'
              : 'Please check your connection. Some features may not work.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
