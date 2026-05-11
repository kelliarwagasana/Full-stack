import { createContext } from 'react'
import type { FilterAction, FilterState } from './types'

export interface StoreContextValue {
  state: FilterState
  dispatch: (action: FilterAction) => void
}

export const StoreContext = createContext<StoreContextValue | undefined>(undefined)

