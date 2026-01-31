import { useEffect, useId, useMemo, useState } from "react"
import type {
  HierarchicalComboboxProps,
  TreeNodeId,
  FlatNode,
} from "./types"
import { useVirtualList } from "./useVirtualList"
import {
  buildInitialStore,
  addNodes,
  flattenTree,
  toggleSelection,
  getSelectionState,
  findMatchingIds,
  buildSearchExpandedSet,
  filterFlatNodes,
} from "./utils"

export function HierarchicalCombobox({
  loadChildren,
  placeholder = "Select options...",
}: HierarchicalComboboxProps) {
  const inputId = useId()
  const listboxId = useId()

  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<TreeNodeId | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [search, setSearch] = useState("")

  const [store, setStore] = useState(buildInitialStore)
  const [expanded, setExpanded] = useState<Set<TreeNodeId>>(new Set())
  const [selected, setSelected] = useState<Set<TreeNodeId>>(new Set())

  const ITEM_HEIGHT = 32
  const VIEWPORT_HEIGHT = 256

  useEffect(() => {
    loadChildren(null).then((nodes) => {
      setStore((s) => addNodes(s, null, nodes))
    })
  }, [loadChildren])

  const searchMatches = useMemo(
    () => (search ? findMatchingIds(store, search) : null),
    [store, search]
  )

  const searchExpanded = useMemo(
    () =>
      searchMatches
        ? buildSearchExpandedSet(store, searchMatches)
        : expanded,
    [store, searchMatches, expanded]
  )

  const flatNodes: FlatNode[] = useMemo(() => {
    const result: FlatNode[] = []
    flattenTree(store, searchExpanded, null, 0, result)
    return searchMatches
      ? filterFlatNodes(
          result,
          new Set([...searchMatches, ...searchExpanded])
        )
      : result
  }, [store, searchExpanded, searchMatches])

  const v = useVirtualList({
    itemCount: flatNodes.length,
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
        onChange={(e) => setSearch(e.target.value)}
        value={search}
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
          <div style={{ height: v.totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${v.offsetY}px)` }}>
              {flatNodes
                .slice(v.startIndex, v.endIndex + 1)
                .map((node) => {
                  const data = store.nodes[node.id]
                  const isExpanded = search
                    ? true
                    : expanded.has(node.id)
                  const state = getSelectionState(
                    store,
                    selected,
                    node.id
                  )

                  return (
                    <div
                      key={node.id}
                      id={node.id}
                      role="treeitem"
                      aria-expanded={
                        data.hasChildren ? isExpanded : undefined
                      }
                      aria-checked={state !== "unchecked"}
                      className="h-8 flex items-center text-sm px-2 cursor-pointer"
                      style={{ paddingLeft: node.depth * 16 }}
                      onMouseEnter={() => setActiveId(node.id)}
                    >
                      <input
                        type="checkbox"
                        checked={state === "checked"}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              state === "indeterminate"
                        }}
                        onChange={() =>
                          setSelected((s) =>
                            toggleSelection(store, s, node.id)
                          )
                        }
                        className="mr-2"
                      />

                      {data.hasChildren && !search && (
                        <span
                          className="mr-1 text-xs"
                          onClick={() => {
                            setExpanded((prev) => {
                              const next = new Set(prev)
                              next.has(node.id)
                                ? next.delete(node.id)
                                : next.add(node.id)
                              return next
                            })
                          }}
                        >
                          {isExpanded ? "▾" : "▸"}
                        </span>
                      )}

                      {data.label}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
