import { useMemo } from "react"

interface VirtualListParams {
  itemCount: number
  itemHeight: number
  viewportHeight: number
  scrollTop: number
}

interface VirtualListResult {
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
}

export function useVirtualList({
  itemCount,
  itemHeight,
  viewportHeight,
  scrollTop,
}: VirtualListParams): VirtualListResult {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const visibleCount = Math.ceil(viewportHeight / itemHeight)

  const endIndex = Math.min(
    itemCount - 1,
    startIndex + visibleCount + 1
  )

  const offsetY = startIndex * itemHeight
  const totalHeight = itemCount * itemHeight

  return useMemo(
    () => ({
      startIndex,
      endIndex,
      offsetY,
      totalHeight,
    }),
    [startIndex, endIndex, offsetY, totalHeight]
  )
}
