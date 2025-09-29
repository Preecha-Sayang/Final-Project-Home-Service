import React from "react";

interface ErrorStateProps {
  message: string;
  title?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  title = "เกิดข้อผิดพลาด",
  className = "" 
}) => (
  <div className={`text-center ${className}`}>
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-red-800 mb-2">{title}</h2>
      <p className="text-red-600">{message}</p>
    </div>
  </div>
);

export default ErrorState;
