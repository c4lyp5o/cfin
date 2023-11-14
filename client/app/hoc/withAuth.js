'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const validateUser = async () => {
        let token = localStorage.getItem('cfin');
        let user = null;

        if (token) {
          try {
            user = JSON.parse(token);
          } catch (err) {
            console.error('Error parsing token:', err);
          }
        }

        if (!user) {
          router.replace('/');
        } else {
          try {
            const res = await fetch('/api/v1/users/validate', {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            const data = await res.json();

            if (data.valid) {
              setLoading(false);
            } else {
              router.replace('/');
            }
          } catch (error) {
            console.error('An error occurred:', error);
          }
        }
      };

      validateUser();
    }, [router]);

    if (loading) return null;

    return <Component {...props} />;
  };
}
