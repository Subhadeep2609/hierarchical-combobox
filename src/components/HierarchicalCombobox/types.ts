export type TreeNodeId = string

export interface TreeNode {
  id: TreeNodeId
  label: string
  parentId: TreeNodeId | null
  hasChildren: boolean
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
  parentId: TreeNodeId | null
  depth: number
}

export type SelectionState =
  | "checked"
  | "unchecked"
  | "indeterminate"

export type LoadChildren = (
  parentId: TreeNodeId | null
) => Promise<TreeNode[]>

export interface HierarchicalComboboxProps {
  loadChildren: LoadChildren
  placeholder?: string
}
