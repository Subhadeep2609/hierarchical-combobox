import type { Meta, StoryObj } from "@storybook/react"
import { HierarchicalCombobox } from "../components/HierarchicalCombobox/HierarchicalCombobox"
import type { TreeNode } from "../components/HierarchicalCombobox/types"

const mockLoader = async (parentId: string | null): Promise<TreeNode[]> => {
  await new Promise(r => setTimeout(r, 500))

  return parentId === null
    ? [{ id: "1", label: "Root", parentId: null, hasChildren: true }]
    : [{ id: "1-1", label: "Child", parentId, hasChildren: false }]
}

const meta: Meta<typeof HierarchicalCombobox> = {
  component: HierarchicalCombobox,
}
export default meta

export const ShellOnly: StoryObj = {
  args: {
    loadChildren: mockLoader,
  },
}
