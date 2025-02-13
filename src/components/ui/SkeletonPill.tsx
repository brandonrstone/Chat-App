export function SkeletonPill({ width }: { width: string }) {
  return <div className={`inline-flex h-7 ${width} px-2.5 py-0.5 m-0.5 rounded-full bg-gray-300 animate-pulse flex-shrink-0`} />
}