'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('cfin');
      const user = JSON.parse(token);

      if (!user) {
        router.replace('/');
      } else {
        fetch('/api/v1/users/validate', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.valid) {
              setLoading(false);
            } else {
              router.replace('/');
            }
          });
      }
    }, [router]);

    if (loading) return null;

    return <Component {...props} />;
  };
}
