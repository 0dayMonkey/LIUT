// src/components/SkeletonLoader.tsx
export default function SkeletonLoader({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full rounded-lg bg-gray-800 p-4 h-[84px]">
          <div className="h-6 w-3/4 rounded bg-gray-700"></div>
          <div className="mt-2 h-4 w-1/2 rounded bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
}
