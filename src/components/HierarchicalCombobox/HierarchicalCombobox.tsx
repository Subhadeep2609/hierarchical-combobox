import { useId, useState } from "react"
import type { HierarchicalComboboxProps } from "./types"
import { useVirtualList } from "./useVirtualList"

export function HierarchicalCombobox({
  loadChildren,
  placeholder = "Select options...",
}: HierarchicalComboboxProps) {
  const inputId = useId()
  const listboxId = useId()

  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const ITEM_HEIGHT = 32
  const VIEWPORT_HEIGHT = 256

  const fakeRows = Array.from({ length: 1000 }, (_, i) => ({
    id: String(i),
    label: `Node ${i}`,
  }))

  const v = useVirtualList({
    itemCount: fakeRows.length,
    itemHeight: ITEM_HEIGHT,
    viewportHeight: VIEWPORT_HEIGHT,
    scrollTop,
  })

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={inputId} className="sr-only">
        Hierarchical combobox
      </label>

      <input
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ?? undefined}
        placeholder={placeholder}
        className="w-full border rounded-md p-2 focus:outline-none focus:ring"
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setIsOpen(true)
          if (e.key === "Escape") setIsOpen(false)
        }}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="tree"
          tabIndex={-1}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="absolute z-10 mt-1 w-full overflow-auto border rounded-md bg-white"
          style={{ height: VIEWPORT_HEIGHT }}
        >
          <div
            style={{
              height: v.totalHeight,
              position: "relative",
            }}
          >
            <div
              style={{
                transform: `translateY(${v.offsetY}px)`,
              }}
            >
              {fakeRows
                .slice(v.startIndex, v.endIndex + 1)
                .map((row) => (
                  <div
                    key={row.id}
                    className="h-8 px-2 flex items-center border-b text-sm"
                  >
                    {row.label}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
