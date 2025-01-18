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
import { NotificationsProvider } from "@toolpad/core"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import { i18nConfig } from "./i18n/config"

initDB(DBConfig)
i18next
  .use(initReactI18next)
  .init(i18nConfig)

createRoot(/** @type {HTMLElement} */(document.getElementById("root"))).render(
  <StrictMode>
    <IndexedDB {...DBConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </ThemeProvider>
    </IndexedDB>
  </StrictMode>
)
