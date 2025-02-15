'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/Loading';
import CallbackRoute from '@/app/auth/callback'; // ✅ Import the server action

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition(); // ✅ Use transition for async actions

  useEffect(() => {
    const processOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        router.push('/error?message=Missing OAuth code or state');
        return;
      }

      startTransition(async () => {
        try {
          const success = await CallbackRoute(code, state); // ✅ Call the server action directly
          if (success) {
            router.push('/');
          } else {
            router.push('/error?message=OAuth process failed');
          }
        } catch (error) {
          console.error('OAuth Error:', error);
          router.push('/error?message=OAuth process failed');
        }
      });
    };

    processOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading title="Processing Login..." description="Please wait while we authenticate your account." />
    </div>
  );
};

export default CallbackPage;
