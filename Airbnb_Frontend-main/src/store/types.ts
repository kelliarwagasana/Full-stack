export type FilterAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_TYPE'; payload: 'ALL' | 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN' }
  | { type: 'RESET' }

export interface FilterState {
  query: string
  type: 'ALL' | 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'
}

export const initialFilterState: FilterState = {
  query: '',
  type: 'ALL',
}

