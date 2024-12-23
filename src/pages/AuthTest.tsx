import { useAuth } from 'react-oidc-context';

export function AuthTest() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <p>User is logged in</p>
        <p>User email: {auth.user?.profile.email}</p>
        <button onClick={() => void auth.removeUser()}>Log out</button>
      </div>
    );
  }

  return (
    <div>
      <p>Not logged in</p>
      <button onClick={() => void auth.signinRedirect()}>Log in</button>
    </div>
  );
}