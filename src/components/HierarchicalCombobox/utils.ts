import { TreeNode, TreeNodeId, TreeStore, FlatNode } from "./types"

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
