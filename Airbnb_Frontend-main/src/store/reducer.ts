import type { FilterAction, FilterState } from './types'
import { initialFilterState } from './types'

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
      }
    case 'SET_TYPE':
      return {
        ...state,
        type: action.payload,
      }
    case 'RESET':
      return initialFilterState
    default:
      return state
  }
}

