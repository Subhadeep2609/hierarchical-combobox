import { useId, useState } from "react";
import type { HierarchicalComboboxProps } from "./types";

export function HierarchicalCombobox({
  loadChildren,
  placeholder = "Select options...",
}: HierarchicalComboboxProps) {
  const inputId = useId();
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            setIsOpen(true);
          }
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="tree"
          tabIndex={-1}
          className="absolute z-10 mt-1 w-full max-h-64 overflow-auto border rounded-md bg-white"
        >
          {/* Tree rows will be rendered here */}
          <div className="p-2 text-sm text-slate-500">Loading…</div>
        </div>
      )}
    </div>
  );
}
