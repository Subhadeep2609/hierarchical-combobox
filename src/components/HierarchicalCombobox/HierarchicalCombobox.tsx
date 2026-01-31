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
  const [loading, setLoading] = useState<Set<TreeNodeId>>(new Set())

  const ITEM_HEIGHT = 32
  const VIEWPORT_HEIGHT = 256

  // Load root nodes
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

  const expandNode = async (id: TreeNodeId) => {
    if (store.childrenMap[id] || loading.has(id)) return

    setLoading((s) => new Set(s).add(id))
    const children = await loadChildren(id)
    setStore((s) => addNodes(s, id, children))
    setExpanded((s) => new Set(s).add(id))
    setLoading((s) => {
      const next = new Set(s)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="relative w-full max-w-md text-[var(--color-text)]">
      <label htmlFor={inputId} className="sr-only">
        Hierarchical combobox
      </label>

      {/* Input */}
      <input
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ?? undefined}
        placeholder={placeholder}
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full rounded-md border border-[var(--color-border)]
          bg-[var(--color-bg)] px-3 py-2 text-sm
          placeholder:text-[var(--color-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        "
      />

      {/* Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="tree"
          tabIndex={-1}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{ height: VIEWPORT_HEIGHT }}
          className="
            absolute z-10 mt-2 w-full overflow-auto
            rounded-md border border-[var(--color-border)]
            bg-[var(--color-bg)] shadow-lg
          "
        >
          <div style={{ height: v.totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${v.offsetY}px)` }}>
              <div className="p-1">
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
                        onMouseEnter={() => setActiveId(node.id)}
                        style={{ paddingLeft: node.depth * 20 }}
                        className="
                          h-8 flex items-center text-sm
                          rounded px-2 cursor-pointer
                          hover:bg-slate-100
                          focus:bg-slate-100
                        "
                      >
                        {/* Checkbox */}
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
                          className="
                            mr-2 h-4 w-4 rounded border border-slate-300
                            text-[var(--color-primary)]
                            focus:ring-[var(--color-primary)]
                          "
                        />

                        {/* Expand button */}
                        {data.hasChildren && !search && (
                          <button
                            type="button"
                            className="
                              mr-1 text-xs text-slate-500
                              hover:text-slate-800
                              focus:outline-none
                            "
                            onClick={() =>
                              isExpanded
                                ? setExpanded((s) => {
                                    const next = new Set(s)
                                    next.delete(node.id)
                                    return next
                                  })
                                : expandNode(node.id)
                            }
                          >
                            {loading.has(node.id)
                              ? "⏳"
                              : isExpanded
                              ? "▾"
                              : "▸"}
                          </button>
                        )}

                        {/* Label */}
                        <span>{data.label}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
