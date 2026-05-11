import { useReducer, type ReactNode } from 'react'
import { filterReducer } from './reducer'
import { StoreContext } from './storeContextCore'
import { initialFilterState } from './types'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState)

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

