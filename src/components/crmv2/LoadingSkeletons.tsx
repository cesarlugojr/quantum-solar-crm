export function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-8 w-20 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="h-6 w-48 bg-gray-700 rounded mb-6 animate-pulse"></div>
      <div className="h-64 bg-gray-800/50 rounded animate-pulse flex items-center justify-center">
        <div className="text-gray-600">Loading chart...</div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-800 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-800 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-6"
            >
              <div className="h-5 w-24 bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
