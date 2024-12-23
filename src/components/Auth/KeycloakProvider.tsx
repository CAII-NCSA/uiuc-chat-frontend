import { AuthProvider } from 'react-oidc-context';
import { ReactNode, useEffect, useState } from 'react';

interface KeycloakProviderProps {
  children: ReactNode;
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [oidcConfig, setOidcConfig] = useState<any>(null);

  useEffect(() => {
    // Only set the config on the client side
    setOidcConfig({
      authority: process.env.NEXT_PUBLIC_KEYCLOAK_URL + '/realms/' + process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      redirect_uri: window.location.origin,
      onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }, []);

  // Don't render the AuthProvider until we have the config
  if (!oidcConfig) {
    return <>{children}</>;
  }

  return (
    <AuthProvider {...oidcConfig}>
      {children}
    </AuthProvider>
  );
}