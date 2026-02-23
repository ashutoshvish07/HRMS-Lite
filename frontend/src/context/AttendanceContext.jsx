import { createContext, useContext, useReducer, useCallback } from 'react';
import { attendanceAPI } from '../api';

// ── State shape ───────────────────────────────────────────────────────────────
// records cached by key: "all", "emp:EMP001", etc.
const initialState = {
  cache: {},        // { [cacheKey]: { data: [], fetchedAt: timestamp } }
  loading: false,
  error: null,
};

const CACHE_TTL_MS = 30_000; // 30 seconds — re-fetch if data is older than this

function isFresh(entry) {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function attendanceReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        cache: {
          ...state.cache,
          [action.key]: { data: action.payload, fetchedAt: Date.now() },
        },
      };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_RECORD': {
      // Invalidate all cache keys that could be affected
      const newCache = {};
      for (const key of Object.keys(state.cache)) {
        // Keep only if it's not related to this employee or "all"
        if (!key.includes('all') && !key.includes(action.payload.employee_id)) {
          newCache[key] = state.cache[key];
        }
      }
      return { ...state, cache: newCache };
    }

    case 'INVALIDATE_ALL':
      return { ...state, cache: {} };

    case 'INVALIDATE_EMPLOYEE': {
      const newCache = {};
      for (const key of Object.keys(state.cache)) {
        if (!key.includes(action.payload) && !key.startsWith('all')) {
          newCache[key] = state.cache[key];
        }
      }
      return { ...state, cache: newCache };
    }

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Build a deterministic cache key from filters
  const buildKey = (employeeId, params = {}) => {
    const base = employeeId ? `emp:${employeeId}` : 'all';
    const extras = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return extras ? `${base}?${extras}` : base;
  };

  // Fetch attendance — uses cache if fresh, otherwise hits API
  const fetchAttendance = useCallback(
    async (employeeId = '', params = {}, force = false) => {
      const key = buildKey(employeeId, params);
      const cached = state.cache[key];

      if (!force && isFresh(cached)) return cached.data; // ← return cached data

      dispatch({ type: 'FETCH_START' });
      try {
        let data;
        if (employeeId) {
          data = await attendanceAPI.getByEmployee(employeeId, params);
        } else {
          data = await attendanceAPI.getAll(params);
        }
        dispatch({ type: 'FETCH_SUCCESS', key, payload: data });
        return data;
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: err.message });
        throw err;
      }
    },
    [state.cache]
  );

  // Get cached data for a key (for rendering without re-fetch)
  const getCached = useCallback(
    (employeeId = '', params = {}) => {
      const key = buildKey(employeeId, params);
      return state.cache[key]?.data || null;
    },
    [state.cache]
  );

  const markAttendance = useCallback(async (form) => {
    const record = await attendanceAPI.mark(form);
    // Invalidate cache for this employee and "all" views
    dispatch({ type: 'ADD_RECORD', payload: record });
    return record;
  }, []);

  const invalidateAll = useCallback(() => {
    dispatch({ type: 'INVALIDATE_ALL' });
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        ...state,
        fetchAttendance,
        getCached,
        markAttendance,
        invalidateAll,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider');
  return ctx;
}
