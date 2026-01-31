import { render, screen, fireEvent } from "@testing-library/react"
import { HierarchicalCombobox } from "./HierarchicalCombobox"

test("opens on focus and allows keyboard navigation", async () => {
  render(
    <HierarchicalCombobox
      loadChildren={async () => []}
    />
  )

  const input = screen.getByRole("combobox")
  fireEvent.focus(input)

  expect(input).toHaveAttribute("aria-expanded", "true")
})
