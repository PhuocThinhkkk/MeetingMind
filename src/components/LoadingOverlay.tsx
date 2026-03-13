import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

const LoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 max-w-sm mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-700 text-center font-medium">
          {loadingMessage || 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;