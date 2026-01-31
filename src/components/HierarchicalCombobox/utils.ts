import {
  TreeNode,
  TreeNodeId,
  TreeStore,
  FlatNode,
  SelectionState,
} from "./types"

export function buildInitialStore(): TreeStore {
  return {
    nodes: {},
    childrenMap: {},
    rootIds: [],
  }
}

export function addNodes(
  store: TreeStore,
  parentId: TreeNodeId | null,
  nodes: TreeNode[]
): TreeStore {
  const next = { ...store }

  for (const node of nodes) {
    next.nodes[node.id] = node
  }

  if (parentId === null) {
    next.rootIds = nodes.map((n) => n.id)
  } else {
    next.childrenMap[parentId] = nodes.map((n) => n.id)
  }

  return next
}

export function flattenTree(
  store: TreeStore,
  expanded: Set<TreeNodeId>,
  parentId: TreeNodeId | null,
  depth: number,
  result: FlatNode[]
) {
  const ids =
    parentId === null ? store.rootIds : store.childrenMap[parentId] ?? []

  for (const id of ids) {
    result.push({ id, parentId, depth })

    if (expanded.has(id)) {
      flattenTree(store, expanded, id, depth + 1, result)
    }
  }
}

/* =======================
   Selection logic
======================= */

export function getDescendants(
  store: TreeStore,
  id: TreeNodeId,
  result: TreeNodeId[] = []
) {
  const children = store.childrenMap[id] ?? []
  for (const child of children) {
    result.push(child)
    getDescendants(store, child, result)
  }
  return result
}

export function getSelectionState(
  store: TreeStore,
  selected: Set<TreeNodeId>,
  id: TreeNodeId
): SelectionState {
  const children = store.childrenMap[id]

  if (!children || children.length === 0) {
    return selected.has(id) ? "checked" : "unchecked"
  }

  let checked = 0
  for (const child of children) {
    const state = getSelectionState(store, selected, child)
    if (state === "checked") checked++
    if (state === "indeterminate") return "indeterminate"
  }

  if (checked === 0) return "unchecked"
  if (checked === children.length) return "checked"
  return "indeterminate"
}

export function toggleSelection(
  store: TreeStore,
  selected: Set<TreeNodeId>,
  id: TreeNodeId
): Set<TreeNodeId> {
  const next = new Set(selected)
  const descendants = getDescendants(store, id)

  const shouldSelect = !next.has(id)

  if (shouldSelect) {
    next.add(id)
    descendants.forEach((d) => next.add(d))
  } else {
    next.delete(id)
    descendants.forEach((d) => next.delete(d))
  }

  return next
}

/* =======================
   Search with ancestry
======================= */

export function findMatchingIds(
  store: TreeStore,
  query: string
): Set<TreeNodeId> {
  const q = query.toLowerCase()
  const matches = new Set<TreeNodeId>()

  for (const id in store.nodes) {
    if (store.nodes[id].label.toLowerCase().includes(q)) {
      matches.add(id)
    }
  }

  return matches
}

export function collectAncestors(
  store: TreeStore,
  id: TreeNodeId,
  result: Set<TreeNodeId>
) {
  const parent = store.nodes[id]?.parentId
  if (!parent) return
  result.add(parent)
  collectAncestors(store, parent, result)
}

export function buildSearchExpandedSet(
  store: TreeStore,
  matches: Set<TreeNodeId>
): Set<TreeNodeId> {
  const expanded = new Set<TreeNodeId>()

  matches.forEach((id) => {
    collectAncestors(store, id, expanded)
  })

  return expanded
}

export function filterFlatNodes(
  flat: FlatNode[],
  allowed: Set<TreeNodeId>
): FlatNode[] {
  return flat.filter((n) => allowed.has(n.id))
}
