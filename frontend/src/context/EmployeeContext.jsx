import { createContext, useContext, useReducer, useCallback } from 'react';
import { employeeAPI } from '../api';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  employees: [],
  loading: false,
  error: null,
  fetched: false,   // true once loaded — prevents re-fetch on tab revisit
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function employeeReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, employees: action.payload, fetched: true };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_EMPLOYEE':
      return { ...state, employees: [action.payload, ...state.employees] };

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(
          (e) => e.employee_id !== action.payload
        ),
      };

    // Force a fresh fetch next time (e.g. after attendance changes affect counts)
    case 'INVALIDATE':
      return { ...state, fetched: false };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [state, dispatch] = useReducer(employeeReducer, initialState);

  // Fetch only if not already fetched (cached)
  const fetchEmployees = useCallback(
    async (force = false) => {
      if (state.fetched && !force) return; // ← skip if already cached
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await employeeAPI.getAll();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: err.message });
      }
    },
    [state.fetched]
  );

  const addEmployee = useCallback(async (form) => {
    const emp = await employeeAPI.create(form);
    dispatch({ type: 'ADD_EMPLOYEE', payload: emp });
    return emp;
  }, []);

  const deleteEmployee = useCallback(async (employee_id) => {
    await employeeAPI.delete(employee_id);
    dispatch({ type: 'DELETE_EMPLOYEE', payload: employee_id });
  }, []);

  const invalidate = useCallback(() => {
    dispatch({ type: 'INVALIDATE' });
  }, []);

  return (
    <EmployeeContext.Provider
      value={{ ...state, fetchEmployees, addEmployee, deleteEmployee, invalidate }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used inside EmployeeProvider');
  return ctx;
}
