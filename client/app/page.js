'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import RegistrationPage from './components/registration';
import LoginPage from './components/login';

const API_URL = '/api/v1';

export default function Home() {
  const [showRegistration, setShowRegistration] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch(`${API_URL}/initial`);

        const data = await res.json();

        setShowRegistration(data.showRegistration);
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error('An error occurred. Please try again.');
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
