import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import LightLoading from '../components/loading';

export default function afterLogin(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const validateUser = async () => {
        try {
          const res = await fetch('/api/v1/validate');

          if (res.ok) {
            setLoading(false);
          } else {
            router.replace('/');
          }
        } catch (error) {
          console.error('An error occurred:', error);
          router.replace('/');
        }
      };

      validateUser();
    }, [router]);

    if (loading) {
      return <LightLoading />;
    }

    return <Component {...props} />;
  };
}
