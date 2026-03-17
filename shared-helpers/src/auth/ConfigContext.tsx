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
 * Supplies runtime auth configuration that differs between the public and partners apps.
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
