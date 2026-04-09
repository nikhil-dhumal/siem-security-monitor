import { useEffect, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { useDispatch } from 'react-redux';
import { setAuthState, logout } from '../features/auth/authSlice';
import keycloakConfig from '../config/keycloakConfig';

const kc = new Keycloak(keycloakConfig); // singleton — never recreated
export { kc as keycloak };

const KeycloakProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    kc.init({
      onLoad: 'check-sso',       // silently handles the post-redirect token exchange
      checkLoginIframe: false,   // avoids iframe redirect loops
      pkceMethod: 'S256',
    }).then((authenticated) => {
      if (authenticated) {
        const profile = kc.tokenParsed || {};
        const roles = profile.realm_access?.roles || [];
        localStorage.setItem('actkn', kc.token);
        dispatch(setAuthState({ user: profile, token: kc.token, roles }));

        // Auto-refresh token before it expires
        kc.onTokenExpired = () => {
          kc.updateToken(60).then((refreshed) => {
            if (refreshed) {
              localStorage.setItem('actkn', kc.token);
              dispatch(setAuthState({
                user: kc.tokenParsed,
                token: kc.token,
                roles: kc.tokenParsed?.realm_access?.roles || [],
              }));
            }
          }).catch(() => {
            dispatch(logout());
            localStorage.removeItem('actkn');
          });
        };
      } else {
        dispatch(logout()); // sets initialized: true, isAuthenticated: false
      }
    }).catch(() => {
      dispatch(logout());
    });
  }, [dispatch]);

  return children;
};

export default KeycloakProvider;