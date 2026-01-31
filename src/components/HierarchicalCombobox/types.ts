export type TreeNodeId = string

export interface TreeNode {
  id: TreeNodeId
  label: string

  // structure
  parentId: TreeNodeId | null
  hasChildren: boolean

  // async state
  isLoading?: boolean
  isError?: boolean
}

export type TreeStore = {
  nodes: Record<TreeNodeId, TreeNode>
  childrenMap: Record<TreeNodeId, TreeNodeId[]>
  rootIds: TreeNodeId[]
}

export interface FlatNode {
  id: TreeNodeId
  depth: number
  parentId: TreeNodeId | null
}

export type SelectionState =
  | "checked"
  | "unchecked"
  | "indeterminate"


export interface HierarchicalComboboxProps {
  loadChildren: LoadChildren
  placeholder?: string
}

