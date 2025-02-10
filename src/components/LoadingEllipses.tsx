export const LoadingEllipsis = () => (
  <div className='flex space-x-1' >
    <span className='w-2 h-2 bg-gray-300 rounded-full animate-pulse' style={{ animationDelay: '0s' }}></span>
    <span className='w-2 h-2 bg-gray-300 rounded-full animate-pulse' style={{ animationDelay: '0.2s' }}></span>
    <span className='w-2 h-2 bg-gray-300 rounded-full animate-pulse' style={{ animationDelay: '0.4s' }}></span>
  </div>
)
