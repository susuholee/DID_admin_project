'use client';

export default function LoadingSpinner({ 
  message = "처리 중...", 
  size = "md",
  color = "rose-400",
  className = "",
  showMessage = true,
  position = "center"
}) {
  // 크기별 스타일 정의
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-6 w-6"
  };

  // 텍스트 크기별 스타일
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  // 정렬 스타일
  const positionClasses = {
    center: "justify-center",
    left: "justify-start",
    right: "justify-end"
  };

  return (
    <div className={`flex items-center gap-2 ${positionClasses[position]} ${className}`}>
      {/* 스피너 */}
      <div 
        className={`animate-spin ${sizeClasses[size]} border-2 border-${color} rounded-full border-t-transparent`}
        role="status"
        aria-label="로딩 중"
      />
      
      {/* 로딩 메시지 */}
      {showMessage && (
        <span className={`${textSizeClasses[size]} text-gray-600`}>
          {message}
        </span>
      )}
    </div>
  );
}