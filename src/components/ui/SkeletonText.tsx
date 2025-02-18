import { useMemo } from 'react'

type SkeletonTextProps = {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export function SkeletonText({ width = '10px', height = '20px', borderRadius = '4px', className }: SkeletonTextProps) {
  const randomWidth = useMemo(() => `${Math.floor(Math.random() * 70) + 30}%`, [])

  return <div className={`inline-block bg-gray-300 animate-pulse ${className ?? ''}`} style={{ height, borderRadius, width: width ? width : randomWidth }} />
}
