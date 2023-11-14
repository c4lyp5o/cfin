'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import RegistrationPage from './components/registration';
import LoginPage from './components/login';

export default function Home() {
  const router = useRouter();

  const [showRegistration, setShowRegistration] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('cfin');
    const user = JSON.parse(token);
    if (user) {
      fetch('/api/v1/users/validate', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          switch (data.valid) {
            case true:
              return router.push('/dashboard');
            default:
              break;
          }
        });
    } else {
      console.log('no token');
    }
    fetch('/api/v1/initial')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        switch (data.showRegistration) {
          case true:
            setShowRegistration(true);
            break;
          default:
            setShowRegistration(false);
            break;
        }
      });
  }, []);

  if (showRegistration === null) return null;

  if (showRegistration === true) {
    return <RegistrationPage />;
  } else {
    return <LoginPage />;
  }
}
