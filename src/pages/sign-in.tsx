import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SignInPage() {
    const auth = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (auth.isAuthenticated) {
        void router.push('/');
      }
    }, [auth.isAuthenticated, router]);
  
    const handleSignIn = async () => {
      try {
        await auth.signinRedirect();
      } catch (error) {
        console.error('Sign-in error:', error);
      }
    };
  
    if (auth.isLoading) {
      return <div>Loading...</div>;
    }
  
    if (auth.error) {
      return <div>Oops... {auth.error.message}</div>;
    }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#0E1116]">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Sign In
        </h1>
        <button
          onClick={handleSignIn}
          className="rounded-xl bg-white/10 px-10 py-3 font-semibold text-white hover:bg-white/20"
        >
          Sign in with Keycloak
        </button>
      </div>
    </main>
  );
}