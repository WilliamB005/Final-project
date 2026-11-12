import { createContext, useContext } from 'react';

// Kept separate from AuthContext.jsx so that file only exports a component (needed for React fast refresh)
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
