'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import RegistrationPage from './components/registration';
import LoginPage from './components/login';

const API_URL = '/api/v1';

export default function Home() {
  const router = useRouter();
  const [showRegistration, setShowRegistration] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('cfin');
      const user = JSON.parse(token);

      if (user) {
        try {
          const res = await fetch(`${API_URL}/users/validate`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          const data = await res.json();

          if (data.valid) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      } else {
        try {
          const res = await fetch(`${API_URL}/initial`);
          const data = await res.json();

          setShowRegistration(data.showRegistration);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      }
    };

    fetchInitialData();
  }, []);

  if (showRegistration === null) return null;

  return showRegistration ? (
    <RegistrationPage showRegistration={showRegistration} />
  ) : (
    <LoginPage />
  );
}
