import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthState, logout } from '../features/auth/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      // Check if user is already logged in
      const token = localStorage.getItem('siem_auth_token');
      const userStr = localStorage.getItem('siem_auth_user');
      const rolesStr = localStorage.getItem('siem_auth_roles');

      if (token && userStr && rolesStr) {
        try {
          const user = JSON.parse(userStr);
          const roles = JSON.parse(rolesStr);
          
          dispatch(setAuthState({ user, token, roles }));
          return;
        } catch (parseError) {
          console.error('✗ Parse error:', parseError);
          console.error('Failed to parse:', { userStr, rolesStr });
        }
      } else {
        dispatch(logout());
      }
    } catch (error) {
      console.error('✗ AuthProvider error:', error);
      dispatch(logout());
    }
  }, [dispatch]);

  return children;
};

export default AuthProvider;
