import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "reset-css"
import "./index.css"

import { CssBaseline, ThemeProvider } from "@mui/material"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { IndexedDB, initDB } from "react-indexed-db-hook"
import App from "./App.jsx"
import { DBConfig } from "./indexeddb/config"
import theme from "./theme.js"

initDB(DBConfig)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IndexedDB {...DBConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </IndexedDB>
  </StrictMode>
)
