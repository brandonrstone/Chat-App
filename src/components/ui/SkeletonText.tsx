type SkeletonTextProps = {
  height?: string
  borderRadius?: string
  className?: string
}

export function SkeletonText({ height = '20px', borderRadius = '4px', className }: SkeletonTextProps) {
  return <div className={`bg-gray-300 animate-pulse ${className ?? ''}`} style={{ height, borderRadius }} />
}