import { HierarchicalCombobox } from "./components/HierarchicalCombobox/HierarchicalCombobox"
import type { TreeNode } from "./components/HierarchicalCombobox/types"

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

export default function App() {
  return (
    <div className="min-h-screen flex items-start justify-center p-8 bg-slate-50">
      <HierarchicalCombobox
        loadChildren={async (parentId) => {
          await new Promise((r) => setTimeout(r, 300))
          return mockTree[parentId] ?? []
        }}
      />
    </div>
  )
}
