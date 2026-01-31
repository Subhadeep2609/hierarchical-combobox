import type { Preview } from "@storybook/react"
import "../src/index.css"

const preview: Preview = {
  parameters: {
    a11y: {
      element: "#root",
      manual: false,
    },
  },
}

export default preview
