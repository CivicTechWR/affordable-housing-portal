import { createContext, createElement, FunctionComponent } from "react"

type ConfigContextProps = {
  storageType: "local" | "session"
  apiUrl: string
  idleTimeout: number
  appType: "partners" | "public"
}

const timeoutMinutes = parseInt(process.env.idleTimeout || process.env.IDLE_TIMEOUT || "5")
const defaultTimeout = timeoutMinutes * 60 * 1000

export const ConfigContext = createContext<ConfigContextProps>({
  storageType: "session",
  apiUrl: "",
  idleTimeout: defaultTimeout,
  appType: "public",
})

/**
 * Supplies runtime configuration to the app, including API URL, storage
 * strategy, idle timeout, and which portal (public or partners) is active.
 *
 * @param apiUrl - Base URL for backend API requests.
 * @param storageType - Whether to use "local" or "session" storage. Defaults to "session".
 * @param idleTimeout - Inactivity timeout in milliseconds. Defaults to the IDLE_TIMEOUT env var.
 * @param appType - Which portal is rendering: "public" or "partners". Defaults to "public".
 */
export const ConfigProvider: FunctionComponent<{
  apiUrl: string
  storageType?: ConfigContextProps["storageType"]
  idleTimeout?: number
  appType?: ConfigContextProps["appType"]
  children?: React.ReactNode
}> = ({
  apiUrl,
  storageType = "session",
  idleTimeout = defaultTimeout,
  appType = "public",
  children,
}) => {
  return createElement(
    ConfigContext.Provider,
    {
      value: {
        // Surface appType so downstream auth requests can opt into partner-only enforcement.
        apiUrl,
        storageType,
        idleTimeout,
        appType,
      },
    },
    children
  )
}

export default ConfigContext
