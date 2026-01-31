import { TreeNode, TreeNodeId } from "./types"

export type LoadChildren = (
  parentId: TreeNodeId | null
) => Promise<TreeNode[]>
