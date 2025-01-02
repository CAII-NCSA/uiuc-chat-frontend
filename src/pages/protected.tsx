import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      void router.push('/sign-in');
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>If you see this, you're authenticated!</p>
      <pre>{JSON.stringify(auth.user?.profile, null, 2)}</pre>
    </div>
  );
}