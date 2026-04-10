import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  roles: [],
  initialized: false,
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

      // Persist to localStorage
      if (token) {
        localStorage.setItem('siem_auth_token', token);
        localStorage.setItem('siem_auth_user', JSON.stringify(user));
        localStorage.setItem('siem_auth_roles', JSON.stringify(roles));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.roles = [];
      state.initialized = true;
      
      // Clear localStorage
      localStorage.removeItem('siem_auth_token');
      localStorage.removeItem('siem_auth_user');
      localStorage.removeItem('siem_auth_roles');
    },
  },
});

export const { setAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
