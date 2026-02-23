import { createContext, useContext, useReducer, useCallback } from 'react';
import { dashboardAPI } from '../api';

const CACHE_TTL_MS = 60_000; // 1 minute

const initialState = {
  summary: null,
  loading: false,
  error: null,
  fetchedAt: null,
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, fetchedAt: Date.now() };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'INVALIDATE':
      return { ...state, fetchedAt: null };
    default:
      return state;
  }
}

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const fetchSummary = useCallback(
    async (force = false) => {
      const isFresh = state.fetchedAt && Date.now() - state.fetchedAt < CACHE_TTL_MS;
      if (!force && isFresh) return; // ← skip if cached and fresh

      dispatch({ type: 'FETCH_START' });
      try {
        const data = await dashboardAPI.getSummary();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: err.message });
      }
    },
    [state.fetchedAt]
  );

  const invalidate = useCallback(() => {
    dispatch({ type: 'INVALIDATE' });
  }, []);

  return (
    <DashboardContext.Provider value={{ ...state, fetchSummary, invalidate }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}
