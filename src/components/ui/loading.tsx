import React from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = '', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-gray z-50'
    : 'flex items-center justify-center'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        {/* Three dots animation - giống như trong hình */}
        <div className="flex space-x-1.5">
          <div className={`${sizeClasses[size]} bg-white rounded-full animate-pulse`} 
               style={{ animationDelay: '0ms' }}></div>
          <div className={`${sizeClasses[size]} bg-white rounded-full animate-pulse`} 
               style={{ animationDelay: '150ms' }}></div>
          <div className={`${sizeClasses[size]} bg-white rounded-full animate-pulse`} 
               style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading text - chỉ hiển thị nếu có text */}
        {text && (
          <p className="text-gray-300 text-sm font-light">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default Loading
