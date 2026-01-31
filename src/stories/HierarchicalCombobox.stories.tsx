import type { Meta, StoryObj } from "@storybook/react"
import { HierarchicalCombobox } from "../components/HierarchicalCombobox/HierarchicalCombobox"
import type { TreeNode } from "../components/HierarchicalCombobox/types"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const mockTree: Record<string | null, TreeNode[]> = {
  null: [
    { id: "a", label: "Fruits", parentId: null, hasChildren: true },
    { id: "b", label: "Vegetables", parentId: null, hasChildren: true },
  ],
  a: [
    { id: "a1", label: "Apple", parentId: "a", hasChildren: false },
    { id: "a2", label: "Banana", parentId: "a", hasChildren: false },
  ],
  b: [
    { id: "b1", label: "Carrot", parentId: "b", hasChildren: false },
    { id: "b2", label: "Potato", parentId: "b", hasChildren: false },
  ],
}

const loader = async (parentId: string | null) => {
  await delay(500)
  return mockTree[parentId] ?? []
}

const meta: Meta<typeof HierarchicalCombobox> = {
  component: HierarchicalCombobox,
  parameters: {
    a11y: { disable: false },
  },
}
export default meta

export const Default: StoryObj = {
  args: { loadChildren: loader },
}

export const LoadingState: StoryObj = {
  args: {
    loadChildren: async (id) => {
      await delay(2000)
      return loader(id)
    },
  },
}

export const EmptyState: StoryObj = {
  args: {
    loadChildren: async () => [],
  },
}

export const KeyboardOnly: StoryObj = {
  args: { loadChildren: loader },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector("input")?.focus()
  },
}
