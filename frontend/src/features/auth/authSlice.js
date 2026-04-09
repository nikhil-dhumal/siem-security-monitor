import { createSlice } from '@reduxjs/toolkit';

const DEV_ROLES = {
  viewer: {
    name: 'Viewer User',
    roles: ['viewer'],
  },
  rule_admin: {
    name: 'Rule Admin User',
    roles: ['viewer', 'rule_admin'],
  },
  simulator: {
    name: 'Simulator User',
    roles: ['viewer', 'simulator'],
  },
  all: {
    name: 'Full Access User',
    roles: ['viewer', 'simulator', 'rule_admin'],
  },
};

const devRole = sessionStorage.getItem('devRole') || 'viewer';
const devUser = DEV_ROLES[devRole];

const initialState = {
  isAuthenticated: true,
  user: { name: devUser.name },
  token: 'dev-token',
  roles: devUser.roles,
  initialized: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      const { user, token, roles } = action.payload;
      state.isAuthenticated = Boolean(token);
      state.user = user;
      state.token = token;
      state.roles = roles || [];
      state.initialized = true;
    },
    setDevRole: (state, action) => {
      const role = action.payload;
      if (DEV_ROLES[role]) {
        sessionStorage.setItem('devRole', role);
        const devUser = DEV_ROLES[role];
        state.user = { name: devUser.name };
        state.roles = devUser.roles;
      }
    },
    logout: (state) => {
      sessionStorage.removeItem('devRole');
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = [];
      state.initialized = true;
    },
  },
});

export const { setAuthState, setDevRole, logout } = authSlice.actions;
export default authSlice.reducer;
