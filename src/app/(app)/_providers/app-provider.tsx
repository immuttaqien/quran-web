"use client"

import { createContext, useContext } from "react"

interface AppContextProps {
  pageSize: number
}

const AppContext = createContext<AppContextProps>(null!)

export function useAppContext() {
  return useContext(AppContext) || {}
}

interface AppProviderProps extends React.PropsWithChildren {
  configs: AppContextProps
}

export default function AppProvider({ configs, children }: AppProviderProps) {
  return <AppContext.Provider value={configs}>{children}</AppContext.Provider>
}
