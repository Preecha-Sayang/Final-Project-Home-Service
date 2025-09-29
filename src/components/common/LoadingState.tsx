import React from "react";

interface LoadingStateProps {
  message: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message, className = "" }) => (
  <div className={`text-center ${className}`}>
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

export default LoadingState;
