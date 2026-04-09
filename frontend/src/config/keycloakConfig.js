const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'siem',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'siem-frontend',
};

export default keycloakConfig;
